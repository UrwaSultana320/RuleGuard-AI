export const LIMITS = Object.freeze({
  fileBytes: 2_000_000,
  pdfPages: 15,
  bodyBytes: 4_100_000,
  textCharacters: 60_000,
  inputTokens: 20_000,
  outputTokens: 8192,
  timeoutMs: 240_000,
  dayAttempts: 100,
  minuteStarts: 10,
  concurrency: 2,
  providerRpm: 15,
  providerRpd: 500,
  inputTpm: 250_000,
});
export const CATEGORIES = [
  "Consistent",
  "Potential Contradiction",
  "Different Applicable Conditions",
  "Insufficient Evidence",
] as const;
export const STAGES = [
  "Reading uploaded documents",
  "Extracting requirements",
  "Checking applicant-specific conditions",
  "Comparing requirements",
  "Preparing evidence-based report",
] as const;
export const PRIVACY =
  "Use public university or clearly labeled synthetic documents and nonsensitive context only. Your documents and extracted text are processed by our backend and sent to Google Gemini for AI analysis. Google may process, retain and use Free Tier content, including human review, under its separate terms. RuleGuard keeps uploaded work only in this active application session; refreshing or closing clears it. Results for built-in synthetic examples may be saved temporarily on the server for reuse during service outages. User-uploaded documents are never cached. RuleGuard AI is not an official university admissions service.";
