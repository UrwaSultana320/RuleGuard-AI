import { existsSync } from 'node:fs';
import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";

test("actual backend reads both synthetic sources, retains work on AI-disabled error, and clears on refresh", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Use synthetic samples" }).click();
  await expect(page.getByLabel("Intended program")).toHaveValue(
    "Master's in Artificial Intelligence",
  );
  await page.getByRole("checkbox", { name: /I'm using public/ }).check();
  await page
    .getByRole("button", { name: "Compare Requirements", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Full extracted sources" }),
  ).toBeVisible();
  await expect(page.locator(".notice[role=alert]")).toContainText(
    "no AI report was generated",
  );
  await page
    .locator(".source-tabs")
    .getByRole("button", { name: /Document B/ })
    .click();
  await expect(page.locator(".source-scroll")).toContainText(
    "There are no waivers or exceptions",
  );
  await page.getByLabel("Intake", { exact: true }).fill("2027");
  await expect(page.getByText("Outdated sources")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Intended program")).toHaveValue("");
  await expect(
    page.getByRole("heading", { name: "Full extracted sources" }),
  ).toHaveCount(0);
});

test("frontend validates PDF pages and the actual backend extracts all approved Waikato pages with no AI", async ({
  page,
}) => {
  test.skip(!existsSync("tmp/pdfs/waikato-pg-english-2026.pdf") || !existsSync("tmp/pdfs/waikato-college-english-2026.pdf"), "Download official Waikato sources as described in the README to run this PDF integration test.");
  await page.goto("/");
  await page
    .locator("#file-0")
    .setInputFiles("tmp/pdfs/waikato-pg-english-2026.pdf");
  await expect(page.locator(".upload-zone").first()).toContainText(
    "waikato-pg-english-2026.pdf",
  );
  await page
    .locator("#file-1")
    .setInputFiles("tmp/pdfs/waikato-college-english-2026.pdf");
  await expect(page.locator(".upload-zone").nth(1)).toContainText(
    "waikato-college-english-2026.pdf",
  );
  await page.getByLabel("Intended program").fill("Master of Data Science");
  await page.getByRole("checkbox", { name: /I'm using public/ }).check();
  await page
    .getByRole("button", { name: "Compare Requirements", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Full extracted sources" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "PDF page 9", exact: true }),
  ).toHaveCount(1);
  await page
    .locator(".source-tabs")
    .getByRole("button", { name: /Document B/ })
    .click();
  await expect(
    page.getByRole("heading", { name: "PDF page 8", exact: true }),
  ).toHaveCount(1);
  await expect(page.locator(".source-scroll")).toContainText(
    "Academic English",
  );
});

test("review/evidence/email controls and stale-state behavior work with explicitly intercepted test-only output", async ({
  page,
}) => {
  // This fixture exists only in the browser test. The actual server never returns canned findings.
  await page.route("**/api/compare", async (route) => {
    const body = route.request().postDataBuffer()!.toString();
    const id = body.match(/name="requestId"\r\n\r\n([^\r]+)/)![1];
    const revision = Number(
      body.match(/name="inputRevision"\r\n\r\n([^\r]+)/)![1],
    );
    const ss = ["A", "B"].map((id) => ({
      id,
      hash: "test-only",
      name: `Test-${id}.txt`,
      kind: "TXT",
      bytes: 30,
      pages: [
        { number: 1, text: "SYNTHETIC: source evidence with conditions." },
      ],
      passages: [
        {
          id: id + "-p1",
          sourceId: id,
          page: null,
          lineStart: 1,
          lineEnd: 1,
          text: "SYNTHETIC: source evidence with conditions.",
        },
      ],
    }));
    const report = {
      id: "test-only-intercept",
      revision,
      applicant: {
        degree: "Master's",
        program: "Master's in Artificial Intelligence",
        intake: "September 2026",
        category: "International applicant",
      },
      model: "test-only transport fixture",
      limitations: ["TEST ONLY — not a real AI result."],
      findings: [
        {
          id: "f1",
          topic: "Test-only conditional requirement",
          classification: "Insufficient Evidence",
          modelClassification: "Potential Contradiction",
          explanation: "TEST ONLY. Decisive applicant context is missing.",
          unknowns: ["Unknown category"],
          guardNotes: ["Context is not established."],
          clarificationQuestion: "Which applicant condition applies?",
          rules: ss.map((s) => ({
            id: s.id,
            sourceId: s.id,
            description: "Test-only summary",
            scope: "Unspecified",
            scopeMatch: "unknown",
            conditionStatus: "unknown",
            conditions: ["Official assessment required"],
            exceptions: [],
            evidence: s.passages.map((p) => ({ ...p, sourceName: s.name })),
          })),
        },
      ],
    };
    const lines =
      [
        { type: "sources", sources: ss },
        { type: "result", report },
      ]
        .map((e) => JSON.stringify({ ...e, requestId: id, revision }))
        .join("\n") + "\n";
    await route.fulfill({ contentType: "application/x-ndjson", body: lines });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Use synthetic samples" }).click();
  await page.getByRole("checkbox", { name: /I'm using public/ }).check();
  await page
    .getByRole("button", { name: "Compare Requirements", exact: true })
    .click();
  await expect(page).toHaveURL("/results");
  await expect(
    page.getByText("AI suggestions — human review required."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Accept", exact: true }).click();
  await expect(page.getByText("Accepted by you")).toBeVisible();
  await page.getByRole("button", { name: "Reject", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Draft Email", exact: true }),
  ).toBeDisabled();
  await expect(page.locator(".metrics").first()).toContainText("1");
  await page.getByRole("button", { name: "Uncertain", exact: true }).click();
  await page.getByRole("button", { name: "Draft Email", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Open editable email draft" }),
  ).toHaveAttribute("href", /^mailto:/);
  await page.locator(".evidence summary").click();
  await expect(
    page
      .getByText("Source match verified · reasoning remains preliminary")
      .first(),
  ).toBeVisible();
  await page.getByRole("link", { name: "Edit inputs" }).click();
  await page.getByLabel("Intake", { exact: true }).fill("2028");
  await expect(page.getByText("Outdated — Reanalysis Required")).toBeVisible();
  await page.getByRole("link", { name: "View outdated report" }).click();
  await expect(
    page.getByRole("button", { name: "Accept", exact: true }),
  ).toBeDisabled();
});

test("responsive layout and screenshot of the real input page", async ({
  page,
}) => {
  await page.goto("/");
  for (const width of [375, 768, 1366, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(
      page.getByRole("button", { name: "Compare Requirements", exact: true }),
    ).toBeVisible();
  }
  await page.setViewportSize({ width: 1366, height: 1100 });
  await mkdir("test-results", { recursive: true });
  await page.screenshot({
    path: "test-results/local-first-version.png",
    fullPage: true,
  });
});
