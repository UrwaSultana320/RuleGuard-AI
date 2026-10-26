import { test, expect } from "@playwright/test";
import { editorialReport, editorialSources } from "../fixtures/editorial";

test("streamed retries and fallback stay on the loading screen until a complete result", async ({ page }) => {
  await page.route("**/*", route =>
    ["localhost", "127.0.0.1"].includes(new URL(route.request().url()).hostname)
      ? route.continue() : route.abort());
  await page.addInitScript(({ sources, report }) => {
    const original = window.fetch.bind(window);
    window.fetch = async (input, init) => {
      if (input !== "/api/compare" || !(init?.body instanceof FormData)) return original(input, init);
      const revision = Number(init.body.get("inputRevision"));
      const requestId = String(init.body.get("requestId"));
      const stream = new ReadableStream({
        start(controller) {
          const emit = (event: object) => controller.enqueue(new TextEncoder().encode(JSON.stringify({ ...event, revision, requestId }) + "\n"));
          emit({ type: "stage", stage: 1 });
          emit({ type: "sources", sources });
          emit({ type: "provider_progress", progress: { phase: "retry", attempt: 2, delayMs: 2125 } });
          (window as typeof window & { advanceRetry: (finish: boolean) => void }).advanceRetry = finish => {
            if (!finish) emit({ type: "provider_progress", progress: { phase: "fallback", attempt: 1, delayMs: 0 } });
            else {
              emit({ type: "result", report: { ...report, revision } });
              controller.close();
            }
          };
        },
      });
      return new Response(stream, { headers: { "Content-Type": "application/x-ndjson" } });
    };
  }, { sources: editorialSources, report: editorialReport(0) });
  await page.goto("/");
  await page.getByRole("button", { name: "Try a live example", exact: true }).click();
  await expect(page.locator(".progress")).toContainText("The AI service is busy, retrying...");
  await expect(page.locator(".progress")).toContainText("Retry 2 of 3");
  await expect(page.getByRole("button", { name: "Processing…" })).toBeDisabled();
  await expect(page).toHaveURL("/");
  await page.evaluate(() => (window as typeof window & { advanceRetry: (finish: boolean) => void }).advanceRetry(false));
  await expect(page.locator(".progress")).toContainText("trying the configured fallback...");
  await page.evaluate(() => (window as typeof window & { advanceRetry: (finish: boolean) => void }).advanceRetry(true));
  await expect(page).toHaveURL("/results");
  await expect(page.locator(".finding")).toHaveCount(4);
  await expect(page.locator(".progress")).toHaveCount(0);
});
