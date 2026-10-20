import { describe, expect, it } from "vitest";
import { extractDocument } from "@/server/documents";
import { buildReport } from "@/server/evidence";
import { safeError } from "@/server/errors";
import type { RawAnalysis } from "@/shared/schemas";
import type { Applicant } from "@/shared/contracts";

// Constructed offline contract fixture, NOT the unavailable S01 Gemini response.
const applicant: Applicant = {
  degree: "Master's",
  program: "Synthetic",
  intake: "Unknown",
  category: "Unknown",
};
async function fixture() {
  const sources = await Promise.all(
    (["A", "B"] as const).map((id) =>
      extractDocument(
        new File(["SYNTHETIC public rule. Approval is required."], `${id}.txt`),
        id,
      ),
    ),
  );
  const raw: RawAnalysis = {
    analysisStatus: "complete",
    sourceIds: ["A", "B"],
    limitations: [],
    rules: sources.map((s) => ({
      ruleId: s.id,
      sourceId: s.id,
      requirement: {
        text: "A rule is stated.",
        passageIds: [s.passages[0].id],
      },
      scope: { text: "Applicants.", passageIds: [s.passages[0].id] },
      scopeMatch: "matches",
      conditionStatus: "unknown",
      conditions: [
        { text: "Approval required.", passageIds: [s.passages[0].id] },
      ],
      exceptions: [],
    })),
    coverage: sources.map((s) => ({
      passageId: s.passages[0].id,
      ruleIds: [s.id],
      disposition: "rules",
      reason: "Rule present.",
    })),
    findings: [
      {
        topic: "Requirement",
        ruleIds: ["A", "B"],
        classification: "Consistent",
        explanation: "Shared requirement.",
        unknowns: [],
        clarificationQuestion: "",
      },
    ],
  };
  return { sources, raw };
}
const cases: [string, (r: RawAnalysis) => void][] = [
  [
    "ANALYSIS_INCOMPLETE",
    (r) => {
      r.analysisStatus = "incomplete";
    },
  ],
  [
    "SOURCE_SET_MISMATCH",
    (r) => {
      r.sourceIds = ["A", "A", "B"];
    },
  ],
  [
    "RULE_ID_EMPTY",
    (r) => {
      r.rules[0].ruleId = " ";
    },
  ],
  [
    "RULE_ID_DUPLICATE",
    (r) => {
      r.rules[1].ruleId = "A";
    },
  ],
  [
    "RULE_SOURCE_UNKNOWN",
    (r) => {
      r.rules[0].sourceId = "SECRET_SENTINEL";
    },
  ],
  [
    "CLAUSE_TEXT_EMPTY",
    (r) => {
      r.rules[0].conditions[0].text = " ";
    },
  ],
  [
    "CLAUSE_REFERENCES_EMPTY",
    (r) => {
      r.rules[0].scope.passageIds = [];
    },
  ],
  [
    "CLAUSE_PASSAGE_UNKNOWN",
    (r) => {
      r.rules[0].requirement.passageIds = ["SECRET_SENTINEL"];
    },
  ],
  [
    "CLAUSE_SOURCE_MISMATCH",
    (r) => {
      r.rules[0].requirement.passageIds = r.rules[1].scope.passageIds;
    },
  ],
  [
    "COVERAGE_PASSAGE_UNKNOWN",
    (r) => {
      r.coverage[0].passageId = "SECRET_SENTINEL";
    },
  ],
  [
    "COVERAGE_PASSAGE_DUPLICATE",
    (r) => {
      r.coverage.push(r.coverage[0]);
    },
  ],
  [
    "COVERAGE_REASON_EMPTY",
    (r) => {
      r.coverage[0].reason = " ";
    },
  ],
  [
    "COVERAGE_RULES_EMPTY",
    (r) => {
      r.coverage[0].ruleIds = [];
    },
  ],
  [
    "COVERAGE_RULE_UNKNOWN",
    (r) => {
      r.coverage[0].ruleIds = ["SECRET_SENTINEL"];
    },
  ],
  [
    "COVERAGE_RULE_PASSAGE_MISMATCH",
    (r) => {
      r.coverage[0].ruleIds = ["B"];
    },
  ],
  [
    "COVERAGE_INCOMPLETE",
    (r) => {
      r.coverage.pop();
    },
  ],
  [
    "FINDING_TOPIC_EMPTY",
    (r) => {
      r.findings[0].topic = " ";
    },
  ],
  [
    "FINDING_TOPIC_DUPLICATE",
    (r) => {
      r.findings.push({ ...r.findings[0], topic: " requirement " });
    },
  ],
  [
    "FINDING_RULES_EMPTY",
    (r) => {
      r.findings[0].ruleIds = [];
    },
  ],
  [
    "FINDING_EXPLANATION_EMPTY",
    (r) => {
      r.findings[0].explanation = " ";
    },
  ],
  [
    "FINDING_RULE_UNKNOWN",
    (r) => {
      r.findings[0].ruleIds = ["SECRET_SENTINEL"];
    },
  ],
  [
    "FINDING_QUESTION_EMPTY",
    (r) => {
      r.findings[0].classification = "Potential Contradiction";
    },
  ],
];
describe("Privacy-safe evidence diagnostics (no original S01 payload)", () => {
  it.each(cases)("rejects with precise %s", async (code, mutate) => {
    const { sources, raw } = await fixture();
    mutate(raw);
    let caught: unknown;
    try {
      buildReport(raw, sources, applicant, 0);
    } catch (e) {
      caught = e;
    }
    expect(caught, "Invalid output must never produce a report").toBeDefined();
    const error = safeError(caught);
    expect(error).toMatchObject({ diagnosticCode: code });
    const serialized = JSON.stringify(error);
    for (const secret of [
      "SECRET_SENTINEL",
      sources[0].passages[0].id,
      sources[0].passages[0].text,
      sources[0].name,
    ])
      expect(serialized).not.toContain(secret);
    expect(Object.keys(error).sort()).toEqual([
      "code",
      "diagnosticCode",
      "message",
    ]);
  });
  it("reports schema failure without serializing rejected input or Zod issues", async () => {
    const { sources } = await fixture();
    try {
      buildReport({ secret: "SECRET_SENTINEL" }, sources, applicant, 0);
    } catch (e) {
      expect(safeError(e)).toMatchObject({
        code: "INCOMPLETE_ANALYSIS",
        diagnosticCode: "ANALYSIS_SCHEMA_INVALID",
      });
      expect(JSON.stringify(safeError(e))).not.toContain("SECRET_SENTINEL");
      return;
    }
    throw new Error("Malformed output accepted");
  });
  it("accepts the well-formed contract and reconstructs exact evidence, including conditions", async () => {
    const { sources, raw } = await fixture();
    const report = buildReport(raw, sources, applicant, 0);
    expect(report.findings[0].rules[0].conditions).toEqual([
      "Approval required.",
    ]);
    expect(report.findings[0].rules[0].evidence[0].text).toBe(
      sources[0].passages[0].text,
    );
  });
});
