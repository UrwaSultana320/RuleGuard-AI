import { afterEach, expect, it, vi } from "vitest";
import type { Source, Event } from "@/shared/contracts";
import { rawAssessments } from "../fixtures/degree";
const fake = vi.hoisted(() => ({
  analyze: vi.fn(),
  acquire: vi.fn(),
  release: vi.fn(),
}));
vi.mock("@/server/gemini", () => ({ analyze: fake.analyze }));
vi.mock("@/server/quota", () => ({
  redisClient: vi.fn(),
  acquire: fake.acquire,
}));
import { POST } from "@/app/api/compare/route";
afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
it("emits document-specific applicability without any report for a supported exclusive mismatch", async () => {
  vi.stubEnv("GEMINI_REQUESTS_ENABLED", "true");
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
  vi.stubEnv("GEMINI_REQUESTS_ENABLED", "true");
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
