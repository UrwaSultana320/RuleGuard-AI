import { readFileSync } from "node:fs";
import { expect, it, vi } from "vitest";
import { LIMITS } from "@/shared/limits";
import { PROVIDER_BUDGET_MS, RESPONSE_RESERVE_MS } from "@/server/runtime-budget";
import { editorialSources } from "../fixtures/editorial";

const pending = vi.hoisted(() => ({ read: vi.fn() }));
vi.mock("@/server/documents", () => ({ extractDocument: pending.read }));
vi.mock("@/server/gemini", () => ({
  hasGeminiKey: () => false,
  missingGeminiConfiguration: () => "AI is not configured.",
  analyze: vi.fn(),
}));
import { POST, maxDuration } from "@/app/api/compare/route";

it("fits upload and processing budgets within Hobby Fluid Compute limits", () => {
  expect(JSON.parse(readFileSync("vercel.json", "utf8")).fluid).toBe(true);
  expect(maxDuration).toBe(300);
  expect(LIMITS.bodyBytes).toBeLessThan(4_500_000);
  expect(PROVIDER_BUDGET_MS + RESPONSE_RESERVE_MS).toBeLessThan(LIMITS.timeoutMs);
  expect(LIMITS.timeoutMs + 15_000).toBeLessThan(maxDuration * 1000);
});

it("emits NDJSON before extraction finishes and disables intermediary transformation/buffering", async () => {
  let finish!: () => void;
  const wait = new Promise<void>(resolve => { finish = resolve; });
  pending.read.mockImplementation(async (_file: File, id: string) => {
    await wait;
    return editorialSources.find(source => source.id === id);
  });
  const form = new FormData();
  for (const id of ["A", "B"]) form.append(`document${id}`, new File(["Synthetic test."], `${id}.txt`));
  form.append("context", JSON.stringify({ degree: "Master's", program: "Computing", intake: "September 2026", category: "International applicant" }));
  form.append("inputRevision", "0");
  form.append("requestId", "stream-test");
  form.append("privacyAcknowledged", "true");
  const response = await POST(new Request("http://localhost/api/compare", { method: "POST", body: form }));
  const reader = response.body!.getReader();
  try {
    expect(response.headers.get("content-type")).toContain("application/x-ndjson");
    expect(response.headers.get("cache-control")).toContain("no-transform");
    expect(response.headers.get("x-accel-buffering")).toBe("no");
    const first = await reader.read();
    expect(JSON.parse(new TextDecoder().decode(first.value))).toMatchObject({ type: "stage", stage: 0 });
  } finally {
    finish();
    while (!(await reader.read()).done) { /* Drain the completed response. */ }
  }
});
