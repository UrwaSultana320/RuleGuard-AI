import { describe, expect, it } from "vitest";
import { extractDocument } from "@/server/documents";
import { buildReport } from "@/server/evidence";
import { safeError } from "@/server/errors";
import { canReveal } from "@/shared/applicability";
import { applicantSchema, type RawAnalysis } from "@/shared/schemas";
import type { Applicant, Degree } from "@/shared/contracts";
import { rawAssessments } from "../fixtures/degree";
import { requestContents } from "@/server/gemini";

async function fixture(
  degree: Degree = "Master's",
  variant: "matching" | "mixed" | "general" | "unknown" = "matching",
) {
  const applicant: Applicant = {
    degree,
    program: "Computing",
    intake: "2026",
    category: "International",
  };
  const sources = await Promise.all(
    (["A", "B"] as const).map((id) =>
      extractDocument(
        new File(
          [
            variant === "general"
              ? "SYNTHETIC GENERAL UNIVERSITY POLICY. The following English rule applies to all international degree applicants, including undergraduate and Master's students in all programs for 2026. IELTS 6.5 is required. An exemption may be approved after three years of English-taught study; official evidence and approval are required."
              : variant === "unknown"
                ? "SYNTHETIC POLICY. English requirements for Computing 2026: IELTS 6.5 is required. This document does not specify the educational stage. Contact admissions for its degree scope."
                : `SYNTHETIC POLICY. ${variant === "mixed" && id === "A" ? "Selected section:" : ""} This section applies only to international ${degree} applicants to Computing in 2026.\nIELTS 6.5 is required. An exemption may be approved after three years of English-taught study; official evidence and approval are required.${variant === "mixed" && id === "A" ? `\nOther-degree section: ${degree === "Master's" ? "Bachelor's" : "Master's"} applicants must submit IELTS 7.0; no exemptions apply to this other-degree section.` : ""}`,
          ],
          `Misleading-filename-${id}.txt`,
        ),
        id,
      ),
    ),
  );
  const raw: RawAnalysis = {
    analysisStatus: "complete",
    sourceIds: ["A", "B"],
    limitations: [],
    documentAssessments: rawAssessments(sources),
    rules: sources.map((s) => ({
      ruleId: s.id,
      sourceId: s.id,
      degreeMatch: "selected",
      degreeEvidence: {
        text: `Policy covers ${degree} applicants.`,
        passageIds: [s.passages[0].id],
      },
      requirement: {
        text: "IELTS 6.5 is required.",
        passageIds: [s.passages[0].id],
      },
      scope: {
        text: "International Computing applicants in 2026",
        passageIds: [s.passages[0].id],
      },
      scopeMatch: "matches",
      conditionStatus: "unknown",
      conditions: [
        {
          text: "Official evidence and approval required.",
          passageIds: [s.passages[0].id],
        },
      ],
      exceptions: [
        {
          text: "Approved three years of English-taught study.",
          passageIds: [s.passages[0].id],
        },
      ],
    })),
    coverage: sources.flatMap((s) =>
      s.passages.map((p) => ({
        passageId: p.id,
        ruleIds: [s.id],
        disposition: "rules" as const,
        reason: "Operative requirement and degree scope.",
      })),
    ),
    findings: [
      {
        topic: "Language test",
        ruleIds: ["A", "B"],
        classification: "Consistent",
        unknowns: [],
        explanation:
          "Same conditional requirement; applicant achievement unknown.",
        clarificationQuestion: "",
      },
    ],
  };
  return { raw, sources, applicant };
}

describe("degree-aware structural guards (offline fixtures, not model reasoning validation)", () => {
  it.each(["Bachelor's", "Master's"] as const)(
    "sends explicit %s context and all passages without filename cues",
    async (degree) => {
      const f = await fixture(degree);
      const payload = JSON.parse(
        requestContents(f.sources, f.applicant)[0].parts[0].text,
      );
      expect(payload.applicant.degree).toBe(degree);
      for (const [index, source] of f.sources.entries()) {
        expect(payload.sources[index]).not.toHaveProperty("filename");
        expect(payload.sources[index].passages).toEqual(
          source.passages.map((p) => ({ passageId: p.id, text: p.text })),
        );
      }
    },
  );
  it.each(["Bachelor's", "Master's"] as const)(
    "supports matching %s policies without assuming condition satisfaction",
    async (degree) => {
      const f = await fixture(degree);
      const report = buildReport(f.raw, f.sources, f.applicant, 0);
      expect(report.applicability.gate).toBe("allowed");
      expect(report.findings[0].classification).toBe("Consistent");
      expect(report.findings[0].rules[0].conditionStatus).toBe("unknown");
      expect(canReveal(report.applicability, false)).toBe(true);
      expect(report.findings[0].rules[0].evidence[0].text).toBe(
        f.sources[0].passages[0].text,
      );
    },
  );
  it.each(["Bachelor's", "Master's"] as const)(
    "blocks explicit opposite-only policy for %s and never permits acknowledgment override",
    async (degree) => {
      const f = await fixture(degree);
      f.sources[1] = await extractDocument(
        new File(
          [
            `SYNTHETIC. This policy applies exclusively to ${degree === "Bachelor's" ? "Master's" : "Bachelor's"} admission. The other degree is excluded. IELTS 7 required.`,
          ],
          "Neutral.txt",
        ),
        "B",
      );
      const id = f.sources[1].passages[0].id;
      f.raw.documentAssessments[1] = {
        sourceId: "B",
        status: "other_degree",
        explanation: "Operative exclusivity excludes the selected degree.",
        evidence: [
          { text: "Only the other degree is covered.", passageIds: [id] },
        ],
        missingInformation: [],
        exclusivelyOtherDegree: true,
        conflictingEvidence: false,
      };
      f.raw.rules[1].degreeMatch = "other";
      for (const c of [
        f.raw.rules[1].requirement,
        f.raw.rules[1].scope,
        f.raw.rules[1].degreeEvidence,
        ...f.raw.rules[1].conditions,
        ...f.raw.rules[1].exceptions,
      ])
        c.passageIds = [id];
      f.raw.coverage[1].passageId = id;
      f.raw.findings = [];
      const report = buildReport(f.raw, f.sources, f.applicant, 0);
      expect(report.applicability.gate).toBe("blocked");
      expect(canReveal(report.applicability, true)).toBe(false);
      expect(report.applicability.assessments[1].evidence[0].text).toBe(
        f.sources[1].passages[0].text,
      );
    },
  );
  it("requires acknowledgment for unknown scope and keeps unknown rules insufficient", async () => {
    const f = await fixture("Master's", "unknown");
    f.raw.documentAssessments[0].status = "uncertain";
    f.raw.documentAssessments[0].missingInformation = [
      "Educational stage is not established.",
    ];
    f.raw.rules[0].degreeMatch = "unknown";
    const r = buildReport(f.raw, f.sources, f.applicant, 0);
    expect(r.degreeVerification).toBe("unverified");
    expect(r.findings[0].classification).toBe("Insufficient Evidence");
    expect(r.findings[0].modelClassification).toBe("Consistent");
    expect(canReveal(r.applicability, false)).toBe(false);
    expect(canReveal(r.applicability, true)).toBe(true);
  });
  it("downgrades conflicting or weak exclusivity rather than asserting a mismatch", async () => {
    for (const conflicting of [true, false]) {
      const f = await fixture();
      f.raw.documentAssessments[0].status = "other_degree";
      f.raw.documentAssessments[0].conflictingEvidence = conflicting;
      f.raw.documentAssessments[0].exclusivelyOtherDegree = false;
      const r = buildReport(f.raw, f.sources, f.applicant, 0);
      expect(r.applicability.gate).toBe("uncertain");
      expect(r.applicability.assessments[0].modelStatus).toBe("other_degree");
    }
  });
  it("accepts mixed documents but rejects a finding that compares an other-degree rule", async () => {
    const f = await fixture("Master's", "mixed");
    f.raw.documentAssessments[0].status = "multiple";
    f.raw.rules.push({
      ...structuredClone(f.raw.rules[0]),
      ruleId: "other-branch",
      degreeMatch: "other",
      requirement: {
        text: "Other-degree section requires IELTS 7.0 with no exemptions.",
        passageIds: [f.sources[0].passages[0].id],
      },
      conditions: [],
      exceptions: [],
    });
    f.raw.coverage[0].ruleIds.push("other-branch");
    const mixedReport = buildReport(f.raw, f.sources, f.applicant, 0);
    expect(mixedReport.applicability.gate).toBe("allowed");
    expect(mixedReport.findings[0].rules[0].exceptions).toEqual([
      "Approved three years of English-taught study.",
    ]);
    f.raw.findings[0].ruleIds.push("other-branch");
    try {
      buildReport(f.raw, f.sources, f.applicant, 0);
      throw Error("Expected rejection");
    } catch (e) {
      expect(safeError(e).diagnosticCode).toBe("FINDING_OTHER_DEGREE_RULE");
    }
  });
  it.each(["Bachelor's", "Master's"] as const)(
    "permits general-policy scope for %s without title matching",
    async (degree) => {
      const f = await fixture(degree, "general");
      f.raw.documentAssessments.forEach((a) => {
        a.status = "general";
      });
      f.raw.rules.forEach((r) => {
        r.degreeMatch = "general";
      });
      expect(
        buildReport(f.raw, f.sources, f.applicant, 0).applicability.gate,
      ).toBe("allowed");
    },
  );
  it("rejects invented/cross-source applicability IDs and evidence-free positive assessments", async () => {
    for (const mode of ["invented", "cross", "empty"]) {
      const f = await fixture();
      f.raw.documentAssessments[0].evidence =
        mode === "empty"
          ? []
          : [
              {
                text: "Degree scope",
                passageIds: [
                  mode === "cross" ? f.sources[1].passages[0].id : "fabricated",
                ],
              },
            ];
      expect(() => buildReport(f.raw, f.sources, f.applicant, 0)).toThrow();
    }
  });
  it("rejects missing/duplicate assessments and legacy output rather than defaulting to Master's", async () => {
    const f = await fixture();
    f.raw.documentAssessments[1].sourceId = "A";
    expect(() => buildReport(f.raw, f.sources, f.applicant, 0)).toThrow();
    const legacy = { ...f.raw, documentAssessments: undefined };
    expect(() => buildReport(legacy, f.sources, f.applicant, 0)).toThrow();
    expect(
      applicantSchema.safeParse({ ...f.applicant, degree: "" }).success,
    ).toBe(false);
  });
  it("rejects invalid rule-degree evidence and gives a supported mismatch priority over another uncertain document", async () => {
    const f = await fixture();
    f.raw.rules[0].degreeEvidence.passageIds = [f.sources[1].passages[0].id];
    expect(() => buildReport(f.raw, f.sources, f.applicant, 0)).toThrow();
    f.raw.rules[0].degreeEvidence.passageIds = [f.sources[0].passages[0].id];
    f.raw.documentAssessments[0].status = "uncertain";
    f.raw.documentAssessments[1].status = "other_degree";
    f.raw.documentAssessments[1].exclusivelyOtherDegree = true;
    f.raw.rules[1].degreeMatch = "other";
    f.raw.findings = [];
    const r = buildReport(f.raw, f.sources, f.applicant, 0);
    expect(r.applicability.gate).toBe("blocked");
    expect(canReveal(r.applicability, true)).toBe(false);
  });
  it("preserves selected-degree conditions and exceptions without borrowing the other branch", async () => {
    const f = await fixture("Bachelor's");
    const r = buildReport(f.raw, f.sources, f.applicant, 0).findings[0]
      .rules[0];
    expect(r.conditions).toEqual(["Official evidence and approval required."]);
    expect(r.exceptions).toEqual([
      "Approved three years of English-taught study.",
    ]);
    expect(r.degreeMatch).toBe("selected");
  });
});
