import { test, expect } from "@playwright/test";
import { editorialReport, editorialSources } from "../fixtures/editorial";

for (const empty of [false, true]) {
  test(`finding cards: ${empty ? "empty" : "verified, unverified and session review"}`, async ({ page }) => {
    await page.route("**/*", route =>
      ["localhost", "127.0.0.1"].includes(new URL(route.request().url()).hostname)
        ? route.continue() : route.abort());
    await page.route("**/api/compare", async route => {
      const body = route.request().postDataBuffer()!.toString();
      const requestId = /name="requestId"\r\n\r\n([^\r]+)/.exec(body)![1];
      const revision = Number(/name="inputRevision"\r\n\r\n([^\r]+)/.exec(body)![1]);
      const report = structuredClone(editorialReport(revision));
      if (empty) report.findings = [];
      else delete report.findings[0].rules[1].evidence[0].sourceVerified;
      await route.fulfill({ contentType: "application/x-ndjson", body:
        [{ type: "sources", sources: editorialSources }, { type: "result", report }]
          .map(event => JSON.stringify({ ...event, requestId, revision })).join("\n") + "\n" });
    });
    await page.goto("/");
    await page.getByRole("button", { name: "Try a live example" }).click();
    await expect(page).toHaveURL("/results");
    await expect(page.getByLabel("Finding summary")).toContainText(empty ? "0 of 0 quotes verified" : "7 of 8 quotes verified");
    if (empty) {
      await expect(page.getByRole("heading", { name: "No conflicts found in what we compared. Check the originals before relying on this." })).toBeVisible();
      await expect(page.locator(".summary-chip")).toHaveCount(0);
      await expect(page.locator(".summary-zero")).toHaveCount(4);
      await expect(page.getByRole("heading", { name: "No contradictions found. Check the original documents." })).toBeVisible();
      await expect(page.locator(".finding")).toHaveCount(0);
    } else {
      await expect(page.getByRole("heading", { name: "No direct conflict, but clarification is needed." })).toBeVisible();
      await expect(page.locator(".results-verdict")).toContainText("Some finding evidence is not source-verified");
      const card = page.locator(".finding").first();
      await expect(card.locator(".finding-details")).not.toHaveAttribute("open", "");
      await expect(card.locator(".rule-context").first()).not.toBeVisible();
      await expect(card.locator(".finding-explanation")).toContainText("Document A permits");
      await expect(card.locator(".finding-explanation")).toContainText("Document B rejects");
      await expect(card.locator("mark")).toHaveCount(2);
      await expect(card.locator("mark").first()).toBeVisible();
      await card.locator(".finding-details > summary").focus();
      await page.keyboard.press("Enter");
      await expect(card.locator(".rule-context").first()).toBeVisible();
      await expect(card.locator(".unknowns")).toBeVisible();
      await page.keyboard.press("Enter");
      await expect(card.locator(".rule-context").first()).not.toBeVisible();
      await expect(page.locator(".source-scroll")).not.toBeVisible();
      await card.getByRole("button", { name: "View full extracted source" }).nth(1).click();
      await expect(page.locator(".source-scroll")).toBeVisible();
      await expect(page.getByRole("button", { name: /Document B Programme-guidance/ })).toHaveAttribute("aria-pressed", "true");
      await page.locator(".full-source-disclosure > summary").click();
      await expect(page.locator(".source-scroll")).not.toBeVisible();
      expect(await page.locator(".findings-list").evaluate(el => !!(el.compareDocumentPosition(document.querySelector(".report-applicability")!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
      await expect(page.locator(".degree-compact .degree-status-row")).toHaveCount(2);
      await expect(page.locator(".degree-compact .degree-details").first()).not.toHaveAttribute("open", "");
      expect(await page.locator(".summary-type strong").first().evaluate(el => getComputedStyle(el).fontVariantNumeric)).toContain("lining-nums");
      await expect(card.locator(".source-verified")).toHaveCount(1);
      await expect(card.locator(".source-unverified")).toContainText("Lines 3–3");
      for (const [label, review] of [["Accept", "Accepted"], ["Reject", "Rejected"], ["Uncertain", "Uncertain"]]) {
        await card.getByRole("button", { name: label, exact: true }).click();
        await expect(card.getByRole("button", { name: label, exact: true })).toHaveAttribute("aria-pressed", "true");
        await expect(card.locator('[aria-pressed="true"]')).toHaveCount(1);
        await expect(card.locator(".review-badge")).toHaveText(`${review} by you`);
      }
      await page.getByRole("link", { name: "Edit inputs" }).click();
      await page.getByRole("link", { name: "Findings", exact: true }).click();
      await expect(card.getByRole("button", { name: "Uncertain", exact: true })).toHaveAttribute("aria-pressed", "true");
    }
    for (const width of [375, 768, 1280]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      if (!empty) {
        const grid = page.locator(".evidence-grid").first();
        expect(await grid.evaluate(el => getComputedStyle(el).gridTemplateColumns.split(" ").length)).toBe(width >= 768 ? 2 : 1);
        expect(await page.locator(".finding-explanation").first().evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(14);
      }
      await page.screenshot({ path: `test-results/results-${empty ? "empty" : "cards"}-${width}.png`, fullPage: true });
    }
  });
}
