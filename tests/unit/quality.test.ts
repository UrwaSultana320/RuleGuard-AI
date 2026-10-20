import { existsSync, readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import {
  RuleInterpretation,
  UncertaintyNotes,
} from "@/components/RuleInterpretation";
import { buildReport } from "@/server/evidence";
import type { RawAnalysis } from "@/shared/schemas";
import type { Source } from "@/shared/contracts";
import type { Rule, Finding, Report } from "@/shared/contracts";
const rule: Rule = {
  id: "r",
  sourceId: "A",
  description: "A conditional requirement.",
  scope: "International postgraduate applicants",
  scopeMatch: "matches",
  conditionStatus: "unknown",
  degreeMatch: "selected",
  conditions: [],
  exceptions: ["No exemptions are allowed."],
  evidence: [],
};
const finding: Finding = {
  id: "f",
  topic: "Language evidence",
  classification: "Consistent",
  modelClassification: "Consistent",
  explanation: "Compatible rules",
  unknowns: ["Two policies disagree."],
  guardNotes: [],
  clarificationQuestion: "",
  rules: [rule],
};
it("does not silently hide empty structured conditions", () => {
  const html = renderToStaticMarkup(
    createElement(RuleInterpretation, { rule }),
  );
  expect(html).toContain("Conditions: not established");
  expect(html).toContain("Review required");
});
it("presents model-grouped prohibitions as unverified structure, without silently repairing them", () => {
  const before = structuredClone(rule);
  const html = renderToStaticMarkup(
    createElement(RuleInterpretation, { rule }),
  );
  expect(html).toContain("AI-proposed exception grouping");
  expect(html).toContain("A prohibition is not an exception");
  expect(html).toContain("No exemptions are allowed.");
  expect(rule).toEqual(before);
});
it("explains unknown certificate possession separately from unverified AI uncertainty notes", () => {
  const html = renderToStaticMarkup(
    createElement(UncertaintyNotes, { finding }),
  );
  expect(html).toContain("required certificate or qualification");
  expect(html).toContain("AI uncertainty notes");
  expect(html).toContain("Two policies disagree.");
});
it("does not assert that nonempty condition arrays or scope matching are verified facts", () => {
  const html = renderToStaticMarkup(
    createElement(RuleInterpretation, {
      rule: {
        ...rule,
        conditions: ["A required assessment must be passed."],
        exceptions: [],
      },
    }),
  );
  expect(html).toContain("AI-proposed conditions");
  expect(html).toContain("AI suggests scope matches");
  expect(html).toContain("Exceptions: not established");
});
it.skipIf(!existsSync("tmp/smoke40-model-response.json"))(
  "reproduces all three observed S01 defects from the original saved synthetic output",
  () => {
    const raw: RawAnalysis = JSON.parse(
      JSON.parse(readFileSync("tmp/smoke40-model-response.json", "utf8"))
        .rawText,
    );
    const m = JSON.parse(readFileSync("tmp/smoke40-input.json", "utf8"));
    const before = structuredClone(raw);
    // The genuine old response has no degree-assessment contract. Reject it as a
    // new analysis; use the unchanged historical validated report only for the
    // original rendering regression. No new degree reasoning is attributed to it.
    expect(() => buildReport(raw, m.sources, m.applicant, 0)).toThrow();
    const report: Report = JSON.parse(
      readFileSync("tmp/smoke40-validated-report.json", "utf8"),
    );
    expect(raw.rules.every((r) => r.conditions.length === 0)).toBe(true);
    expect(raw.rules[1].exceptions[0].text).toContain(
      "no waivers or exceptions",
    );
    expect(raw.findings[0].unknowns[0].detail).toContain("while Source B");
    for (const r of report.findings[0].rules) {
      const html = renderToStaticMarkup(
        createElement(RuleInterpretation, { rule: r }),
      );
      expect(html).toContain("Conditions: not established");
      expect(html).toContain("Review required");
      expect(r.evidence[0].text).toBe(
        (m.sources as Source[]).find((s) => s.id === r.sourceId)!.passages[0]
          .text,
      );
    }
    const html = renderToStaticMarkup(
      createElement(UncertaintyNotes, { finding: report.findings[0] }),
    );
    expect(html).toContain("required certificate or qualification");
    expect(raw).toEqual(before);
    expect(report.findings[0].classification).toBe("Potential Contradiction");
  },
);

it("does not manufacture a missing certificate when the model marks satisfaction met", () => {
  const html = renderToStaticMarkup(
    createElement(UncertaintyNotes, {
      finding: {
        ...finding,
        unknowns: [],
        rules: [{ ...rule, conditionStatus: "met" }],
      },
    }),
  );
  expect(html).toBe("");
});
it("escapes untrusted model markup and preserves the proposed wording as text", () => {
  const text = '<img src=x onerror="alert(1)">';
  const html = renderToStaticMarkup(
    createElement(RuleInterpretation, {
      rule: { ...rule, conditions: [text] },
    }),
  );
  expect(html).not.toContain("<img");
  expect(html).toContain("&lt;img");
});
