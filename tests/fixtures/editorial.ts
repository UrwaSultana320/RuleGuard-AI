import type { Finding, Report, Source } from "@/shared/contracts";
import { displayAssessments } from "./degree";

// Purpose-built offline DESIGN data. Never imported by application code and
// never presented as a measured Gemini response or admissions guidance.
const textA = [
  "SYNTHETIC POLICY — not real admissions guidance. This policy covers international Master's applicants to Computing, September 2026.",
  "IELTS Academic: overall 6.5, with no component below 6.0.",
  "An official certificate of three completed years of English-taught study may replace IELTS, subject to admissions approval.",
  "Academic English course entry requires IELTS 5.5. Course entry is conditional and does not itself satisfy Master's admission requirements.",
];
const textB = [
  "SYNTHETIC PROGRAMME GUIDANCE — not real admissions guidance. This guide covers international Master's applicants to Computing, September 2026.",
  "IELTS Academic: overall 6.5, with no component below 6.0.",
  "An English-medium instruction certificate cannot replace IELTS for this programme. No waiver is available under this rule.",
  "Completion and the required final grade of an Academic English qualification must be confirmed by admissions. This guide does not identify equivalent certificate names.",
];
export const editorialSources: Source[] = [textA, textB].map((lines, index) => {
  const id = index === 0 ? "A" : "B";
  return {
    id,
    hash: "offline-design-fixture",
    name: index === 0 ? "Admissions-policy.txt" : "Programme-guidance.txt",
    kind: "TXT",
    bytes: lines.join("\n").length,
    pages: [{ number: 1, text: lines.join("\n") }],
    passages: lines.map((text, i) => ({
      id: `${id}-design-${i + 1}`,
      sourceId: id,
      page: null,
      lineStart: i + 1,
      lineEnd: i + 1,
      text,
    })),
  };
});
function rules(
  line: number,
  description: string,
  conditions: string[],
  exceptions: string[],
) {
  return editorialSources.map((s) => ({
    id: `${s.id}-rule-${line}`,
    sourceId: s.id,
    degreeMatch: "selected" as const,
    description,
    scope: "International Master's applicants · Computing · September 2026",
    scopeMatch: "matches",
    conditionStatus: "unknown",
    conditions,
    exceptions,
    evidence: [{ ...s.passages[line - 1], sourceName: s.name }],
  }));
}
const findings: Finding[] = [
  {
    id: "certificate",
    topic: "English-medium certificates",
    classification: "Potential Contradiction",
    modelClassification: "Potential Contradiction",
    explanation:
      "One policy permits a certificate-based alternative with approval; the programme guide rejects that substitute. Ask admissions which rule applies before relying on a waiver.",
    clarificationQuestion:
      "For international Master's applicants to Computing in September 2026, can an official English-medium instruction certificate replace IELTS, and what approval is required?",
    unknowns: [
      "Whether the applicant holds the required certificate and has admissions approval is unknown.",
    ],
    guardNotes: [],
    rules: rules(
      3,
      "The documents describe incompatible certificate-substitution policies for the same stated context.",
      [
        "Official evidence and any required admissions approval must be confirmed.",
      ],
      [],
    ),
  },
  {
    id: "score",
    topic: "IELTS score requirements",
    classification: "Consistent",
    modelClassification: "Consistent",
    explanation:
      "Both supplied texts state the same overall and component minimums. This does not establish that the applicant has achieved them.",
    clarificationQuestion: "",
    unknowns: [],
    guardNotes: [],
    rules: rules(
      2,
      "IELTS Academic overall 6.5; each component at least 6.0.",
      ["The applicant must provide accepted evidence of the stated scores."],
      [],
    ),
  },
  {
    id: "pathway",
    topic: "Course entry and degree admission",
    classification: "Different Applicable Conditions",
    modelClassification: "Different Applicable Conditions",
    explanation:
      "Course-entry evidence and final degree-entry evidence serve different purposes. Starting a course does not establish its completion or an admission exemption.",
    clarificationQuestion: "",
    unknowns: [],
    guardNotes: [],
    rules: rules(
      4,
      "Distinguish conditional course entry from completion and required final grades.",
      [
        "Completion, final achievement and admissions acceptance require confirmation.",
      ],
      [],
    ),
  },
  {
    id: "identity",
    topic: "Qualification equivalence",
    classification: "Insufficient Evidence",
    modelClassification: "Insufficient Evidence",
    explanation:
      "The supplied text does not establish that differently named English qualifications are equivalent. No automatic exemption should be assumed.",
    clarificationQuestion:
      "Which exact Academic English qualification and final result are accepted for this programme?",
    unknowns: [
      "The accepted qualification identity and required final achievement are not established.",
    ],
    guardNotes: [],
    rules: rules(
      4,
      "A named qualification and its required result need official confirmation.",
      [],
      [],
    ),
  },
];
export function editorialReport(revision: number): Report {
  return {
    id: "offline-editorial-review",
    revision,
    applicant: {
      degree: "Master's",
      program: "MSc Computing · Offline visual fixture",
      intake: "September 2026",
      category: "International applicant",
    },
    applicability: {
      gate: "allowed",
      assessments: displayAssessments(editorialSources).map((a) => ({
        ...a,
        explanation:
          "Offline design fixture: the synthetic scope explicitly includes Master's Computing applicants.",
      })),
    },
    degreeVerification: "supported",
    model: "OFFLINE DESIGN FIXTURE — no Gemini request",
    findings,
    limitations: [
      "Constructed for interface review only. These classifications are not a live model evaluation. Real AI interpretations may be incorrect or incomplete.",
    ],
  };
}
