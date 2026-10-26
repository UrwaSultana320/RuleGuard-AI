import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFile } from "node:fs/promises";
import { afterEach, expect, it, vi } from "vitest";
import type { ProviderProgress } from "@/shared/contracts";
const state = vi.hoisted(() => ({
  files: [null, null] as (File | null)[], fileErrors: ["", ""],
  applicant: { degree: "Master's", program: "Computing", intake: "Not sure", category: "Not sure" },
  consent: true, processing: false, outdated: false,
  stage: 1,
  providerProgress: null as ProviderProgress | null,
  info: null as string | null,
  error: null as { message: string; analysisFailed?: boolean } | null,
}));
vi.mock("@/state/session", () => ({ useSession: () => state }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/components/FullSourceView", () => ({ FullSourceView: () => null }));
vi.mock("@/components/DegreeApplicability", () => ({ ApplicabilityReview: () => null }));
import { CompareForm } from "@/components/CompareForm";
afterEach(() => {
  state.files = [null, null];
  state.processing = false;
  state.providerProgress = null;
});

it("renders both nonempty public sample files with their actual byte sizes", async () => {
  state.files = await Promise.all(["A", "B"].map(async id => {
    const contents = await readFile(`public/samples/synthetic-${id}.txt`, "utf8");
    expect(contents).toContain("SYNTHETIC TEST DOCUMENT");
    expect(contents).toContain("Fictional institution: RuleGuard Example University");
    const file = new File([contents], `Synthetic-policy-${id}.txt`, { type: "text/plain" });
    expect(file.size).toBeGreaterThan(0);
    expect(file.size).toBe(Buffer.byteLength(contents, "utf8"));
    expect(file.size).toBeLessThan(1000);
    return file;
  }));
  const html = renderToStaticMarkup(createElement(CompareForm));
  for (const file of state.files) {
    expect(html).toContain(file!.name);
    expect(html).toContain(`${file!.size} bytes · Click to replace`);
  }
  expect(html).not.toContain("0 KB");
});

it.each([
  [1, "1 byte"], [999, "999 bytes"], [1000, "1 KB"], [2000, "2 KB"],
])("renders a %i-byte upload as %s", (size, label) => {
  state.files = [new File([new Uint8Array(size)], "size-test.txt"), null];
  expect(renderToStaticMarkup(createElement(CompareForm))).toContain(`${label} · Click to replace`);
});
it("uses neutral status styling without Retry Analysis for missing configuration", () => {
  state.info = "AI analysis is unavailable because this server is not configured.";
  state.error = null;
  const html = renderToStaticMarkup(createElement(CompareForm));
  expect(html).toContain('class="notice info" role="status"');
  expect(html).not.toContain('class="notice error"');
  expect(html).not.toContain('class="notice warning"');
  expect(html).not.toContain("Retry Analysis");
  expect(html).toContain("Compare Requirements");
});
it("offers Retry Analysis only for a failed request, not input validation", () => {
  state.info = null;
  state.error = { message: "Select both documents." };
  expect(renderToStaticMarkup(createElement(CompareForm))).not.toContain("Retry Analysis");
  state.error = { message: "The AI service could not complete this request.", analysisFailed: true };
  const html = renderToStaticMarkup(createElement(CompareForm));
  expect(html).toContain('class="notice error" role="alert"');
  expect(html).toContain("Retry Analysis");
});
it("announces nonterminal retry and fallback progress while analysis is running", () => {
  state.processing = true;
  state.error = null;
  state.info = null;
  state.providerProgress = { phase: "retry", attempt: 2, delayMs: 2125 };
  let html = renderToStaticMarkup(createElement(CompareForm));
  expect(html).toContain("The AI service is busy, retrying...");
  expect(html).toContain("Retry 2 of 3");
  expect(html).toContain("Waiting at least 3 seconds");
  expect(html).toContain('aria-live="polite"');
  state.providerProgress = { phase: "fallback", attempt: 1, delayMs: 0 };
  html = renderToStaticMarkup(createElement(CompareForm));
  expect(html).toContain("trying the configured fallback...");
  expect(html).toContain("Fallback attempt 1 of 1");
});
