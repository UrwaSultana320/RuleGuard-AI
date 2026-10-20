import { randomUUID } from "node:crypto";
import { rawSchema } from "@/shared/schemas";
import type {
  Applicant,
  Evidence,
  Finding,
  Report,
  Source,
} from "@/shared/contracts";
import { AppError, type ValidationDiagnostic } from "./errors";

export function buildReport(
  input: unknown,
  sources: Source[],
  applicant: Applicant,
  revision: number,
): Report {
  const parsed = rawSchema.safeParse(input);
  if (!parsed.success)
    throw new AppError(
      "INCOMPLETE_ANALYSIS",
      "The AI response was incomplete or malformed. No current report was created. Review the sources or retry.",
      undefined,
      "ANALYSIS_SCHEMA_INVALID",
    );
  if (parsed.data.analysisStatus !== "complete")
    throw new AppError(
      "INCOMPLETE_ANALYSIS",
      "The AI response was incomplete. No current report was created. Review the sources or retry.",
      undefined,
      "ANALYSIS_INCOMPLETE",
    );
  const raw = parsed.data;
  const sourceIds = new Set(sources.map((s) => s.id));
  if (
    raw.sourceIds.length !== sourceIds.size ||
    new Set(raw.sourceIds).size !== sourceIds.size ||
    raw.sourceIds.some((id) => !sourceIds.has(id))
  )
    throw new AppError(
      "INCOMPLETE_ANALYSIS",
      "The AI did not acknowledge both documents. Review your sources or retry.",
      undefined,
      "SOURCE_SET_MISMATCH",
    );
  const registry = new Map(
    sources.flatMap((s) =>
      s.passages.map((p) => [p.id, { ...p, sourceName: s.name }] as const),
    ),
  );
  function fail(diagnosticCode: ValidationDiagnostic): never {
    throw new AppError(
      "INVALID_EVIDENCE",
      "The AI returned unsupported or inconsistent source references. They were rejected. Your extracted sources are still available.",
      undefined,
      diagnosticCode,
    );
  }
  const rules = new Map<string, (typeof raw.rules)[number]>();
  for (const r of raw.rules) {
    if (!r.ruleId.trim()) fail("RULE_ID_EMPTY");
    if (rules.has(r.ruleId)) fail("RULE_ID_DUPLICATE");
    if (!sourceIds.has(r.sourceId)) fail("RULE_SOURCE_UNKNOWN");
    rules.set(r.ruleId, r);
    for (const c of [
      r.requirement,
      r.scope,
      ...r.conditions,
      ...r.exceptions,
    ]) {
      if (!c.text.trim()) fail("CLAUSE_TEXT_EMPTY");
      if (!c.passageIds.length) fail("CLAUSE_REFERENCES_EMPTY");
      for (const id of c.passageIds) {
        const passage = registry.get(id);
        if (!passage) fail("CLAUSE_PASSAGE_UNKNOWN");
        if (passage.sourceId !== r.sourceId) fail("CLAUSE_SOURCE_MISMATCH");
      }
    }
  }
  const covered = new Set<string>();
  for (const c of raw.coverage) {
    if (!registry.has(c.passageId)) fail("COVERAGE_PASSAGE_UNKNOWN");
    if (covered.has(c.passageId)) fail("COVERAGE_PASSAGE_DUPLICATE");
    if (!c.reason.trim()) fail("COVERAGE_REASON_EMPTY");
    if (c.disposition === "rules" && !c.ruleIds.length)
      fail("COVERAGE_RULES_EMPTY");
    covered.add(c.passageId);
    for (const id of c.ruleIds) {
      const r = rules.get(id);
      if (!r) fail("COVERAGE_RULE_UNKNOWN");
      if (
        ![r.requirement, r.scope, ...r.conditions, ...r.exceptions].some((x) =>
          x.passageIds.includes(c.passageId),
        )
      )
        fail("COVERAGE_RULE_PASSAGE_MISMATCH");
    }
  }
  if (covered.size !== registry.size) fail("COVERAGE_INCOMPLETE");
  const topics = new Set<string>();
  const findings: Finding[] = raw.findings.map((f, index) => {
    const key = f.topic.trim().toLowerCase();
    if (!key) fail("FINDING_TOPIC_EMPTY");
    if (topics.has(key)) fail("FINDING_TOPIC_DUPLICATE");
    if (!f.ruleIds.length) fail("FINDING_RULES_EMPTY");
    if (!f.explanation.trim()) fail("FINDING_EXPLANATION_EMPTY");
    topics.add(key);
    const rs = f.ruleIds.map((id) => {
      const r = rules.get(id);
      if (!r) fail("FINDING_RULE_UNKNOWN");
      return r;
    });
    const guardNotes: string[] = [];
    if (f.classification !== "Insufficient Evidence") {
      if (new Set(rs.map((r) => r.sourceId)).size !== 2)
        guardNotes.push("Both sources do not support this comparison.");
      if (
        f.unknowns.some((u) => u.blocksComparison) ||
        rs.some((r) => r.scopeMatch === "unknown")
      )
        guardNotes.push("A decisive source or applicant context is unknown.");
      if (
        f.classification === "Potential Contradiction" &&
        rs.some((r) => r.scopeMatch !== "matches")
      )
        guardNotes.push("A shared applicant scope has not been established.");
      if (
        f.classification === "Different Applicable Conditions" &&
        !rs.some((r) => r.scopeMatch === "matches")
      )
        guardNotes.push("The applicable applicant branch is not established.");
    }
    const classification = guardNotes.length
      ? "Insufficient Evidence"
      : f.classification;
    const question =
      f.clarificationQuestion.trim() ||
      (classification === "Insufficient Evidence"
        ? `Could you clarify which requirements and conditions for ${f.topic} apply to the intended program and applicant context?`
        : "");
    if (classification === "Potential Contradiction" && !question)
      fail("FINDING_QUESTION_EMPTY");
    return {
      id: `finding-${index + 1}`,
      topic: f.topic,
      classification,
      modelClassification: f.classification,
      explanation: f.explanation,
      clarificationQuestion: question,
      unknowns: f.unknowns.map((u) => u.detail),
      guardNotes,
      rules: rs.map((r) => {
        const ids = new Set(
          [r.requirement, r.scope, ...r.conditions, ...r.exceptions].flatMap(
            (c) => c.passageIds,
          ),
        );
        return {
          id: r.ruleId,
          sourceId: r.sourceId,
          description: r.requirement.text,
          scope: r.scope.text,
          scopeMatch: r.scopeMatch,
          conditionStatus: r.conditionStatus,
          conditions: r.conditions.map((c) => c.text),
          exceptions: r.exceptions.map((c) => c.text),
          evidence: Array.from(ids).map((id) => registry.get(id) as Evidence),
        };
      }),
    };
  });
  return {
    id: randomUUID(),
    revision,
    applicant,
    findings,
    limitations: [
      ...raw.limitations,
      "AI findings may omit requirements or misunderstand conditions. Source matching and human acceptance do not establish correctness or completeness.",
    ],
    model: "gemini-3.1-flash-lite",
  };
}
