import { extractDocument } from "../../src/server/documents";
import type { Applicant } from "../../src/shared/contracts";
import type { RawAnalysis } from "../../src/shared/schemas";

// Authored synthetic source pairs AND expected model outputs. Not model measurements,
// runtime rules, or fallbacks. Tests exercise extraction, contracts and safeguards.
export const admissionsApplicant: Applicant = {
  degree: "Master's", program: "Computing", intake: "September 2026", category: "International applicant",
};
type Scenario = {
  topic: string; a: string; b?: string;
  classification: RawAnalysis["findings"][number]["classification"];
  selectorUnknown?: boolean; differentStage?: boolean; exception?: string; missingFact?: string;
};
export const admissionsCases: Scenario[] = [
  { topic: "Apostille at application", a: "An apostille on the final degree certificate is mandatory at application submission.", b: "An apostille on the final degree certificate is not required at application submission; an uncertified copy is sufficient at this stage.", classification: "Potential Contradiction" },
  { topic: "Apostille submission stages", a: "An apostille on the final degree certificate is mandatory at enrolment.", b: "An apostille on the final degree certificate is not required at application submission; the enrolment requirement remains separate.", classification: "Different Applicable Conditions", differentStage: true },
  { topic: "Minimum GPA", a: "The minimum cumulative GPA for admission is 3.0 on a 4.0 scale.", b: "The minimum cumulative GPA for admission is 3.5 on a 4.0 scale.", classification: "Potential Contradiction" },
  { topic: "Transcript format", a: "A certified transcript copy is mandatory at application submission; an uncertified copy is not accepted.", b: "An uncertified transcript copy is sufficient at application submission; certification is not required at this stage.", classification: "Potential Contradiction" },
  { topic: "Application deadline", a: "The application submission deadline for September 2026 is 1 June 2026 at 17:00 UTC.", b: "The application submission deadline for September 2026 is 15 June 2026 at 17:00 UTC.", classification: "Potential Contradiction" },
  { topic: "Translation exemption", a: "A certified English translation is required for a certificate issued in another language. Certificates issued in English are exempt.", b: "Certificates issued in English are exempt from translation; all other certificates require a certified English translation.", classification: "Consistent", exception: "Certificates issued in English are exempt" },
  { topic: "Uncertain translation exemption", a: "A translation waiver applies only to applicants whose certificates were issued in English.", b: "An English-language certificate does not require translation; other certificates require a certified translation.", classification: "Insufficient Evidence", selectorUnknown: true },
  { topic: "Missing recommendation evidence", a: "Two academic recommendation letters must be submitted with the application.", classification: "Insufficient Evidence" },
  { topic: "Statement of purpose", a: "Submit a statement of purpose of no more than 500 words with the application.", b: "Submit a statement of purpose of no more than 500 words with the application.", classification: "Consistent" },
  { topic: "Curriculum vitae", a: "Submit a current CV with the application.", b: "Submit a current CV with the application.", classification: "Consistent" },
  { topic: "Application fee", a: "The non-refundable application fee is EUR 50, payable at application submission.", b: "The non-refundable application fee is EUR 75, payable at application submission.", classification: "Potential Contradiction" },
  { topic: "Financial evidence", a: "Provide evidence of EUR 12000 in available funds before enrolment.", b: "Provide evidence of EUR 12000 in available funds before enrolment.", classification: "Consistent" },
  { topic: "Academic prerequisites", a: "Applicants must have completed a bachelor's course in linear algebra before admission.", b: "Applicants must have completed a bachelor's course in linear algebra before admission.", classification: "Consistent" },
  { topic: "Notarization and attestation", a: "Final academic certificates must be notarized and attested before enrolment.", b: "Final academic certificates must be notarized and attested before enrolment.", classification: "Consistent" },
  { topic: "English proficiency", a: "IELTS Academic 6.5 is required unless an approved English-taught degree exemption applies.", b: "IELTS Academic 6.5 is required unless an approved English-taught degree exemption applies.", classification: "Consistent", exception: "unless an approved English-taught degree exemption applies" },
  { topic: "Portfolio interview", a: "A portfolio review and interview are required before an offer can be issued.", b: "A portfolio review and interview are required before an offer can be issued.", classification: "Consistent" },
  { topic: "Deadline stages", a: "The application must be submitted by 1 June 2026; supporting documents may follow.", b: "Supporting documents must arrive by 15 June 2026 after application submission.", classification: "Different Applicable Conditions", differentStage: true },
  { topic: "Unestablished GPA scale equivalence", a: "The minimum cumulative GPA is 3.0 on a 4.0 scale.", b: "The minimum final grade is 70 percent; no GPA conversion is specified.", classification: "Insufficient Evidence", selectorUnknown: true, missingFact: "The sources do not establish equivalence between the 4.0 GPA scale and percentage grades." },
];

export async function admissionsFixture(cases = admissionsCases, degree: Applicant["degree"] = "Master's") {
  const applicant = { ...admissionsApplicant, degree };
  const scope = `This policy applies to international ${degree} applicants for Computing, September 2026.`;
  const sources = await Promise.all(["A", "B"].map(id => extractDocument(new File([
    scope + "\n" + cases.map(c => id === "A" ? c.a : c.b ?? "Contact admissions for additional document requirements.").join("\n"),
  ], `Admissions-${id}.txt`), id)));
  const raw: RawAnalysis = {
    analysisStatus: "complete", sourceIds: ["A", "B"], limitations: ["Offline authored model-output fixture; semantic reasoning is not measured."],
    documentAssessments: sources.map(s => ({ sourceId: s.id, status: "selected", explanation: scope,
      evidence: [{ text: scope, passageIds: [s.passages[0].id] }], missingInformation: [], exclusivelyOtherDegree: false, conflictingEvidence: false })),
    rules: [], findings: [], coverage: [],
  };
  cases.forEach((c, i) => {
    const ruleIds: string[] = [];
    sources.forEach(s => {
      const text = s.id === "A" ? c.a : c.b;
      if (!text) return;
      const passageIds = s.passages.filter(p => p.text.includes(text)).map(p => p.id);
      if (!passageIds.length) throw Error("Fixture clause must fit in a source passage");
      const requirement = { text, passageIds };
      const ruleId = `${s.id}-${i}`;
      ruleIds.push(ruleId);
      raw.rules.push({ ruleId, sourceId: s.id, requirement,
        scope: { text: scope, passageIds: [s.passages[0].id] }, degreeMatch: "selected",
        degreeEvidence: { text: scope, passageIds: [s.passages[0].id] },
        scopeMatch: c.selectorUnknown ? "unknown" : "matches", conditionStatus: "unknown",
        conditions: [requirement], exceptions: c.exception ? [requirement] : [] });
    });
    raw.findings.push({ topic: c.topic, ruleIds, classification: c.classification,
      explanation: `Document A states: ${c.a} Document B ${c.b ? `states: ${c.b}` : "has no supporting rule identified"}${c.differentStage ? " These are distinct submission stages, not incompatible instructions at the same stage." : ""}`,
      clarificationQuestion: `Could you confirm the applicable requirement for ${c.topic}?`,
      unknowns: c.selectorUnknown ? [{ detail: c.missingFact ?? "The certificate's language is not supplied, so the exemption branch cannot be selected.", kind: c.missingFact ? "qualification_identity" : "applicant_selector", blocksComparison: true }]
        : !c.b ? [{ detail: "No supporting recommendation rule was identified in the second source; its requirement cannot be established.", kind: "missing_source_support", blocksComparison: true }] : [],
    });
  });
  raw.coverage = sources.flatMap(s => s.passages.map(p => {
    const ruleIds = raw.rules.filter(r => r.sourceId === s.id && [r.requirement, r.scope].some(c => c.passageIds.includes(p.id))).map(r => r.ruleId);
    return { passageId: p.id, ruleIds, disposition: ruleIds.length ? "rules" as const : "context_only" as const, reason: "Account for each complete supplied passage." };
  }));
  return { applicant, sources, raw };
}
