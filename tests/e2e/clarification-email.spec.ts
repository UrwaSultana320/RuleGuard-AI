import { test, expect, type Page } from "@playwright/test";
import { editorialReport, editorialSources } from "../fixtures/editorial";

async function openResults(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: {
      writeText: async (text: string) => { (window as Window & { copiedEmail?: string }).copiedEmail = text; },
    } });
  });
  await page.route("**/*", route => ["localhost", "127.0.0.1"].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
  await page.route("**/api/compare", async route => {
    const body = route.request().postDataBuffer()!.toString();
    const requestId = /name="requestId"\r\n\r\n([^\r]+)/.exec(body)![1];
    const revision = Number(/name="inputRevision"\r\n\r\n([^\r]+)/.exec(body)![1]);
    await route.fulfill({ contentType: "application/x-ndjson", body:
      [{ type: "sources", sources: editorialSources }, { type: "result", report: editorialReport(revision) }]
        .map(event => JSON.stringify({ ...event, requestId, revision })).join("\n") + "\n" });
  });
  await page.goto("/"); await page.getByRole("button", { name: "Try a live example" }).click();
}

test("single and multiple reviewed findings produce professional plain-text drafts", async ({ page }) => {
  await openResults(page);
  const composer = page.getByRole("region", { name: "Your email to the university" });
  await expect(composer.getByRole("button", { name: "Draft Clarification Email", exact: true })).toBeDisabled();
  const first = page.locator(".finding").filter({ has: page.getByRole("heading", { name: "English-medium certificates", exact: true }) });
  await first.getByRole("button", { name: "Accept", exact: true }).click();
  await expect(composer.getByLabel("Email body")).toHaveCount(0);
  await composer.getByRole("button", { name: "Draft Clarification Email", exact: true }).click();
  await expect(composer.getByLabel("Email subject")).toHaveValue("MSc Computing, September 2026: Which requirement applies to English-medium certificates?");
  const body = await composer.getByLabel("Email body").inputValue();
  expect(body).toContain("Dear Admissions Team,\n\n");
  expect(body).toContain(`“${editorialSources[0].passages[2].text}”`);
  expect(body).toContain(`“${editorialSources[1].passages[2].text}”`);
  expect(body.indexOf("The problem:")).toBeLessThan(body.indexOf("What the first document says:"));
  expect(body).not.toMatch(/Document A|Source B|\.txt|fixture|\*\*|\n1\. /i);
  await composer.getByText("Formatted preview", { exact: true }).click();
  await expect(composer.locator(".email-preview strong")).toHaveText(["The problem:", "What the first document says:", "What the second document says:", "My question:"]);
  await composer.getByRole("button", { name: "Copy email", exact: true }).click();
  expect(await page.evaluate(() => (window as Window & { copiedEmail?: string }).copiedEmail)).toContain(body);
  const missing = page.locator(".finding").filter({ has: page.getByRole("heading", { name: "Qualification equivalence", exact: true }) });
  await missing.getByRole("button", { name: "Uncertain", exact: true }).click();
  await composer.getByLabel("Include uncertain findings").check();
  await expect(composer.getByLabel("Email body")).toHaveCount(0);
  await composer.getByRole("button", { name: "Draft Clarification Email", exact: true }).click();
  await expect(composer.getByLabel("Email subject")).toHaveValue("MSc Computing, September 2026: clarification needed on 2 admission requirements");
  await expect(composer.getByLabel("Email body")).toHaveValue(/1\. English-medium certificates[\s\S]*2\. Qualification equivalence/);
  await expect(composer.getByLabel("Email body")).toHaveValue(/I may have misread this; please correct me if so\./);
  await expect(composer.getByLabel("Email body")).not.toHaveValue(/IELTS score requirements|Course entry and degree admission/);
  await composer.getByLabel("Include uncertain findings").uncheck();
  await expect(composer.getByLabel("Email body")).toHaveCount(0);
  await expect(composer.getByRole("button", { name: "Copy email", exact: true })).toHaveCount(0);
});

test("edited drafts survive review changes and require deliberate replacement; mailto uses edited plain text", async ({ page }) => {
  await openResults(page);
  const composer = page.getByRole("region", { name: "Your email to the university" });
  await page.getByRole("button", { name: "Accept", exact: true }).first().click();
  await composer.getByRole("button", { name: "Draft Clarification Email", exact: true }).click();
  await composer.getByLabel("Email subject").fill("My admission question");
  await composer.getByLabel("Email body").fill("Dear Admissions Team,\n\nThe problem:\nPlease confirm the requirement.\nMy question:\nWhich applies?");
  const text = await composer.getByLabel("Email body").inputValue();
  await composer.getByLabel("Recipient email (optional)").fill("admissions+masters@example.edu");
  const url = new URL((await composer.getByRole("link", { name: "Open in mail app" }).getAttribute("href"))!);
  expect(url.searchParams.get("body")).toBe(text);
  expect(url.searchParams.get("subject")).toBe("My admission question");
  await composer.getByRole("button", { name: "Copy email", exact: true }).click();
  expect(await page.evaluate(() => (window as Window & { copiedEmail?: string }).copiedEmail)).toBe(`Subject: My admission question\n\n${text}`);
  await composer.getByLabel("Include uncertain findings").check();
  await expect(composer.getByRole("link", { name: "Open in mail app" })).toHaveCount(0);
  await composer.getByText("Previous draft — outdated, for reference only").click();
  await expect(composer.locator(".previous-email")).toContainText("My admission question");
  await composer.getByRole("button", { name: "Draft Clarification Email", exact: true }).click();
  await expect(composer.getByRole("button", { name: "Replace edited draft", exact: true })).toBeVisible();
  await composer.getByRole("button", { name: "Keep previous draft", exact: true }).click();
  await expect(composer.locator(".previous-email")).toContainText(text);
  await composer.getByRole("button", { name: "Draft Clarification Email", exact: true }).click();
  await composer.getByRole("button", { name: "Replace edited draft", exact: true }).click();
  await expect(composer.getByLabel("Email body")).not.toHaveValue(text);
});

test("uncertain-only opt-in, mobile preview, keyboard controls and stale applicant protection", async ({ page }) => {
  await openResults(page);
  const composer = page.getByRole("region", { name: "Your email to the university" });
  await page.getByRole("button", { name: "Uncertain", exact: true }).first().click();
  await expect(composer.getByRole("button", { name: "Draft Clarification Email", exact: true })).toBeDisabled();
  await composer.getByLabel("Include uncertain findings").check();
  const button = composer.getByRole("button", { name: "Draft Clarification Email", exact: true });
  await button.focus(); await page.keyboard.press("Enter");
  await expect(composer.getByLabel("Email body")).toHaveValue(/I may have misread this/);
  for (const width of [320, 375, 768, 1366, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await composer.getByText("Formatted preview", { exact: true }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    const subjectSize = await composer.getByLabel("Email subject").evaluate(el => ({ scroll: el.scrollHeight, client: el.clientHeight }));
    expect(subjectSize.scroll).toBeLessThanOrEqual(subjectSize.client + 2);
    await page.screenshot({ path: `test-results/email-review-${width}.png`, fullPage: true });
    if (width === 375 || width === 1366) await composer.screenshot({ path: `test-results/email-composer-${width}.png` });
    await composer.getByText("Formatted preview", { exact: true }).click();
  }
  await page.getByRole("link", { name: "Edit inputs" }).click();
  await page.getByLabel("Intake", { exact: true }).fill("2028");
  await page.getByRole("link", { name: "View outdated report" }).click();
  await expect(composer.getByRole("button", { name: "Draft Clarification Email", exact: true })).toBeDisabled();
  await expect(composer.getByLabel("Email body")).toHaveCount(0);
});
