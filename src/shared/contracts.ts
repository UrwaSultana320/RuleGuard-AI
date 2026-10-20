import type { CATEGORIES } from "./limits";
export type Category = (typeof CATEGORIES)[number];
export type Review = "Pending" | "Accepted" | "Rejected" | "Uncertain";
export type Applicant = {
  degree: "Master's";
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
export type Evidence = Passage & { sourceName: string };
export type Rule = {
  id: string;
  sourceId: string;
  description: string;
  scope: string;
  scopeMatch: string;
  conditionStatus: string;
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
  findings: Finding[];
  limitations: string[];
  model: string;
};
export type Event = { requestId: string; revision: number } & (
  | { type: "stage"; stage: number }
  | { type: "sources"; sources: Source[] }
  | { type: "result"; report: Report }
  | {
      type: "error";
      code: string;
      message: string;
      diagnosticCode?: string;
      retryAfter?: number;
    }
);
