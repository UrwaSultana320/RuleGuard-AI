import { test as base, expect } from "@playwright/test";
import { createServer, type ViteDevServer } from "vite";
import path from "node:path";

export { expect };

export const test = base.extend<{
  mockGeminiUnavailable: () => Promise<void>;
}>({
  mockGeminiUnavailable: async ({ page }, provide) => {
    let server: ViteDevServer | undefined;
    await provide(async () => {
      // A separate module graph keeps the provider mock local to this test.
      // Run the production POST handler and extraction, rather than canned
      // source events, without touching process.env or the running Next server.
      server = await createServer({
        configFile: false,
        server: { middlewareMode: true, hmr: false },
        optimizeDeps: { noDiscovery: true, entries: [] },
        resolve: { alias: { "@": path.resolve("src") } },
        plugins: [{
          name: "test-only-gemini-unavailable",
          enforce: "pre",
          load(id) {
            if (id.replaceAll("\\", "/").endsWith("/src/server/gemini.ts")) {
              return `
                export const hasGeminiKey = () => false;
                export const missingGeminiConfiguration = () =>
                  "AI analysis is unavailable because this server is not configured. Your extracted sources are available to inspect.";
                export const analyze = () => {
                  throw new Error("Gemini must not be called in this test");
                };
              `;
            }
          },
        }],
      });
      const { POST } = await server.ssrLoadModule("/src/app/api/compare/route.ts");
      await page.addInitScript(() => {
        const fetch = window.fetch.bind(window);
        window.fetch = async (input, init) => {
          if (typeof input === "string" && input === "/api/compare" && init?.body instanceof FormData) {
            // Chromium omits disk-backed file bytes from intercepted multipart
            // requests. Materialize the same request so real PDF uploads reach POST.
            const request = new Request(new URL(input, location.href), init);
            return fetch(request.url, {
              ...init,
              headers: request.headers,
              body: await request.arrayBuffer(),
            });
          }
          return fetch(input, init);
        };
      });
      await page.route("**/api/compare", async (route) => {
        const request = route.request();
        const headers = new Headers(await request.allHeaders());
        // Fetch supplies Host on the wire; a constructed Request does not.
        headers.set("host", new URL(request.url()).host);
        const response: Response = await POST(new Request(request.url(), {
          method: request.method(),
          headers,
          body: new Uint8Array(request.postDataBuffer()!),
        }));
        await route.fulfill({
          status: response.status,
          headers: Object.fromEntries(response.headers),
          body: await response.text(),
        });
      });
    });
    await server?.close();
  },
});
