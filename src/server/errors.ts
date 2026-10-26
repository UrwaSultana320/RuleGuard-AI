// Static codes only: never include model text, identifiers, filenames or credentials.
export type ValidationDiagnostic =
  | "DEGREE_ASSESSMENT_SET_MISMATCH"
  | "DEGREE_EVIDENCE_MISSING"
  | "DEGREE_EVIDENCE_INVALID"
  | "FINDING_OTHER_DEGREE_RULE"
  | "ANALYSIS_INCOMPLETE"
  | "SOURCE_SET_MISMATCH"
  | "RULE_ID_EMPTY"
  | "RULE_ID_DUPLICATE"
  | "RULE_SOURCE_UNKNOWN"
  | "CLAUSE_TEXT_EMPTY"
  | "CLAUSE_REFERENCES_EMPTY"
  | "CLAUSE_PASSAGE_UNKNOWN"
  | "CLAUSE_SOURCE_MISMATCH"
  | "COVERAGE_PASSAGE_UNKNOWN"
  | "COVERAGE_PASSAGE_DUPLICATE"
  | "COVERAGE_REASON_EMPTY"
  | "COVERAGE_RULES_EMPTY"
  | "COVERAGE_RULE_UNKNOWN"
  | "COVERAGE_RULE_PASSAGE_MISMATCH"
  | "COVERAGE_INCOMPLETE"
  | "FINDING_TOPIC_EMPTY"
  | "FINDING_TOPIC_DUPLICATE"
  | "FINDING_RULES_EMPTY"
  | "FINDING_EXPLANATION_EMPTY"
  | "FINDING_RULE_UNKNOWN"
  | "FINDING_QUESTION_EMPTY"
  | "ANALYSIS_SCHEMA_INVALID";

export class AppError extends Error {
  // Server-only diagnostics; safeError deliberately never serializes this field.
  providerDiagnostic?: { model: string; method: string; httpStatus: number | null; message: string };
  constructor(
    public code: string,
    message: string,
    public retryAfter?: number,
    public diagnosticCode?: ValidationDiagnostic,
  ) {
    super(message);
  }
}
export function safeError(error: unknown) {
  return error instanceof AppError
    ? {
        code: error.code,
        message: error.message,
        ...(error.diagnosticCode
          ? { diagnosticCode: error.diagnosticCode }
          : {}),
        ...(error.retryAfter ? { retryAfter: error.retryAfter } : {}),
      }
    : {
        code: "INCOMPLETE_ANALYSIS",
        message:
          "The comparison could not be completed. Your work is retained. Please retry or replace the documents.",
      };
}
