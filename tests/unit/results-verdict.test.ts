import { expect, it } from "vitest";
import { resultsVerdict } from "@/shared/results-verdict";
import { editorialReport } from "../fixtures/editorial";

const findings = () => structuredClone(editorialReport(0).findings);

it("shows a conflict only from a final contradiction with verified evidence on both sides", () => {
  const input = findings();
  const before = structuredClone(input);
  const verdict = resultsVerdict(input);
  expect(verdict.kind).toBe("conflict");
  expect(verdict.title).toBe("Conflict found: these two documents disagree.");
  expect(verdict.summary).toBe("Document A permits a certificate-based alternative to IELTS with admissions approval. Document B rejects an English-medium instruction certificate as a substitute for IELTS.");
  expect(input).toEqual(before);
});

it("does not promote a contradiction with unverified, absent or mismatched evidence into a verdict", () => {
  for (const defect of ["unverified", "empty", "other-source", "one-sided", "no-rules"]) {
    const [finding] = findings();
    if (defect === "unverified") delete finding.rules[1].evidence[0].sourceVerified;
    if (defect === "empty") finding.rules[1].evidence = [];
    if (defect === "other-source") finding.rules[1].evidence[0].sourceId = "A";
    if (defect === "one-sided") finding.rules = [finding.rules[0]];
    if (defect === "no-rules") finding.rules = [];
    expect(resultsVerdict([finding]), defect).toMatchObject({
      kind: "clarification", title: "No direct conflict, but clarification is needed.", unverified: true,
    });
  }
});

it("uses clarification for exceptions or missing information, including a guarded model contradiction", () => {
  const input = findings().filter(f => ["Different Applicable Conditions", "Insufficient Evidence"].includes(f.classification));
  for (const finding of input) {
    expect(resultsVerdict([finding]).kind).toBe("clarification");
  }
  input[1].modelClassification = "Potential Contradiction";
  expect(resultsVerdict(input).title).toBe("No direct conflict, but clarification is needed.");
});

it("shows the qualified all-clear for verified consistent findings or an empty comparison", () => {
  for (const input of [findings().filter(f => f.classification === "Consistent"), []]) {
    expect(resultsVerdict(input)).toMatchObject({
      kind: "clear",
      title: "No conflicts found in what we compared. Check the originals before relying on this.",
      summary: "", unverified: false,
    });
  }
});

it("does not give an all-clear when consistency itself lacks source-verified support", () => {
  const input = findings().filter(f => f.classification === "Consistent");
  delete input[0].rules[0].evidence[0].sourceVerified;
  expect(resultsVerdict(input)).toMatchObject({ kind: "clarification", unverified: true });
});
