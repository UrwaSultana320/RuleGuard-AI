export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public retryAfter?: number,
  ) {
    super(message);
  }
}
export function safeError(error: unknown) {
  return error instanceof AppError
    ? {
        code: error.code,
        message: error.message,
        ...(error.retryAfter ? { retryAfter: error.retryAfter } : {}),
      }
    : {
        code: "INCOMPLETE_ANALYSIS",
        message:
          "The comparison could not be completed. Your work is retained. Please retry or replace the documents.",
      };
}
