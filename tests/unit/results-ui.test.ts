import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";
import type { Report, Review } from "@/shared/contracts";
import { editorialReport } from "../fixtures/editorial";

const state = vi.hoisted(() => ({
  report: null as Report | null,
  outdated: false,
  reviewOf: (): Review => "Pending",
}));
vi.mock("@/state/session", () => ({ useSession: () => state }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));
vi.mock("@/components/FullSourceView", () => ({ FullSourceView: () => null }));
import { ResultsDashboard } from "@/components/ResultsDashboard";
import { findingSummary, quoteDisplay } from "@/shared/finding-display";
import { instructions } from "@/server/prompt";
const render = () => renderToStaticMarkup(createElement(ResultsDashboard));
beforeEach(() => {
  state.report = structuredClone(editorialReport(0));
  state.outdated = false;
  state.reviewOf = () => "Pending";
});
it("shows backend-verified quotes with references and type counts", () => {
  const html = render();
  expect(html).toContain("8 of 8 quotes verified");
  expect(html.match(/class="source-verified"/g)).toHaveLength(8);
  expect(html).toContain("Source verified · Lines 3–3");
  expect(html).toContain("Admissions-policy.txt");
  expect(html).toContain("Programme-guidance.txt");
  for (const type of ["Contradiction", "Exception", "Missing information", "Consistent"])
    expect(html).toContain(type);
});
it("does not claim verification when the backend flag is absent", () => {
  const quote = state.report!.findings[0].rules[0].evidence[0];
  delete quote.sourceVerified;
  quote.page = 7;
  const html = render();
  expect(html).toContain("7 of 8 quotes verified");
  expect(html).toContain("Source not verified · PDF page 7");
  expect(html).not.toContain("Source verified · PDF page 7");
});
it.each(["Accepted", "Rejected", "Uncertain"] as const)("renders %s as the sole selected choice on each card", (review) => {
  state.reviewOf = () => review;
  const html = render();
  expect(html.match(/aria-pressed="true"/g)).toHaveLength(4);
  expect(html.match(new RegExp(`${review} by you`, "g"))).toHaveLength(4);
});
it("shows an empty state and honest zero quote count", () => {
  state.report!.findings = [];
  const html = render();
  expect(html).toContain("No contradictions found. Check the original documents.");
  expect(html).toContain("0 of 0 quotes verified");
  expect(html).not.toContain('class="source-verified"');
});
it("shows the saved-example notice only for a saved report", () => {
  expect(render()).not.toContain("Showing a saved result for this example.");
  state.report!.savedExample = true;
  expect(render()).toContain("Showing a saved result for this example.");
  expect(render()).toContain('class="saved-example-notice" role="status"');
});
it("keeps both sides, source verification and review controls visible with interpretation collapsed", () => {
  const html = render();
  expect(html.match(/<details class="finding-details">/g)).toHaveLength(4);
  expect(html.match(/<summary>Show details<\/summary>/g)).toHaveLength(4);
  expect(html.match(/AI interpretation, check against source/g)).toHaveLength(4);
  expect(html.match(/<mark>/g)).toHaveLength(8);
  expect(html).toContain("Conditions: not established");
  expect(html).toContain("Exceptions: not established");
  expect(html).toContain("AI uncertainty notes");
  expect(html).toContain("Accept</button>");
  expect(html).toContain("Reject</button>");
  expect(html).toContain('id="full-source-disclosure"');
  expect(html).not.toContain('class="finding-details" open');
  expect(html.indexOf('class="findings-list"')).toBeLessThan(html.indexOf('class="panel report-applicability"'));
  expect(html).toContain('degree-compact');
  expect(html.match(/<details class="degree-details">/g)).toHaveLength(2);
});
it("uses a two-sided explanation and keeps old source interpretations as a fallback", () => {
  const finding = state.report!.findings[0];
  finding.explanation = "Document A permits an MOI certificate with approval; Document B requires IELTS without an MOI exemption. Ask admissions.";
  expect(findingSummary(finding)).toBe(finding.explanation.split(". ")[0] + ".");
  finding.explanation = "Conflicting policies.";
  finding.rules[0].description = "Accepts an MOI certificate with approval.";
  finding.rules[1].description = "Requires IELTS without an MOI exemption.";
  expect(findingSummary(finding)).toBe("Document A: Accepts an MOI certificate with approval; Document B: Requires IELTS without an MOI exemption.");
  finding.rules = [finding.rules[0]];
  expect(findingSummary(finding)).toContain("Document B: no supporting rule was identified");
});
it("trims standalone boilerplate without changing evidence, references or the full cited passage", () => {
  const quote = state.report!.findings[0].rules[0].evidence[0];
  quote.text = "SYNTHETIC TEST DOCUMENT A\nFictional institution: Example University\nAn MOI certificate may replace IELTS with approval. No waiver is automatic.";
  quote.lineStart = 1;
  quote.lineEnd = 4;
  const before = structuredClone(quote);
  const display = quoteDisplay(quote.text, "MOI certificate IELTS approval");
  expect(display.before + display.highlight + display.after).toBe("An MOI certificate may replace IELTS with approval. No waiver is automatic.");
  expect(display.highlight).toBe("An MOI certificate may replace IELTS with approval.");
  const html = render();
  expect(html).toContain("Source verified · Lines 1–4");
  expect(html).toContain("Full cited passage");
  expect(html).toContain(quote.text);
  expect(quote).toEqual(before);
});
it("never trims operative scope language and preserves negation and adjacent conditions", () => {
  const text = "SYNTHETIC POLICY covers only Master's applicants.\nNo MOI exemption is allowed. IELTS is required unless admissions approves a waiver.";
  const display = quoteDisplay(text, "MOI exemption");
  expect(display.trimmed).toBe(false);
  expect(display.before + display.highlight + display.after).toBe(text);
  expect(display.highlight).toContain("No MOI exemption");
});
it("instructs the model to name both source positions and distinguish document disagreement from internal contradiction", () => {
  expect(instructions).toContain("explicitly labeled Document A and Document B");
  expect(instructions).toContain('never as "internally contradictory"');
  expect(instructions).toContain("within the SAME document");
});

it("puts the verdict first and exposes email navigation without changing quotation counts", () => {
  const html = render();
  expect(html).toContain("Conflict found: these two documents disagree.");
  expect(html.indexOf('class="results-verdict')).toBeLessThan(html.indexOf('class="results-summary"'));
  expect(html).toContain("Review and send email");
  expect(html).toContain('href="#clarification-email"');
  expect(html).toContain("8 of 8 quotes verified");
  expect(html).toContain("Your email to the university");
  expect(html).toContain("Accept a finding to draft your email.");
  expect(html).not.toContain('class="email-ready-prompt"');
  expect(html).toMatch(/<\/div><section class="panel clarification-email"/);
});

it("emphasizes only positive category counts and renders zeros as muted text", () => {
  state.report!.findings = [state.report!.findings[0]];
  const html = render();
  expect(html.match(/class="summary-type summary-chip/g)).toHaveLength(1);
  expect(html).toContain('<strong>1</strong> <span>contradiction</span>');
  expect(html.match(/class="summary-zero"/g)).toHaveLength(3);
  expect(html).toContain('class="summary-zero">0 exceptions');
  expect(html).toContain("2 of 2 quotes verified");
});

it("shows the persistent email-ready link only for accepted current findings", () => {
  state.reviewOf = () => "Accepted";
  expect(render()).toContain('class="email-ready-prompt" role="status"');
  expect(render()).toContain("Ready to draft");
  state.reviewOf = () => "Uncertain";
  expect(render()).not.toContain('class="email-ready-prompt"');
  state.reviewOf = () => "Accepted";
  state.outdated = true;
  expect(render()).not.toContain('class="email-ready-prompt"');
});
