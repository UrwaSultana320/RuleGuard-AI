import { readFile } from "node:fs/promises";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import type { Applicant, Event, Source } from "@/shared/contracts";
import type { RawAnalysis } from "@/shared/schemas";
import { AppError } from "@/server/errors";
import { rawAssessments } from "../fixtures/degree";
import { exampleCache } from "@/server/example-cache";
const fake = vi.hoisted(() => ({ analyze: vi.fn(), acquire: vi.fn(), release: vi.fn() }));
vi.mock("@/server/gemini", () => ({ analyze: fake.analyze, hasGeminiKey: () => true, missingGeminiConfiguration: vi.fn() }));
vi.mock("@/server/quota", () => ({ redisClient: vi.fn(), acquire: fake.acquire }));
import { POST } from "@/app/api/compare/route";
function raw(sources: Source[]): RawAnalysis {
  return {
    analysisStatus: "complete", sourceIds: ["A", "B"], limitations: [],
    documentAssessments: rawAssessments(sources),
    rules: sources.map(source => {
      const clause = { text: "Offline cache test interpretation.", passageIds: source.passages.map(p => p.id) };
      return { ruleId: source.id, sourceId: source.id, degreeMatch: "selected", degreeEvidence: clause,
        requirement: clause, scope: clause, scopeMatch: "matches", conditionStatus: "unknown", conditions: [], exceptions: [] };
    }),
    coverage: sources.flatMap(source => source.passages.map(p => ({ passageId: p.id, disposition: "rules" as const, ruleIds: [source.id], reason: "Offline fixture complete coverage." }))),
    findings: [{ topic: "Offline cache test", ruleIds: ["A", "B"], classification: "Potential Contradiction", explanation: "Offline fixture only; not a real model evaluation.", unknowns: [], clarificationQuestion: "Which rule applies?" }],
  };
}
let applicant: Applicant;
let counter = 0;
beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  applicant = { degree: "Master's", program: `Offline cache case ${++counter}`, intake: "September 2026", category: "International applicant" };
  fake.acquire.mockResolvedValue({ reserve: vi.fn(), release: fake.release });
  fake.analyze.mockImplementation(async (...args: Parameters<typeof import("@/server/gemini").analyze>) => {
    args[4]?.onModelUsed?.("gemini-offline-cache-test");
    return raw(args[0]);
  });
});
afterEach(() => vi.restoreAllMocks());
async function run(options: { origin?: string | null; changeBytes?: boolean; context?: Applicant; revision?: number } = {}) {
  const form = new FormData();
  for (const id of ["A", "B"]) {
    const bytes = await readFile(`public/samples/synthetic-${id}.txt`);
    form.append(`document${id}`, new File([bytes, options.changeBytes && id === "A" ? " " : ""], `Synthetic-policy-${id}.txt`));
  }
  const origin = options.origin === undefined ? "built-in-synthetic" : options.origin;
  if (origin) form.append("exampleOrigin", origin);
  form.append("context", JSON.stringify(options.context ?? applicant));
  form.append("inputRevision", String(options.revision ?? 0));
  form.append("requestId", "offline-example-cache");
  form.append("privacyAcknowledged", "true");
  const response = await POST(new Request("http://localhost:3000/api/compare", { method: "POST", body: form }));
  return (await response.text()).trim().split("\n").map(line => JSON.parse(line) as Event);
}
const reportOf = (events: Event[]) => events.find(event => event.type === "result")?.report;
const unavailable = () => new AppError("PROVIDER_UNAVAILABLE", "The AI service is temporarily unavailable.");
it("saves a verified live analysis, attempts live again, then revalidates a saved result for the new revision", async () => {
  const first = reportOf(await run())!;
  expect(first.savedExample).toBeUndefined();
  fake.analyze.mockImplementation(async (...args: Parameters<typeof import("@/server/gemini").analyze>) => {
    args[4]?.onProgress?.({ phase: "retry", attempt: 3, delayMs: 4125 });
    throw unavailable(); // Adapter has already exhausted retries and optional model fallback.
  });
  const events = await run({ revision: 7 });
  const saved = reportOf(events)!;
  expect(saved).toMatchObject({ savedExample: true, revision: 7, model: "gemini-offline-cache-test", applicant });
  expect(saved.id).not.toBe(first.id);
  expect(saved.findings).toEqual(first.findings);
  expect(saved.findings[0].rules[0].evidence[0].sourceVerified).toBe(true);
  expect(events.some(event => event.type === "provider_progress")).toBe(true);
  expect(events.some(event => event.type === "error")).toBe(false);
  expect(fake.analyze).toHaveBeenCalledTimes(2);
  expect(fake.acquire).toHaveBeenCalledTimes(2);
  expect(fake.release).toHaveBeenCalledTimes(2);
});
it("does not substitute a saved result for a different applicant context", async () => {
  await run();
  fake.analyze.mockRejectedValue(unavailable());
  const events = await run({ context: { ...applicant, intake: "October 2026" } });
  expect(reportOf(events)).toBeUndefined();
  expect(events.at(-1)).toMatchObject({ type: "error", code: "PROVIDER_UNAVAILABLE" });
});
it("does not substitute for changed document bytes even with forged sample provenance and names", async () => {
  await run();
  fake.analyze.mockRejectedValue(unavailable());
  const events = await run({ changeBytes: true });
  expect(reportOf(events)).toBeUndefined();
});
it("never caches a normal upload, even if its bytes happen to equal the built-in samples", async () => {
  await run({ origin: null });
  fake.analyze.mockRejectedValue(unavailable());
  expect(reportOf(await run())).toBeUndefined();
});
it("never serves a cached example to a normal upload", async () => {
  await run();
  fake.analyze.mockRejectedValue(unavailable());
  expect(reportOf(await run({ origin: null }))).toBeUndefined();
});
it("does not cache invalid live evidence", async () => {
  fake.analyze.mockImplementation(async (ss: Source[]) => {
    const result = raw(ss);
    result.rules[0].requirement.passageIds = ["fabricated-passage"];
    return result;
  });
  expect((await run()).at(-1)).toMatchObject({ type: "error", code: "INVALID_EVIDENCE" });
  fake.analyze.mockRejectedValue(unavailable());
  expect(reportOf(await run())).toBeUndefined();
});
it("reruns verification on cached analysis and rejects corrupted evidence", async () => {
  await run();
  const corrupted = raw(fake.analyze.mock.calls[0][0]);
  corrupted.rules[0].requirement.passageIds = ["fabricated-passage"];
  vi.spyOn(exampleCache, "get").mockResolvedValueOnce({ raw: corrupted, model: "test-only" });
  fake.analyze.mockRejectedValue(unavailable());
  const events = await run();
  expect(reportOf(events)).toBeUndefined();
  expect(events.at(-1)).toMatchObject({ type: "error", code: "INVALID_EVIDENCE" });
});
it.each(["PROVIDER_AUTHENTICATION", "PROVIDER_REQUEST_INVALID", "INVALID_EVIDENCE", "INCOMPLETE_ANALYSIS", "DAILY_CAPACITY"])("does not conceal %s with saved output", async code => {
  await run();
  fake.analyze.mockRejectedValue(new AppError(code, "Offline test error"));
  const events = await run();
  expect(reportOf(events)).toBeUndefined();
  expect(events.at(-1)).toMatchObject({ type: "error", code });
});
it("never bypasses quota admission to serve a saved result", async () => {
  await run();
  fake.acquire.mockRejectedValue(new AppError("TEMPORARY_RATE_LIMIT", "Busy"));
  expect(reportOf(await run())).toBeUndefined();
  expect(fake.analyze).toHaveBeenCalledOnce();
});
