import { afterEach, expect, it, vi } from "vitest";
import type { Source, Event } from "@/shared/contracts";
import { AppError } from "@/server/errors";
import { rawAssessments } from "../fixtures/degree";
import { admissionsFixture } from "../fixtures/admissions";
const fake = vi.hoisted(() => ({
  analyze: vi.fn(),
  acquire: vi.fn(),
  release: vi.fn(),
}));
vi.mock("@/server/gemini", () => ({ analyze: fake.analyze, hasGeminiKey: () => true, missingGeminiConfiguration: vi.fn() }));
vi.mock("@/server/quota", () => ({
  redisClient: vi.fn(),
  acquire: fake.acquire,
}));
import { POST } from "@/app/api/compare/route";

it("streams admissions-wide evidence and a verified multi-topic report with the provider mocked", async () => {
  const { raw, sources, applicant } = await admissionsFixture();
  fake.acquire.mockResolvedValue({ reserve: vi.fn(), release: fake.release });
  fake.analyze.mockResolvedValue(raw);
  const form = new FormData();
  for (const source of sources) form.append(`document${source.id}`, new File([source.pages[0].text], source.name));
  form.append("context", JSON.stringify(applicant));
  form.append("inputRevision", "0");
  form.append("requestId", "offline-admissions");
  form.append("privacyAcknowledged", "true");
  const response = await POST(new Request("http://localhost:3000/api/compare", { method: "POST", body: form }));
  const events = (await response.text()).trim().split("\n").map(line => JSON.parse(line));
  expect(events.at(-1)).toMatchObject({ type: "result", report: { applicant } });
  expect(events.at(-1).report.findings.map((f: { topic: string }) => f.topic)).toEqual(raw.findings.map(f => f.topic));
  expect(fake.analyze).toHaveBeenCalledOnce();
  expect(fake.release).toHaveBeenCalledOnce();
  expect(fetch).not.toHaveBeenCalled();
});

it("logs the Google status and diagnostic server-side but streams only a friendly mapped error", async () => {
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  fake.acquire.mockResolvedValue({ reserve: vi.fn(), release: fake.release });
  const failure = new AppError("PROVIDER_RATE_LIMIT", "The AI service quota or rate limit has been reached. Please try again later.");
  failure.providerDiagnostic = {
    model: "gemini-3.1-flash-lite",
    method: "generateContent",
    httpStatus: 429,
    message: "SERVER_ONLY_GOOGLE_QUOTA_DIAGNOSTIC",
  };
  fake.analyze.mockRejectedValue(failure);
  const form = new FormData();
  form.append("documentA", new File(["PRIVATE_DOCUMENT_A text."], "a.txt"));
  form.append("documentB", new File(["PRIVATE_DOCUMENT_B text."], "b.txt"));
  form.append("context", JSON.stringify({ degree: "Master's", program: "Synthetic", intake: "2026", category: "International" }));
  form.append("inputRevision", "0");
  form.append("requestId", "offline-provider-error");
  form.append("privacyAcknowledged", "true");
  const response = await POST(new Request("http://localhost:3000/api/compare", { method: "POST", body: form }));
  const body = await response.text();
  const events = body.trim().split("\n").map(line => JSON.parse(line));
  expect(events.at(-1)).toMatchObject({ type: "error", code: failure.code, message: failure.message });
  expect(events.some(event => event.type === "result")).toBe(false);
  expect(body).not.toContain("SERVER_ONLY_GOOGLE_QUOTA_DIAGNOSTIC");
  expect(body).not.toContain("providerDiagnostic");
  expect(body).not.toContain("httpStatus");
  expect(log).toHaveBeenCalledWith("[RuleGuard compare]", { code: failure.code, ...failure.providerDiagnostic });
  expect(JSON.stringify(log.mock.calls)).not.toContain("PRIVATE_DOCUMENT_");
  expect(fake.release).toHaveBeenCalledOnce();
});
afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
it("emits document-specific applicability without any report for a supported exclusive mismatch", async () => {
  fake.acquire.mockResolvedValue({ reserve: vi.fn(), release: fake.release });
  fake.analyze.mockImplementation(async (ss: Source[]) => {
    const assessments = rawAssessments(ss);
    assessments[1] = {
      ...assessments[1],
      status: "other_degree",
      exclusivelyOtherDegree: true,
      explanation:
        "The operative section explicitly excludes the selected degree.",
    };
    return {
      analysisStatus: "complete",
      sourceIds: ["A", "B"],
      limitations: [],
      documentAssessments: assessments,
      rules: ss.map((s) => ({
        ruleId: s.id,
        sourceId: s.id,
        requirement: {
          text: "A language requirement.",
          passageIds: [s.passages[0].id],
        },
        scope: {
          text: "Operative degree scope.",
          passageIds: [s.passages[0].id],
        },
        degreeEvidence: {
          text: "Exclusive stated degree.",
          passageIds: [s.passages[0].id],
        },
        degreeMatch: s.id === "A" ? "selected" : "other",
        scopeMatch: s.id === "A" ? "matches" : "does_not_match",
        conditionStatus: "unknown",
        conditions: [],
        exceptions: [],
      })),
      coverage: ss.flatMap((s) =>
        s.passages.map((p) => ({
          passageId: p.id,
          ruleIds: [s.id],
          disposition: "rules",
          reason: "Stated policy.",
        })),
      ),
      findings: [],
    };
  });
  const form = new FormData();
  form.append(
    "documentA",
    new File(
      [
        "SYNTHETIC. This English policy applies only to Bachelor's applicants: IELTS 6.5 required.",
      ],
      "a.txt",
    ),
  );
  form.append(
    "documentB",
    new File(
      [
        "SYNTHETIC. This English policy applies exclusively to Master's admission and excludes Bachelor's applicants: IELTS 7 required.",
      ],
      "b.txt",
    ),
  );
  form.append(
    "context",
    JSON.stringify({
      degree: "Bachelor's",
      program: "Computing",
      intake: "2026",
      category: "International",
    }),
  );
  form.append("inputRevision", "0");
  form.append("requestId", "offline-mismatch");
  form.append("privacyAcknowledged", "true");
  const response = await POST(
    new Request("http://localhost:3000/api/compare", {
      method: "POST",
      body: form,
    }),
  );
  const events: Event[] = (await response.text())
    .trim()
    .split("\n")
    .map((s) => JSON.parse(s));
  expect(events.some((e) => e.type === "result")).toBe(false);
  expect(events.at(-1)).toMatchObject({
    type: "applicability",
    applicability: {
      gate: "blocked",
      assessments: [
        { sourceId: "A", status: "selected" },
        { sourceId: "B", status: "other_degree" },
      ],
    },
  });
  expect(fake.analyze).toHaveBeenCalledOnce();
  expect(fake.release).toHaveBeenCalledOnce();
  expect(fetch).not.toHaveBeenCalled();
});
it("streams only a safe rejection code and sources, releases the lease, and never emits invalid findings", async () => {
  // Test-only fake provider and quota: no real service is contacted or claimed tested.
  fake.acquire.mockResolvedValue({ reserve: vi.fn(), release: fake.release });
  fake.analyze.mockImplementation(async (ss: Source[]) => ({
    analysisStatus: "complete",
    sourceIds: ["A", "B"],
    limitations: [],
    documentAssessments: rawAssessments(ss),
    rules: [
      {
        ruleId: "r",
        sourceId: "A",
        degreeMatch: "selected",
        degreeEvidence: {
          text: "Selected degree.",
          passageIds: [ss[0].passages[0].id],
        },
        requirement: {
          text: "SECRET_MODEL_CONTENT",
          passageIds: ["SECRET_INVALID_REFERENCE"],
        },
        scope: { text: "Applicants", passageIds: [ss[0].passages[0].id] },
        conditions: [],
        exceptions: [],
        scopeMatch: "matches",
        conditionStatus: "unknown",
      },
    ],
    coverage: [],
    findings: [],
  }));
  const form = new FormData();
  form.append("documentA", new File(["SYNTHETIC A public rule."], "a.txt"));
  form.append("documentB", new File(["SYNTHETIC B public rule."], "b.txt"));
  form.append(
    "context",
    JSON.stringify({
      degree: "Master's",
      program: "Synthetic",
      intake: "Unknown",
      category: "Unknown",
    }),
  );
  form.append("inputRevision", "0");
  form.append("requestId", "offline");
  form.append("privacyAcknowledged", "true");
  const response = await POST(
    new Request("http://localhost:3000/api/compare", {
      method: "POST",
      body: form,
    }),
  );
  const body = await response.text();
  const events: Event[] = body
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));
  expect(events.some((e) => e.type === "sources")).toBe(true);
  expect(events.some((e) => e.type === "result")).toBe(false);
  expect(events.at(-1)).toMatchObject({
    type: "error",
    code: "INVALID_EVIDENCE",
    diagnosticCode: "CLAUSE_PASSAGE_UNKNOWN",
  });
  expect(body).not.toContain("SECRET_MODEL_CONTENT");
  expect(body).not.toContain("SECRET_INVALID_REFERENCE");
  expect(fake.release).toHaveBeenCalledOnce();
  expect(fetch).not.toHaveBeenCalled();
});

it("streams retry progress as nonterminal events before a friendly exhausted error", async () => {
  fake.acquire.mockResolvedValue({ reserve: vi.fn(), release: fake.release });
  fake.analyze.mockImplementation(async (...args: Parameters<typeof import("@/server/gemini").analyze>) => {
    args[4]?.onProgress?.({ phase: "retry", attempt: 1, delayMs: 1125 });
    args[4]?.onProgress?.({ phase: "fallback", attempt: 1, delayMs: 0 });
    throw new AppError("PROVIDER_UNAVAILABLE", "The AI service is temporarily unavailable.");
  });
  const form = new FormData();
  form.append("documentA", new File(["SYNTHETIC A public rule."], "a.txt"));
  form.append("documentB", new File(["SYNTHETIC B public rule."], "b.txt"));
  form.append("context", JSON.stringify({ degree: "Master's", program: "Synthetic", intake: "2026", category: "International" }));
  form.append("inputRevision", "0");
  form.append("requestId", "offline-retry-progress");
  form.append("privacyAcknowledged", "true");
  const response = await POST(new Request("http://localhost:3000/api/compare", { method: "POST", body: form }));
  const events = (await response.text()).trim().split("\n").map(line => JSON.parse(line));
  expect(events.filter(event => event.type === "provider_progress")).toEqual([
    { type: "provider_progress", progress: { phase: "retry", attempt: 1, delayMs: 1125 }, revision: 0, requestId: "offline-retry-progress" },
    { type: "provider_progress", progress: { phase: "fallback", attempt: 1, delayMs: 0 }, revision: 0, requestId: "offline-retry-progress" },
  ]);
  expect(events.at(-1)).toMatchObject({ type: "error", code: "PROVIDER_UNAVAILABLE" });
  expect(events.some(event => event.type === "result")).toBe(false);
  expect(fake.release).toHaveBeenCalledOnce();
});
