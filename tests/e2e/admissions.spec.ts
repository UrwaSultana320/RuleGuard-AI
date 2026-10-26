import { test, expect } from "@playwright/test";
import { admissionsCases, admissionsFixture } from "../fixtures/admissions";
import { buildReport } from "../../src/server/evidence";

test("offline admissions topics retain evidence, review selection and explicit email uncertainty", async ({ page }) => {
  const { raw, sources, applicant } = await admissionsFixture(admissionsCases.slice(0, 8));
  await page.route("**/*", route => ["localhost", "127.0.0.1"].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
  await page.route("**/api/compare", async route => {
    const form = await new Response(new Uint8Array(route.request().postDataBuffer()!), {
      headers: { "Content-Type": route.request().headers()["content-type"] },
    }).formData();
    const revision = Number(form.get("inputRevision"));
    const requestId = String(form.get("requestId"));
    // Production extraction + verifier, authored model output, no provider call.
    const report = buildReport(raw, sources, applicant, revision);
    await route.fulfill({ contentType: "application/x-ndjson", body: [
      { type: "sources", sources }, { type: "result", report },
    ].map(event => JSON.stringify({ ...event, requestId, revision })).join("\n") + "\n" });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Try a live example" }).click();
  await expect(page).toHaveURL("/results");
  for (const c of admissionsCases.slice(0, 8)) await expect(page.getByRole("heading", { name: c.topic, exact: true })).toBeVisible();
  const finding = (topic: string) => page.locator(".finding").filter({ has: page.getByRole("heading", { name: topic, exact: true }) });
  await finding("Apostille at application").getByRole("button", { name: "Accept", exact: true }).click();
  await finding("Apostille submission stages").getByRole("button", { name: "Accept", exact: true }).click();
  await finding("Minimum GPA").getByRole("button", { name: "Accept", exact: true }).click();
  await finding("Missing recommendation evidence").getByRole("button", { name: "Uncertain", exact: true }).click();
  const email = page.getByRole("region", { name: "Your email to the university" });
  await email.getByRole("button", { name: "Draft Clarification Email", exact: true }).click();
  await expect(email.getByLabel("Email subject")).toHaveValue(/2 admission requirements/);
  await expect(email.getByLabel("Email body")).toHaveValue(/1\. Apostille at application[\s\S]*2\. Minimum GPA/);
  await expect(email.getByLabel("Email body")).not.toHaveValue(/I may have misread this/);
  await email.getByLabel("Include uncertain findings").check();
  await email.getByRole("button", { name: "Draft Clarification Email", exact: true }).click();
  await expect(email.getByLabel("Email subject")).toHaveValue(/3 admission requirements/);
  await expect(email.getByLabel("Email body")).toHaveValue(/3\. Missing recommendation evidence/);
  await expect(email.getByLabel("Email body")).toHaveValue(/I may have misread this/);
});
