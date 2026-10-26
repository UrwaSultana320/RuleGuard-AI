import { readFile } from "node:fs/promises";
import { test, expect } from "@playwright/test";
import { editorialReport, editorialSources } from "../fixtures/editorial";

test("built-in example shows saved notice; manually uploading identical samples removes eligibility", async ({ page }) => {
  await page.route("**/*", route => ["localhost", "127.0.0.1"].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
  let calls = 0;
  await page.route("**/api/compare", async route => {
    calls++;
    const body = route.request().postDataBuffer()!.toString();
    expect(body.includes('name="exampleOrigin"')).toBe(calls === 1);
    const requestId = /name="requestId"\r\n\r\n([^\r]+)/.exec(body)![1];
    const revision = Number(/name="inputRevision"\r\n\r\n([^\r]+)/.exec(body)![1]);
    const report = editorialReport(revision);
    // Explicit offline transport fixture: actual cache lookup and verification
    // are exercised in example-cache-route.test.ts with real sample extraction.
    if (calls === 1) report.savedExample = true;
    await route.fulfill({ contentType: "application/x-ndjson", body:
      [{ type: "sources", sources: editorialSources }, { type: "result", report }]
        .map(event => JSON.stringify({ ...event, revision, requestId })).join("\n") + "\n" });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Try a live example", exact: true }).click();
  await expect(page).toHaveURL("/results");
  await expect(page.getByRole("status")).toContainText("Showing a saved result for this example.");
  await page.getByRole("link", { name: "Edit inputs" }).click();
  await page.locator("#file-0").setInputFiles({ name: "Synthetic-policy-A.txt", mimeType: "text/plain", buffer: await readFile("public/samples/synthetic-A.txt") });
  await page.getByRole("button", { name: "Run Comparison Again", exact: true }).click();
  await page.getByRole("button", { name: "View preliminary comparison", exact: true }).click();
  await expect(page).toHaveURL("/results");
  await expect(page.locator(".saved-example-notice")).toHaveCount(0);
  expect(calls).toBe(2);
});

test("the sample-loader action preserves explicit built-in origin for comparison", async ({ page }) => {
  await page.route("**/*", route => ["localhost", "127.0.0.1"].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
  let marked = false;
  await page.route("**/api/compare", async route => {
    marked = route.request().postDataBuffer()!.toString().includes('name="exampleOrigin"\r\n\r\nbuilt-in-synthetic');
    const body = route.request().postDataBuffer()!.toString();
    const requestId = /name="requestId"\r\n\r\n([^\r]+)/.exec(body)![1];
    const revision = Number(/name="inputRevision"\r\n\r\n([^\r]+)/.exec(body)![1]);
    await route.fulfill({ contentType: "application/x-ndjson", body: JSON.stringify({ type: "error", code: "PROVIDER_UNAVAILABLE", message: "Offline test: service unavailable.", requestId, revision }) + "\n" });
  });
  await page.goto("/");
  await page.getByRole("radio", { name: /^Master's/ }).check();
  await page.getByRole("button", { name: "Use synthetic samples" }).click();
  await expect(page.getByLabel("Intended program")).toHaveValue(/Artificial Intelligence/);
  await page.getByRole("checkbox", { name: /I'm using public/ }).check();
  await page.getByRole("button", { name: "Compare Requirements", exact: true }).click();
  await expect(page.locator(".notice.error")).toContainText("Offline test: service unavailable.");
  expect(marked).toBe(true);
});
