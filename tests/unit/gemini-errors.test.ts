import { afterEach, expect, it, vi } from "vitest";
import { analyze } from "@/server/gemini";
import { safeError } from "@/server/errors";
import { extractDocument } from "@/server/documents";

const applicant = { degree: "Master's" as const, program: "PRIVATE_PROGRAM", intake: "PRIVATE_INTAKE", category: "PRIVATE_CATEGORY" };
const key = "private-api-key-for-tests";
async function sources() {
  return [await extractDocument(new File(["PRIVATE_DOCUMENT_TEXT that must stay private."], "private-file.txt"), "A")];
}
function setup() {
  vi.stubEnv("GEMINI_API_KEY", key);
  vi.stubEnv("GEMINI_FALLBACK_MODEL", "");
  vi.useFakeTimers();
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "info").mockImplementation(() => {});
  return log;
}
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.useRealTimers(); });

it.each([
  [400, "PROVIDER_REQUEST_INVALID", "could not accept"],
  [401, "PROVIDER_AUTHENTICATION", "credentials"],
  [403, "PROVIDER_AUTHENTICATION", "access is denied"],
  [404, "PROVIDER_MODEL_UNAVAILABLE", "model is unavailable"],
  [408, "PROVIDER_TIMEOUT", "timed out"],
  [429, "PROVIDER_RATE_LIMIT", "quota or rate limit"],
  [500, "PROVIDER_UNAVAILABLE", "temporarily unavailable"],
  [503, "PROVIDER_UNAVAILABLE", "temporarily unavailable"],
  [504, "PROVIDER_TIMEOUT", "timed out"],
])("maps Google HTTP %i safely at either API stage", async (status, code, message) => {
  const log = setup();
  for (const method of ["countTokens", "generateContent"]) {
    const fetcher = vi.fn();
    if (method === "generateContent") fetcher.mockResolvedValueOnce(Response.json({ totalTokens: 100 }));
    fetcher.mockImplementation(() => Promise.resolve(Response.json({ error: { code: status, message: "Exact Google diagnostic for administrators" } }, { status })));
    vi.stubGlobal("fetch", fetcher);
    const pending = analyze(await sources(), applicant, vi.fn(), new AbortController().signal).catch(e => e);
    await vi.runAllTimersAsync();
    const error = await pending;
    expect(safeError(error)).toEqual({ code, message: expect.stringContaining(message) });
    expect(log).toHaveBeenLastCalledWith("[RuleGuard Gemini]", {
      model: "gemini-3.1-flash-lite", method, httpStatus: status, message: `Google returned HTTP ${status}.`,
    });
    expect(JSON.stringify(safeError(error))).not.toContain("Exact Google diagnostic");
    expect(fetcher).toHaveBeenCalledTimes((status === 429 || status >= 500 ? 4 : 1) + (method === "generateContent" ? 1 : 0));
  }
});

it("recognizes Google's API_KEY_INVALID reason even with HTTP 400", async () => {
  setup();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ error: { message: "API key not valid. Please pass a valid API key.", details: [{ reason: "API_KEY_INVALID" }] } }, { status: 400 })));
  await expect(analyze(await sources(), applicant, vi.fn(), new AbortController().signal)).rejects.toMatchObject({ code: "PROVIDER_AUTHENTICATION" });
});

it.each([key, "PRIVATE_DOCUMENT_TEXT", "DOCUMENT_TEXT that", "PRIVATE_PROGRAM", "private-file.txt"])("redacts echoed credentials or input: %s", async (secret) => {
  const log = setup();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ error: { message: `Invalid value: ${secret}` } }, { status: 400 })));
  const error = await analyze(await sources(), applicant, vi.fn(), new AbortController().signal).catch(e => e);
  expect(JSON.stringify(log.mock.calls)).not.toContain(secret);
  expect(JSON.stringify(safeError(error))).not.toContain(secret);
});

it("does not log an unstructured Google response body", async () => {
  const log = setup();
  vi.stubGlobal("fetch", vi.fn().mockImplementation(() => Promise.resolve(new Response(`private HTML ${key}`, { status: 502 }))));
  const pending = analyze(await sources(), applicant, vi.fn(), new AbortController().signal).catch(e => e);
  await vi.runAllTimersAsync();
  expect(await pending).toMatchObject({ code: "PROVIDER_UNAVAILABLE" });
  expect(JSON.stringify(log.mock.calls)).not.toContain(key);
});

it.each([false, true])("distinguishes transport failure from cancellation/timeout (aborted=%s)", async (aborted) => {
  const log = setup();
  const controller = new AbortController();
  if (aborted) controller.abort();
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error(`Sensitive transport error ${key}`)));
  const error = await analyze(await sources(), applicant, vi.fn(), controller.signal).catch(e => e);
  expect(safeError(error)).toMatchObject({ code: "UPSTREAM_UNCERTAIN", message: expect.stringContaining(aborted ? "timed out" : "could not be reached") });
  if (!aborted) expect(error.providerDiagnostic.httpStatus).toBeNull();
  expect(log).toHaveBeenCalledTimes(aborted ? 0 : 1);
  expect(JSON.stringify(log.mock.calls)).not.toContain(key);
});
