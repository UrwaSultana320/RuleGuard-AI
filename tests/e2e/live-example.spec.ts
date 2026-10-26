import { expect, test } from "@playwright/test";
import { extractDocument } from "@/server/documents";
import { buildReport } from "@/server/evidence";
import type { Applicant } from "@/shared/contracts";
import { rawAssessments } from "../fixtures/degree";

test("Try a live example loads both real samples and opens verified findings with Gemini mocked", async ({ page }) => {
  let calls = 0;
  await page.route("**/*", (route) =>
    ["localhost", "127.0.0.1"].includes(new URL(route.request().url()).hostname)
      ? route.continue()
      : route.abort(),
  );
  // Intercept the analysis transport only. Extract the uploaded samples and run
  // the real verifier against an explicit offline Gemini-output fixture.
  await page.route("**/api/compare", async (route) => {
    calls++;
    const form = await new Response(new Uint8Array(route.request().postDataBuffer()!), {
      headers: { "Content-Type": route.request().headers()["content-type"] },
    }).formData();
    const applicant: Applicant = JSON.parse(String(form.get("context")));
    expect(applicant).toEqual({
      degree: "Master's",
      program: "Artificial Intelligence",
      intake: "September 2026",
      category: "International applicant",
    });
    expect(form.get("privacyAcknowledged")).toBe("true");
    const sources = await Promise.all(["A", "B"].map(async (id) => {
      const file = form.get(`document${id}`) as File;
      expect(file.name).toBe(`Synthetic-policy-${id}.txt`);
      const source = await extractDocument(file, id);
      expect(source.pages[0].text).toContain("SYNTHETIC TEST DOCUMENT");
      expect(source.pages[0].text).toContain("Fictional institution");
      expect(source.pages[0].text).toContain(id === "A"
        ? "accepted instead of IELTS or TOEFL"
        : "An MOI certificate is not accepted as a substitute");
      return source;
    }));
    const revision = Number(form.get("inputRevision"));
    const report = buildReport({
      analysisStatus: "complete",
      sourceIds: ["A", "B"],
      limitations: ["OFFLINE TEST ONLY: Gemini output is mocked."],
      documentAssessments: rawAssessments(sources),
      rules: sources.map((source) => {
        const clause = { text: source.pages[0].text, passageIds: source.passages.map((p) => p.id) };
        return {
          ruleId: source.id, sourceId: source.id,
          requirement: clause, scope: clause, degreeEvidence: clause,
          degreeMatch: "selected", scopeMatch: "matches",
          conditionStatus: "unknown", conditions: [clause], exceptions: [],
        };
      }),
      coverage: sources.flatMap((source) => source.passages.map((p) => ({
        passageId: p.id, ruleIds: [source.id], disposition: "rules", reason: "Synthetic policy scope and requirement.",
      }))),
      findings: [{
        topic: "MOI exemption conflicts with mandatory language testing",
        ruleIds: ["A", "B"], classification: "Potential Contradiction",
        unknowns: [{ detail: "Whether the applicant holds an MOI certificate is unknown.", kind: "condition_satisfaction", blocksComparison: false }],
        explanation: "A accepts MOI instead of a test; B requires IELTS or TOEFL with no MOI exemption.",
        clarificationQuestion: "Which English-language policy applies?",
      }],
    }, sources, applicant, revision);
    await route.fulfill({
      contentType: "application/x-ndjson",
      body: [{ type: "sources", sources }, { type: "result", report }]
        .map((event) => JSON.stringify({ ...event, revision, requestId: form.get("requestId") }))
        .join("\n") + "\n",
    });
  });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Use synthetic samples" })).toBeVisible();
  await page.getByRole("button", { name: "Try a live example", exact: true }).click();
  await expect(page).toHaveURL("/results");
  await expect(page.getByText("MOI exemption conflicts with mandatory language testing", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Accept", exact: true })).toHaveCount(1);
  expect(calls).toBe(1);
  const email = page.getByRole("region", { name: "Your email to the university" });
  await expect(email).toBeVisible();
  await expect(email).toContainText("Accept a finding to draft your email.");
  await expect(email.getByLabel("Email body")).toHaveCount(0);
  await page.getByRole("button", { name: "Accept", exact: true }).click();
  await email.getByRole("button", { name: "Draft Clarification Email", exact: true }).click();
  const emailBody = email.getByLabel("Email body");
  // Drafting is explicit; inspect both subject and complete body.
  await expect(emailBody).toBeVisible();
  await emailBody.scrollIntoViewIfNeeded();
  await expect(emailBody).toBeInViewport();
  await expect(email.getByLabel("Email subject")).toHaveValue("Artificial Intelligence, September 2026: Which admission requirement applies?");
  await expect(email.getByRole("button", { name: "Copy email", exact: true })).toBeVisible();
  await expect(email.getByRole("button", { name: "Open in mail app" })).toBeVisible();
  const draft = await emailBody.inputValue();
  expect(draft).toMatch(/^Dear Admissions Team,/);
  expect(draft.indexOf("The problem:")).toBeLessThan(draft.indexOf("What the first document says:"));
  expect(draft).not.toMatch(/synthetic|fictional|fixture|RuleGuard|\.txt|Document A|Lines 1|\[University name\]/i);
  expect(draft).toContain("An official Medium of Instruction (MOI) certificate confirming that the applicant's completed bachelor's degree was taught and assessed entirely in English is accepted instead of IELTS or TOEFL.");
  expect(draft).toContain("All international applicants must submit IELTS Academic or TOEFL iBT. An MOI certificate is not accepted as a substitute.");
  const geometry = await emailBody.evaluate(el => {
    const box = el.getBoundingClientRect();
    return { top: box.top, viewport: innerHeight, clientHeight: el.clientHeight, scrollHeight: el.scrollHeight };
  });
  expect(geometry.top).toBeGreaterThanOrEqual(0);
  expect(geometry.top).toBeLessThan(geometry.viewport);
  expect(geometry.scrollHeight).toBeLessThanOrEqual(geometry.clientHeight + 2);
  await page.screenshot({ path: "test-results/live-example-email-full.png", fullPage: true });
  await page.screenshot({ path: "test-results/live-example-email-viewport.png" });
  await page.getByRole("link", { name: "Edit inputs" }).click();
  await expect(page.getByRole("radio", { name: /^Master's/ })).toBeChecked();
  await expect(page.getByLabel("Intended program")).toHaveValue("Artificial Intelligence");
  await expect(page.getByLabel("Intake", { exact: true })).toHaveValue("September 2026");
  await expect(page.getByLabel("Applicant category")).toHaveValue("International applicant");
  await expect(page.getByRole("checkbox", { name: /I'm using public/ })).toBeChecked();
});
