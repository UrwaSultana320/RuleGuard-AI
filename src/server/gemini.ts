import { z } from "zod";
import { rawSchema } from "@/shared/schemas";
import { LIMITS } from "@/shared/limits";
import type { Applicant, Source, ProviderProgress } from "@/shared/contracts";
import { instructions } from "./prompt";
import { AppError } from "./errors";
import { PROVIDER_BUDGET_MS, RESPONSE_RESERVE_MS, RETRY_MINIMUM_REMAINING_MS } from "./runtime-budget";
const MODEL = "gemini-3.1-flash-lite";

function providerError(status: number, body: unknown) {
  const googleError = (body as { error?: { details?: { reason?: string }[] } } | null)?.error;
  const invalidKey = Array.isArray(googleError?.details) && googleError.details.some((detail) => detail?.reason === "API_KEY_INVALID");
  if (status === 401 || status === 403 || invalidKey)
    return new AppError("PROVIDER_AUTHENTICATION", "The AI service credentials are invalid or access is denied. Please contact the site administrator.");
  if (status === 404)
    return new AppError("PROVIDER_MODEL_UNAVAILABLE", "The configured AI model is unavailable. Please contact the site administrator.");
  if (status === 429)
    return new AppError("PROVIDER_RATE_LIMIT", "The AI service quota or rate limit has been reached. Please try again later.");
  if (status === 400)
    return new AppError("PROVIDER_REQUEST_INVALID", "The AI service could not accept this analysis request. Please contact the site administrator.");
  if (status === 408 || status === 504)
    return new AppError("PROVIDER_TIMEOUT", "The AI service timed out. Your work is retained; please try again later.");
  return new AppError("PROVIDER_UNAVAILABLE", "The AI service is temporarily unavailable. Your work is retained; please try again later.");
}

function retryable(error: unknown): error is AppError {
  const status = error instanceof AppError ? error.providerDiagnostic?.httpStatus : null;
  return error instanceof AppError && error.code !== "PROVIDER_AUTHENTICATION" &&
    status != null && (status === 429 || (status >= 500 && status <= 599));
}
function retryAfterMs(value: string | null) {
  if (!value?.trim()) return 0;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;
  const date = Date.parse(value);
  return Number.isFinite(date) ? Math.max(0, date - Date.now()) : 0;
}
function pause(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    signal.throwIfAborted();
    const aborted = () => {
      clearTimeout(timer);
      reject(signal.reason);
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", aborted);
      resolve();
    }, ms);
    signal.addEventListener("abort", aborted, { once: true });
  });
}
export function hasGeminiKey() {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}
export function missingGeminiConfiguration() {
  console.error("[RuleGuard configuration] GEMINI_API_KEY is missing or empty. Set it on the server and restart the application.");
  return "AI analysis is unavailable because this server is not configured. Your extracted sources are available to inspect.";
}
export function requestContents(sources: Source[], applicant: Applicant) {
  return [
    {
      role: "user",
      parts: [
        {
          text: JSON.stringify({
            applicant,
            sources: sources.map((s) => ({
              sourceId: s.id,
              kind: s.kind,
              passages: s.passages.map((p) => ({
                passageId: p.id,
                text: p.text,
              })),
            })),
          }),
        },
      ],
    },
  ];
}
export async function analyze(
  sources: Source[],
  applicant: Applicant,
  reserve: (kind: "count" | "generation", tokens: number) => Promise<void>,
  signal: AbortSignal,
  options: {
    onProgress?: (progress: ProviderProgress) => void;
    onModelUsed?: (model: string) => void;
    deadlineAt?: number;
  } = {},
) {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key)
    throw new AppError(
      "AI_CONFIGURATION_MISSING",
      missingGeminiConfiguration(),
    );
  const fallback = process.env.GEMINI_FALLBACK_MODEL?.trim();
  if (fallback && !/^gemini-[a-z0-9.-]{1,80}$/.test(fallback))
    throw new AppError("AI_CONFIGURATION_INVALID", "The fallback model configuration is invalid. Please contact the site administrator.");
  // All attempts, counting and waits share one budget; callers may supply an
  // earlier deadline that includes upload parsing and source extraction.
  const deadlineAt = Math.min(
    (options.deadlineAt ?? Infinity) - RESPONSE_RESERVE_MS,
    Date.now() + PROVIDER_BUDGET_MS,
  );
  signal = AbortSignal.any([signal, AbortSignal.timeout(Math.max(0, deadlineAt - Date.now()))]);
  const contents = requestContents(sources, applicant);
  let notBefore = 0;
  const ensureActive = () => {
    if (signal.aborted || Date.now() >= deadlineAt)
      throw new AppError("UPSTREAM_UNCERTAIN", "The AI service timed out or the request was cancelled. Your work is retained; please try again later.");
  };
  async function call(model: string, method: string, body: unknown, tokens: number) {
    ensureActive();
    // Every dispatch (including retries and fallback) consumes a fresh atomic
    // quota reservation. A quota failure never triggers provider retries.
    await reserve(method === "countTokens" ? "count" : "generation", tokens);
    ensureActive();
    let response: Response;
    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:${method}`,
        {
          method: "POST",
          headers: {
            "x-goog-api-key": key as string,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
          signal,
          cache: "no-store",
        },
      );
    } catch {
      const diagnostic = { model, method, httpStatus: null,
        message: signal.aborted ? "Request aborted or timed out before an HTTP response." : "Network failure before an HTTP response." };
      console.error("[RuleGuard Gemini]", diagnostic);
      const failure = new AppError(
        "UPSTREAM_UNCERTAIN",
        signal.aborted
          ? "The AI service timed out or the request was cancelled. Your work is retained; please try again later."
          : "The AI service could not be reached. Your work is retained; please try again later.",
      );
      failure.providerDiagnostic = diagnostic;
      throw failure;
    }
    if (!response.ok) {
      let body: unknown;
      try { body = await response.json(); } catch { /* Never log an unstructured body. */ }
      const diagnostic = { model, method, httpStatus: response.status, message: `Google returned HTTP ${response.status}.` };
      console.error("[RuleGuard Gemini]", diagnostic);
      const failure = providerError(response.status, body);
      failure.providerDiagnostic = diagnostic;
      if (retryable(failure)) {
        const delayMs = retryAfterMs(response.headers.get("retry-after"));
        notBefore = Date.now() + delayMs;
        if (delayMs > 0) failure.retryAfter = Math.ceil(delayMs / 1000);
      }
      throw failure;
    }
    console.info("[RuleGuard Gemini]", { model, method, httpStatus: response.status });
    try {
      return await response.json();
    } catch {
      throw new AppError(
        "INCOMPLETE_ANALYSIS",
        "The AI response could not be read. Please retry later.",
      );
    }
  }
  async function wait(error: AppError, progress: ProviderProgress) {
    ensureActive();
    const delayMs = Math.max(progress.delayMs, notBefore - Date.now());
    // Never shorten Retry-After to squeeze in another call. Fail safely if it
    // cannot fit, retaining time for a useful attempt within the same budget.
    // Fallback uses this gate too; it never receives a fresh timeout budget.
    if (delayMs + RETRY_MINIMUM_REMAINING_MS >= deadlineAt - Date.now()) throw error;
    options.onProgress?.({ ...progress, delayMs });
    if (delayMs > 0) {
      try { await pause(delayMs, signal); }
      catch { ensureActive(); throw error; }
    }
    ensureActive();
  }
  async function withRetries(model: string, method: string, body: unknown, tokens: number, retries: number) {
    for (let attempt = 0; ; attempt++) {
      try { return await call(model, method, body, tokens); }
      catch (error) {
        if (!retryable(error) || attempt >= retries) throw error;
        await wait(error, {
          phase: "retry", attempt: attempt + 1,
          delayMs: 1000 * 2 ** attempt + Math.floor(Math.random() * 250),
        });
      }
    }
  }
  const schema = z.toJSONSchema(rawSchema);
  delete (schema as Record<string, unknown>).$schema;
  async function run(model: string, retries: number) {
    const count = await withRetries(model, "countTokens", {
      generateContentRequest: {
        model: `models/${model}`,
        systemInstruction: { parts: [{ text: instructions }] },
        contents,
      },
    }, LIMITS.inputTokens, retries);
    const tokens = count.totalTokens;
    if (!Number.isSafeInteger(tokens) || tokens < 1 || tokens > LIMITS.inputTokens)
      throw new AppError("TEXT_CAPACITY", "The full documents exceed the supported input-token capacity or could not be counted safely. No text was truncated.");
    return withRetries(model, "generateContent", {
      systemInstruction: { parts: [{ text: instructions }] },
      contents,
      generationConfig: {
        temperature: 1,
        maxOutputTokens: LIMITS.outputTokens,
        responseMimeType: "application/json",
        responseJsonSchema: schema,
      },
    }, tokens, retries);
  }
  let output;
  let modelUsed = MODEL;
  try { output = await run(MODEL, 3); }
  catch (error) {
    if (!fallback || fallback === MODEL || !retryable(error)) throw error;
    await wait(error, { phase: "fallback", attempt: 1, delayMs: 0 });
    modelUsed = fallback;
    // One fallback analysis only: recount for its model, then generate once.
    output = await run(fallback, 0);
  }
  const candidate = output.candidates?.[0];
  if (candidate?.finishReason !== "STOP")
    throw new AppError(
      "INCOMPLETE_ANALYSIS",
      "The AI analysis was blocked or incomplete. No completed report was created. Inspect the full sources or retry.",
    );
  try {
    const result = JSON.parse(
      candidate.content.parts
        .filter(
          (p: { text?: string; thought?: boolean }) => p.text && !p.thought,
        )
        .map((p: { text: string }) => p.text)
        .join(""),
    );
    options.onModelUsed?.(modelUsed);
    return result;
  } catch {
    throw new AppError(
      "INCOMPLETE_ANALYSIS",
      "The AI returned an unreadable structured response. No report was created.",
    );
  }
}
