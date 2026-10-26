import type { CATEGORIES } from "./limits";
export type Category = (typeof CATEGORIES)[number];
export type Review = "Pending" | "Accepted" | "Rejected" | "Uncertain";
export type Degree = "Bachelor's" | "Master's";
export type Applicant = {
  degree: Degree;
  program: string;
  intake: string;
  category: string;
};
export type Passage = {
  id: string;
  sourceId: string;
  page: number | null;
  lineStart: number;
  lineEnd: number;
  text: string;
};
export type Source = {
  id: string;
  hash: string;
  name: string;
  kind: "PDF" | "TXT";
  bytes: number;
  pages: { number: number; text: string }[];
  passages: Passage[];
};
export type Evidence = Passage & {
  sourceName: string;
  /** Issued by the backend only after resolving a validated source passage. */
  sourceVerified?: true;
};
export type DegreeStatus =
  | "selected"
  | "other_degree"
  | "multiple"
  | "general"
  | "uncertain";
export type DegreeAssessment = {
  sourceId: string;
  status: DegreeStatus;
  modelStatus: DegreeStatus;
  explanation: string;
  evidence: Evidence[];
  missingInformation: string[];
  guardNotes: string[];
};
export type Applicability = {
  assessments: DegreeAssessment[];
  gate: "allowed" | "uncertain" | "blocked";
};
export type Rule = {
  id: string;
  sourceId: string;
  description: string;
  scope: string;
  scopeMatch: string;
  conditionStatus: string;
  degreeMatch: "selected" | "general" | "other" | "unknown";
  conditions: string[];
  exceptions: string[];
  evidence: Evidence[];
};
export type Finding = {
  id: string;
  topic: string;
  classification: Category;
  modelClassification: Category;
  explanation: string;
  clarificationQuestion: string;
  unknowns: string[];
  guardNotes: string[];
  rules: Rule[];
};
export type Report = {
  id: string;
  revision: number;
  applicant: Applicant;
  applicability: Applicability;
  degreeVerification: "supported" | "unverified";
  findings: Finding[];
  limitations: string[];
  model: string;
  savedExample?: true;
};
export type ProviderProgress = {
  phase: "retry" | "fallback";
  attempt: number;
  delayMs: number;
};
export type Event = { requestId: string; revision: number } & (
  | { type: "stage"; stage: number }
  | { type: "provider_progress"; progress: ProviderProgress }
  | { type: "sources"; sources: Source[] }
  | { type: "result"; report: Report }
  | { type: "applicability"; applicability: Applicability }
  | { type: "info"; code: "AI_CONFIGURATION_MISSING"; message: string }
  | {
      type: "error";
      code: string;
      message: string;
      diagnosticCode?: string;
      retryAfter?: number;
    }
);
