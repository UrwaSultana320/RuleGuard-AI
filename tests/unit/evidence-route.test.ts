import { afterEach, expect, it, vi } from "vitest";
import type { Source, Event } from "@/shared/contracts";
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
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
it("streams only a safe rejection code and sources, releases the lease, and never emits invalid findings", async () => {
  // Test-only fake provider and quota: no real service is contacted or claimed tested.
  vi.stubEnv("GEMINI_REQUESTS_ENABLED", "true");
  fake.acquire.mockResolvedValue({ reserve: vi.fn(), release: fake.release });
  fake.analyze.mockImplementation(async (ss: Source[]) => ({
    analysisStatus: "complete",
    sourceIds: ["A", "B"],
    limitations: [],
    rules: [
      {
        ruleId: "r",
        sourceId: "A",
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
