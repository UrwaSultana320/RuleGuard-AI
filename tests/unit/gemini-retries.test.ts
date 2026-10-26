import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { analyze } from "@/server/gemini";
import { extractDocument } from "@/server/documents";
import { AppError } from "@/server/errors";
import type { ProviderProgress } from "@/shared/contracts";

const applicant = { degree: "Master's" as const, program: "Private program", intake: "Private intake", category: "Private category" };
const primary = "gemini-3.1-flash-lite";
const fallback = "gemini-test-fallback"; // Transport fixture, never a runtime default.
const count = () => Response.json({ totalTokens: 100 });
const success = () => Response.json({ candidates: [{ finishReason: "STOP", content: { parts: [{ text: '{"offline":true}' }] } }] });
const failure = (status = 503, headers?: HeadersInit) => () => Response.json({ error: { message: "PRIVATE echoed text and key" } }, { status, headers });
async function inputs() {
  return [await extractDocument(new File(["PRIVATE document text."], "private.txt"), "A")];
}
function transport(...responses: (() => Response)[]) {
  const fetcher = vi.fn().mockImplementation(() => {
    const response = responses.shift();
    if (!response) throw new Error("Unexpected extra dispatch");
    return Promise.resolve(response());
  });
  vi.stubGlobal("fetch", fetcher);
  return fetcher;
}
async function run(reserve = vi.fn(), options: Parameters<typeof analyze>[4] = {}) {
  const pending = analyze(await inputs(), applicant, reserve, new AbortController().signal, options).catch(error => error);
  await vi.runAllTimersAsync();
  return pending;
}
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubEnv("GEMINI_API_KEY", "PRIVATE_KEY");
  vi.stubEnv("GEMINI_FALLBACK_MODEL", "");
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(Math, "random").mockReturnValue(0.5);
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

it("recovers from 503 generation errors with exponential backoff and jitter", async () => {
  const fetcher = transport(count, failure(), failure(), failure(), success);
  const reserve = vi.fn();
  const progress: ProviderProgress[] = [];
  expect(await run(reserve, { onProgress: event => progress.push(event) })).toEqual({ offline: true });
  expect(fetcher).toHaveBeenCalledTimes(5);
  expect(progress.map(event => event.delayMs)).toEqual([1125, 2125, 4125]);
  expect(progress.map(event => event.attempt)).toEqual([1, 2, 3]);
  expect(reserve.mock.calls).toEqual([["count", 20000], ...Array.from({ length: 4 }, () => ["generation", 100])]);
});
it("retries token counting on 429 before generating", async () => {
  const fetcher = transport(failure(429), count, success);
  expect(await run()).toEqual({ offline: true });
  expect(fetcher.mock.calls.map(call => String(call[0]).split(":").at(-1))).toEqual(["countTokens", "countTokens", "generateContent"]);
});
it("exhausts exactly three retries and preserves a friendly error with no fallback configured", async () => {
  const fetcher = transport(count, failure(), failure(), failure(), failure());
  expect(await run()).toMatchObject({ code: "PROVIDER_UNAVAILABLE" });
  expect(fetcher).toHaveBeenCalledTimes(5);
});
it.each([400, 401, 403])("never retries or falls back after HTTP %i", async status => {
  vi.stubEnv("GEMINI_FALLBACK_MODEL", fallback);
  const fetcher = transport(count, failure(status));
  expect(await run()).toBeInstanceOf(AppError);
  expect(fetcher).toHaveBeenCalledTimes(2);
});
it("uses the configured fallback once, recounts tokens and reports the actual model", async () => {
  vi.stubEnv("GEMINI_FALLBACK_MODEL", fallback);
  const fetcher = transport(count, failure(), failure(), failure(), failure(), count, success);
  const onModelUsed = vi.fn();
  const onProgress = vi.fn();
  expect(await run(vi.fn(), { onModelUsed, onProgress })).toEqual({ offline: true });
  expect(fetcher.mock.calls.map(call => String(call[0]))).toEqual([
    `${primary}:countTokens`, ...Array(4).fill(`${primary}:generateContent`),
    `${fallback}:countTokens`, `${fallback}:generateContent`,
  ].map(endpoint => `https://generativelanguage.googleapis.com/v1beta/models/${endpoint}`));
  expect(onProgress).toHaveBeenLastCalledWith({ phase: "fallback", attempt: 1, delayMs: 0 });
  expect(onModelUsed).toHaveBeenCalledExactlyOnceWith(fallback);
  const fallbackBody = JSON.parse(fetcher.mock.calls[5][1].body);
  expect(fallbackBody.generateContentRequest.model).toBe(`models/${fallback}`);
});
it("does not retry the fallback even if it returns 503", async () => {
  vi.stubEnv("GEMINI_FALLBACK_MODEL", fallback);
  const fetcher = transport(count, failure(), failure(), failure(), failure(), count, failure());
  expect(await run()).toMatchObject({ code: "PROVIDER_UNAVAILABLE" });
  expect(fetcher).toHaveBeenCalledTimes(7);
});
it.each(["5", "date"])("respects Retry-After in %s format", async format => {
  const header = format === "date" ? new Date(Date.now() + 5000).toUTCString() : "5";
  const fetcher = transport(count, failure(429, { "Retry-After": header }), success);
  const start = Date.now();
  const onProgress = vi.fn();
  expect(await run(vi.fn(), { onProgress })).toEqual({ offline: true });
  expect(onProgress.mock.calls[0][0].delayMs).toBeGreaterThanOrEqual(4000);
  expect(Date.now() - start).toBeGreaterThanOrEqual(4000);
  expect(fetcher).toHaveBeenCalledTimes(3);
});
it("does not violate a Retry-After that exceeds the total time budget, including fallback", async () => {
  vi.stubEnv("GEMINI_FALLBACK_MODEL", fallback);
  const fetcher = transport(count, failure(503, { "Retry-After": "300" }));
  const start = Date.now();
  expect(await run()).toMatchObject({ code: "PROVIDER_UNAVAILABLE", retryAfter: 300 });
  expect(fetcher).toHaveBeenCalledTimes(2);
  expect(Date.now()).toBe(start);
});

it("keeps retries and fallback inside the shared 210-second provider budget", async () => {
  vi.stubEnv("GEMINI_FALLBACK_MODEL", fallback);
  const fetcher = transport(count, failure(503, { "Retry-After": "200" }));
  expect(await run()).toMatchObject({ code: "PROVIDER_UNAVAILABLE" });
  // 200 seconds of waiting plus the minimum useful 15-second attempt cannot fit.
  expect(fetcher).toHaveBeenCalledTimes(2);
});

it("reserves final-response time before allowing a retry under an earlier route deadline", async () => {
  const fetcher = transport(count, failure(503, { "Retry-After": "10" }));
  expect(await run(vi.fn(), { deadlineAt: Date.now() + 30_000 })).toMatchObject({ code: "PROVIDER_UNAVAILABLE" });
  expect(fetcher).toHaveBeenCalledTimes(2);
});
it("also honors the final primary Retry-After before using fallback", async () => {
  vi.stubEnv("GEMINI_FALLBACK_MODEL", fallback);
  transport(count, failure(), failure(), failure(), failure(503, { "Retry-After": "10" }), count, success);
  const onProgress = vi.fn();
  expect(await run(vi.fn(), { onProgress })).toEqual({ offline: true });
  expect(onProgress).toHaveBeenLastCalledWith({ phase: "fallback", attempt: 1, delayMs: 10000 });
});
it("quota failure on a retry prevents further provider or fallback dispatches", async () => {
  vi.stubEnv("GEMINI_FALLBACK_MODEL", fallback);
  const fetcher = transport(count, failure());
  const reserve = vi.fn().mockResolvedValueOnce(undefined).mockResolvedValueOnce(undefined)
    .mockRejectedValue(new AppError("DAILY_CAPACITY", "Daily capacity exhausted"));
  expect(await run(reserve)).toMatchObject({ code: "DAILY_CAPACITY" });
  expect(fetcher).toHaveBeenCalledTimes(2);
});
it("cancellation during backoff stops all further attempts", async () => {
  const fetcher = transport(count, failure());
  const controller = new AbortController();
  const pending = analyze(await inputs(), applicant, vi.fn(), controller.signal, {
    onProgress: () => controller.abort(),
  }).catch(error => error);
  await vi.runAllTimersAsync();
  expect(await pending).toMatchObject({ code: "UPSTREAM_UNCERTAIN" });
  expect(fetcher).toHaveBeenCalledTimes(2);
});
it("an expired shared deadline cannot dispatch even the token utility", async () => {
  const fetcher = transport(count);
  expect(await run(vi.fn(), { deadlineAt: Date.now() - 1 })).toMatchObject({ code: "UPSTREAM_UNCERTAIN" });
  expect(fetcher).not.toHaveBeenCalled();
});
it("an incomplete successful response is not retried or sent to fallback", async () => {
  vi.stubEnv("GEMINI_FALLBACK_MODEL", fallback);
  const fetcher = transport(count, () => Response.json({ candidates: [{ finishReason: "MAX_TOKENS" }] }));
  expect(await run()).toMatchObject({ code: "INCOMPLETE_ANALYSIS" });
  expect(fetcher).toHaveBeenCalledTimes(2);
});
it("never logs echoed provider error messages, keys or document text on retries", async () => {
  transport(count, failure(), failure(), failure(), failure());
  await run();
  const logs = JSON.stringify(vi.mocked(console.error).mock.calls);
  expect(logs).not.toContain("PRIVATE");
  expect(logs).not.toContain("private.txt");
  expect(logs).toContain("Google returned HTTP 503.");
});
