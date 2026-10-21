import { test, expect, type Page } from "@playwright/test";
import type { Degree, Report, Source } from "@/shared/contracts";
import { displayAssessments } from "../fixtures/degree";

// Synthetic transport fixtures only. The application contains no canned reports.
test.beforeEach(async ({ page }) => {
  await page.route("**/*", (r) =>
    ["127.0.0.1", "localhost"].includes(new URL(r.request().url()).hostname)
      ? r.continue()
      : r.abort(),
  );
});

async function intercept(
  page: Page,
  degree: Degree,
  mode: "allowed" | "blocked" | "uncertain" | "multiple" | "legacy" | "broken",
) {
  let calls = 0;
  await page.route("**/api/compare", async (route) => {
    calls++;
    const body = route.request().postDataBuffer()!.toString();
    const requestId = /name="requestId"\r\n\r\n([^\r]+)/.exec(body)![1];
    const revision = Number(
      /name="inputRevision"\r\n\r\n([^\r]+)/.exec(body)![1],
    );
    const sources: Source[] = ["A", "B"].map((id) => {
      const text = `SYNTHETIC policy for ${degree} applicants. IELTS 6.5 is required with admissions approval for any exemption. Other-degree sections must be excluded from comparison.`;
      return {
        id,
        hash: "offline-only",
        name: `Synthetic-${id}.txt`,
        kind: "TXT",
        bytes: text.length,
        pages: [{ number: 1, text }],
        passages: [
          {
            id: `${id}-scope`,
            sourceId: id,
            page: null,
            lineStart: 1,
            lineEnd: 1,
            text,
          },
        ],
      };
    });
    const assessments = displayAssessments(sources);
    if (mode === "blocked") {
      assessments[1].status = assessments[1].modelStatus = "other_degree";
      assessments[1].explanation =
        "OFFLINE TEST ONLY: explicit exclusive opposite-degree scope.";
    }
    if (mode === "uncertain") {
      assessments[1].status = assessments[1].modelStatus = "uncertain";
      assessments[1].missingInformation = [
        "Confirm which degree this policy covers.",
      ];
    }
    if (mode === "multiple")
      assessments[0].status = assessments[0].modelStatus = "multiple";
    const applicability = {
      assessments,
      gate:
        mode === "blocked"
          ? ("blocked" as const)
          : mode === "uncertain"
            ? ("uncertain" as const)
            : ("allowed" as const),
    };
    const report: Report = {
      id: "offline-degree-test",
      revision,
      applicant: {
        degree,
        program: "Computing",
        intake: "2026",
        category: "International",
      },
      applicability,
      degreeVerification: mode === "uncertain" ? "unverified" : "supported",
      model: "OFFLINE TRANSPORT ONLY",
      limitations: ["Not a Gemini reasoning result."],
      findings: [
        {
          id: "selected-rule",
          topic: "Selected degree English policy",
          classification: "Insufficient Evidence",
          modelClassification: "Insufficient Evidence",
          explanation:
            "Preliminary selected-degree requirement; confirm applicable conditions.",
          unknowns: ["Applicant's qualification possession is unknown."],
          guardNotes: [],
          clarificationQuestion: "Which conditions apply?",
          rules: sources.map((s) => ({
            id: s.id,
            sourceId: s.id,
            degreeMatch: "selected",
            description: "IELTS 6.5",
            scope: degree,
            scopeMatch: "matches",
            conditionStatus: "unknown",
            conditions: ["Approval required"],
            exceptions: [],
            evidence: s.passages.map((p) => ({ ...p, sourceName: s.name })),
          })),
        },
      ],
    };
    const payload =
      mode === "legacy" ? { ...report, applicability: undefined } : report;
    const events = [
      { type: "sources", sources },
      mode === "blocked"
        ? { type: "applicability", applicability }
        : { type: "result", report: payload },
    ];
    await route.fulfill({
      contentType: "application/x-ndjson",
      body:
        events
          .map((e) => JSON.stringify({ ...e, requestId, revision }))
          .join("\n") +
        "\n" +
        (mode === "broken" ? '{"type":' : ""),
    });
  });
  await page.goto("/");
  await page.getByRole("radio", { name: new RegExp("^" + degree) }).check();
  await page.getByRole("button", { name: "Use synthetic samples" }).click();
  await expect(page.getByLabel("Intended program")).toHaveValue(
    /Artificial Intelligence/,
  );
  await page.getByRole("checkbox", { name: /I'm using public/ }).check();
  await page
    .getByRole("button", { name: "Compare Requirements", exact: true })
    .click();
  return () => calls;
}

test("degree is never preselected; accurately labeled undergraduate samples pass real local extraction with AI off", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
  await expect(page.locator("#file-0")).toBeDisabled();
  await page
    .getByRole("radio", { name: new RegExp("^" + "Bachelor's") })
    .check();
  await page.getByRole("button", { name: "Use synthetic samples" }).click();
  await expect(page.getByLabel("Intended program")).toHaveValue(
    /Artificial Intelligence/,
  );
  await expect(page.getByLabel("Intended program")).toHaveValue(
    "Bachelor's in Artificial Intelligence",
  );
  await expect(page.locator(".upload-zone").first()).toContainText(
    "bachelor-Synthetic-policy-A.txt",
  );
  await page.getByRole("checkbox", { name: /I'm using public/ }).check();
  await page
    .getByRole("button", { name: "Compare Requirements", exact: true })
    .click();
  await expect(page.locator(".source-scroll")).toContainText("Bachelor's");
  await expect(page.locator(".notice[role=alert]")).toContainText(
    "no AI report was generated",
  );
});

for (const degree of ["Bachelor's", "Master's"] as const) {
  test(`${degree}: supported exclusive mismatch blocks without acknowledgment or dashboard access`, async ({
    page,
  }) => {
    const calls = await intercept(page, degree, "blocked");
    await expect(
      page.getByText("Comparison blocked — replace the mismatching document"),
    ).toBeVisible();
    await expect(page.locator(".degree-card").nth(1)).toContainText(
      "Explicitly another degree",
    );
    await expect(
      page.getByRole("checkbox", { name: /I acknowledge/ }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: /preliminary comparison/ }),
    ).toHaveCount(0);
    await expect(page.locator(".finding")).toHaveCount(0);
    await page.goto("/results");
    await expect(page).toHaveURL("/");
    expect(calls()).toBe(1);
  });
}

test("uncertainty requires acknowledgment, uses same response, and degree changes invalidate reviews and gate", async ({
  page,
}) => {
  const calls = await intercept(page, "Bachelor's", "uncertain");
  const button = page.getByRole("button", {
    name: "Continue to preliminary comparison",
    exact: true,
  });
  await expect(button).toBeDisabled();
  await expect(page.locator(".finding")).toHaveCount(0);
  await expect(page.locator(".degree-card").nth(1)).toContainText(
    "Confirm which degree",
  );
  for (const width of [320, 375, 768, 1366, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    if ([375, 1366].includes(width))
      await page.screenshot({
        path: `test-results/degree-uncertain-${width}.png`,
        fullPage: true,
      });
  }
  await page
    .getByRole("checkbox", { name: /I acknowledge the unresolved/ })
    .check();
  await button.click();
  await expect(page).toHaveURL("/results");
  await expect(
    page.getByRole("heading", { name: "Degree applicability unverified" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Accept", exact: true }).click();
  await expect(page.getByText("Accepted by you")).toBeVisible();
  await page.getByRole("link", { name: "Edit inputs" }).click();
  await page.getByRole("radio", { name: new RegExp("^" + "Master's") }).check();
  await expect(
    page.getByRole("heading", { name: "Review document applicability" }),
  ).toHaveCount(0);
  await expect(page.getByText("Outdated — Reanalysis Required")).toBeVisible();
  // Existing undergraduate files are retained with accurate names, never relabeled Master's.
  await expect(page.locator(".upload-zone").first()).toContainText(
    "bachelor-Synthetic-policy-A.txt",
  );
  await page.getByRole("link", { name: "View outdated report" }).click();
  await expect(
    page.getByRole("button", { name: "Accept", exact: true }),
  ).toBeDisabled();
  await expect(page.getByText("Accepted by you")).toHaveCount(0);
  expect(calls()).toBe(1);
});

test("mixed-degree assessment precedes selected-rule findings and survives in-app navigation", async ({
  page,
}) => {
  const calls = await intercept(page, "Master's", "multiple");
  await expect(page.locator(".degree-card").first()).toContainText(
    "Covers multiple degree levels",
  );
  await expect(page.locator(".finding")).toHaveCount(0);
  await page
    .getByRole("button", { name: "View preliminary comparison", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Selected degree English policy" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Edit inputs" }).click();
  await expect(
    page.getByRole("heading", { name: "Review document applicability" }),
  ).toBeVisible();
  await expect(
    page.getByText("Your comparison is available in this session."),
  ).toBeVisible();
  expect(calls()).toBe(1);
});

test("legacy report without applicability cannot bypass the new gate", async ({
  page,
}) => {
  await intercept(page, "Master's", "legacy");
  await expect(page.locator(".notice[role=alert]")).toContainText(
    "degree assessments were incomplete",
  );
  await expect(page.locator(".finding")).toHaveCount(0);
  await expect(page).toHaveURL("/");
});

test("a truncated transport cannot expose a held comparison even after a result event", async ({
  page,
}) => {
  await intercept(page, "Master's", "broken");
  await expect(page.locator(".notice[role=alert]")).toContainText(
    "connection ended before analysis completed",
  );
  await expect(
    page.getByRole("button", {
      name: "View preliminary comparison",
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Review document applicability" }),
  ).toHaveCount(0);
});

test("editing the degree while uncertainty is held clears acknowledgment and all reveal controls", async ({
  page,
}) => {
  await intercept(page, "Master's", "uncertain");
  await page
    .getByRole("checkbox", { name: /I acknowledge the unresolved/ })
    .check();
  await page
    .getByRole("radio", { name: new RegExp("^" + "Bachelor's") })
    .check();
  await expect(
    page.getByRole("checkbox", { name: /I acknowledge the unresolved/ }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", {
      name: "Continue to preliminary comparison",
      exact: true,
    }),
  ).toHaveCount(0);
  await page.goto("/results");
  await expect(page).toHaveURL("/");
});

test("failed reanalysis retains the last complete held response, with renewed acknowledgment required", async ({
  page,
}) => {
  await intercept(page, "Master's", "uncertain");
  await page
    .getByRole("checkbox", { name: /I acknowledge the unresolved/ })
    .check();
  await page.route("**/api/compare", async (route) => {
    const body = route.request().postDataBuffer()!.toString();
    const requestId = /name="requestId"\r\n\r\n([^\r]+)/.exec(body)![1];
    const revision = Number(
      /name="inputRevision"\r\n\r\n([^\r]+)/.exec(body)![1],
    );
    await route.fulfill({
      contentType: "application/x-ndjson",
      body:
        JSON.stringify({
          type: "error",
          code: "PROVIDER_UNAVAILABLE",
          message: "OFFLINE TEST ONLY: retry failed.",
          requestId,
          revision,
        }) + "\n",
    });
  });
  await page
    .getByRole("button", { name: "Compare Requirements", exact: true })
    .click();
  await expect(page.locator(".notice[role=alert]")).toContainText(
    "retry failed",
  );
  const next = page.getByRole("button", {
    name: "Continue to preliminary comparison",
    exact: true,
  });
  await expect(next).toBeDisabled();
  await page
    .getByRole("checkbox", { name: /I acknowledge the unresolved/ })
    .check();
  await next.click();
  await expect(page).toHaveURL("/results");
  await expect(
    page.getByRole("heading", { name: "Degree applicability unverified" }),
  ).toBeVisible();
});
