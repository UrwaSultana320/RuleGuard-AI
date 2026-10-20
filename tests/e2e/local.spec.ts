import { existsSync, readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";

// Offline browser verification: permit the local app only, never cloud services.
test.beforeEach(async ({ page }) => {
  await page.route("**/*", (route) => {
    const host = new URL(route.request().url()).hostname;
    return ["127.0.0.1", "localhost"].includes(host)
      ? route.continue()
      : route.abort();
  });
});

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
  test.skip(
    !existsSync("tmp/pdfs/waikato-pg-english-2026.pdf") ||
      !existsSync("tmp/pdfs/waikato-college-english-2026.pdf"),
    "Download official Waikato sources as described in the README to run this PDF integration test.",
  );
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
  for (const width of [320, 375, 390, 768, 1366, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    const layout = await page.evaluate(() => ({
      width: innerWidth,
      scroll: document.documentElement.scrollWidth,
      outside: Array.from(document.querySelectorAll("body *"))
        .filter((e) => e.getBoundingClientRect().right > innerWidth + 1)
        .map((e) => ({
          tag: e.tagName,
          cls: String(e.className),
          right: e.getBoundingClientRect().right,
        }))
        .slice(0, 12),
    }));
    expect(layout.scroll, JSON.stringify(layout)).toBeLessThanOrEqual(width);
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

test("shows a privacy-safe diagnostic without rendering rejected AI findings", async ({
  page,
}) => {
  // Explicit test-only error transport; not a genuine model result.
  await page.route("**/api/compare", async (route) => {
    const form = route.request().postDataBuffer()!.toString();
    const requestId = /name="requestId"\r\n\r\n([^\r]+)/.exec(form)![1];
    const revision = Number(
      /name="inputRevision"\r\n\r\n([^\r]+)/.exec(form)![1],
    );
    await route.fulfill({
      status: 200,
      contentType: "application/x-ndjson",
      body:
        JSON.stringify({
          type: "error",
          requestId,
          revision,
          code: "INVALID_EVIDENCE",
          diagnosticCode: "CLAUSE_PASSAGE_UNKNOWN",
          message: "Unsupported references were rejected.",
        }) + "\n",
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Use synthetic samples" }).click();
  await page.getByRole("checkbox", { name: /I'm using public/ }).check();
  await page
    .getByRole("button", { name: "Compare Requirements", exact: true })
    .click();
  await expect(page.locator(".notice[role=alert]")).toContainText(
    "Diagnostic code: CLAUSE_PASSAGE_UNKNOWN",
  );
  await expect(page).toHaveURL("/");
  await expect(page.getByLabel("Intended program")).toHaveValue(
    "Master's in Artificial Intelligence",
  );
});

test("recorded S01 offline replay shows honest structure, preserves evidence and works across screen sizes", async ({
  page,
}) => {
  test.skip(
    !existsSync("tmp/smoke40-validated-report.json") ||
      !existsSync("tmp/smoke40-input.json"),
    "Optional private synthetic replay artifacts are absent; no cloud fallback is allowed.",
  );
  const saved = JSON.parse(
    readFileSync("tmp/smoke40-validated-report.json", "utf8"),
  );
  const manifest = JSON.parse(readFileSync("tmp/smoke40-input.json", "utf8"));
  // Test-only transport of the saved synthetic response; no new generation or runtime fallback.
  await page.route("**/api/compare", async (route) => {
    const body = route.request().postDataBuffer()!.toString();
    const requestId = /name="requestId"\r\n\r\n([^\r]+)/.exec(body)![1];
    const revision = Number(
      /name="inputRevision"\r\n\r\n([^\r]+)/.exec(body)![1],
    );
    const events = [
      { type: "sources", sources: manifest.sources },
      { type: "result", report: { ...saved, revision } },
    ];
    await route.fulfill({
      contentType: "application/x-ndjson",
      body:
        events
          .map((e) => JSON.stringify({ ...e, requestId, revision }))
          .join("\n") + "\n",
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Use synthetic samples" }).click();
  await page.getByRole("checkbox", { name: /I'm using public/ }).check();
  await page
    .getByRole("button", { name: "Compare Requirements", exact: true })
    .click();
  await expect(page).toHaveURL("/results");
  await page.locator(".evidence summary").click();
  await expect(
    page.getByText("Conditions: not established", { exact: true }),
  ).toHaveCount(2);
  await expect(
    page.getByText("Review required · structure unverified", { exact: true }),
  ).toHaveCount(2);
  await expect(page.getByText(/A prohibition is not an exception/)).toHaveCount(
    2,
  );
  await expect(
    page.getByText(/The AI has not established whether the applicant holds/),
  ).toBeVisible();
  await expect(page.locator(".unknowns")).toContainText(
    saved.findings[0].unknowns[0],
  );
  const quotes = page.locator(".evidence blockquote pre");
  for (let i = 0; i < 2; i++)
    expect(await quotes.nth(i).textContent()).toBe(
      manifest.sources[i].passages[0].text,
    );
  await page.getByRole("button", { name: "Draft Email", exact: true }).click();
  for (const width of [320, 375, 390, 768, 1366, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    const layout = await page.evaluate(() => ({
      width: innerWidth,
      scroll: document.documentElement.scrollWidth,
      outside: Array.from(document.querySelectorAll("body *"))
        .filter((e) => e.getBoundingClientRect().right > innerWidth + 1)
        .map((e) => ({
          tag: e.tagName,
          cls: String(e.className),
          right: e.getBoundingClientRect().right,
        }))
        .slice(0, 12),
    }));
    expect(layout.scroll, JSON.stringify(layout)).toBeLessThanOrEqual(width);
    for (const name of ["Accept", "Reject", "Uncertain"]) {
      const control = page.getByRole("button", { name, exact: true });
      await expect(control).toBeVisible();
      if (width <= 390)
        expect((await control.boundingBox())!.height).toBeGreaterThanOrEqual(
          44,
        );
    }
    await expect(page.getByLabel("Email draft text")).toBeVisible();
    if (width === 375 || width === 1366) {
      await page.screenshot({
        path: `test-results/quality-replay-${width}.png`,
        fullPage: true,
      });
      await page
        .locator(".structure-review")
        .first()
        .screenshot({ path: `test-results/quality-structure-${width}.png` });
    }
  }
  const sourceRegion = page.getByRole("region", {
    name: "Extracted source text",
  });
  await sourceRegion.focus();
  await expect(sourceRegion).toBeFocused();
  await page.getByRole("button", { name: "Reject", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Draft Email", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Uncertain", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Draft Email", exact: true }),
  ).toBeEnabled();
  await page.getByRole("link", { name: "Edit inputs" }).click();
  await page.getByLabel("Intake", { exact: true }).fill("2028");
  await page.getByRole("link", { name: "View outdated report" }).click();
  await expect(
    page.getByRole("button", { name: "Accept", exact: true }),
  ).toBeDisabled();
});
