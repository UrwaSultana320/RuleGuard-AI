import { existsSync } from "node:fs";
import { afterEach, describe, it, expect, vi } from "vitest";
import { readFile } from "node:fs/promises";
import { extractDocument } from "@/server/documents";
import { buildReport } from "@/server/evidence";
import { analyze } from "@/server/gemini";
import { acquire, providerDay } from "@/server/quota";
import { POST } from "@/app/api/compare/route";
import type { Applicant, Event, Source } from "@/shared/contracts";
import { rawAssessments } from "../fixtures/degree";

const applicant: Applicant = {
  degree: "Master's",
  program: "MSc Data Science",
  intake: "Not sure",
  category: "Not sure",
};
async function sources() {
  return Promise.all(
    ["A", "B"].map((id) =>
      extractDocument(
        new File(
          [
            `SYNTHETIC\nEnglish-language requirement ${id}: IELTS 6.5.\nException: official approval is required.`,
          ],
          id + ".txt",
        ),
        "AB".includes(id) ? id : "A",
      ),
    ),
  );
}
function raw(ss: Source[]) {
  return {
    analysisStatus: "complete",
    sourceIds: ss.map((s) => s.id),
    limitations: [],
    documentAssessments: rawAssessments(ss),
    rules: ss.map((s) => ({
      ruleId: s.id,
      sourceId: s.id,
      degreeMatch: "selected",
      degreeEvidence: {
        text: "Selected-degree scope.",
        passageIds: [s.passages[0].id],
      },
      requirement: {
        text: "An IELTS threshold is stated.",
        passageIds: [s.passages[0].id],
      },
      scope: {
        text: "International Master’s applicants.",
        passageIds: [s.passages[0].id],
      },
      scopeMatch: "matches",
      conditionStatus: "unknown",
      conditions: [],
      exceptions: [],
    })),
    coverage: ss.flatMap((s) =>
      s.passages.map((p) => ({
        passageId: p.id,
        ruleIds: [s.id],
        disposition: "rules",
        reason: "A rule is present.",
      })),
    ),
    findings: [
      {
        topic: "English-language threshold",
        ruleIds: ss.map((s) => s.id),
        classification: "Consistent",
        explanation:
          "The stated thresholds appear compatible; eligibility remains unknown.",
        unknowns: [],
        clarificationQuestion: "",
      },
    ],
  };
}
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
describe("Complete extraction and reference validation", () => {
  it("retains every TXT character and exact line references, including a late exception", async () => {
    const text =
      "First\n\n" +
      "A line of requirements.\n".repeat(90) +
      "Late exception: case-by-case approval only.";
    const s = await extractDocument(new File([text], "policy.txt"), "A");
    expect(s.passages.map((p) => p.text).join("")).toBe(text);
    expect(s.passages.at(-1)?.text).toContain("case-by-case");
    expect(s.passages.every((p) => p.page === null)).toBe(true);
  });
  it("rejects non-UTF8, wrong PDF signature, oversized files and unknown formats", async () => {
    for (const f of [
      new File([new Uint8Array([255, 255])], "bad.txt"),
      new File(["not a PDF"], "bad.pdf"),
      new File([new Uint8Array(2_000_001)], "large.txt"),
      new File(["text"], "bad.docx"),
    ])
      await expect(extractDocument(f, "A")).rejects.toThrow();
  });
  it("reconstructs evidence exclusively from the source, not AI paraphrases", async () => {
    const ss = await sources();
    const r = buildReport(raw(ss), ss, applicant, 0);
    expect(r.findings[0].rules[0].evidence[0].text).toBe(
      ss[0].passages[0].text,
    );
    expect(r.findings[0].rules[0].evidence[0].page).toBe(null);
    expect(r.findings[0].rules[0].evidence[0].sourceVerified).toBe(true);
  });
  it("rejects fabricated, cross-source, stale and missing coverage references", async () => {
    const ss = await sources();
    for (const change of ["invented", ss[1].passages[0].id, "old-hash-p1"]) {
      const r = raw(ss);
      r.rules[0].requirement.passageIds = [change];
      expect(() => buildReport(r, ss, applicant, 0)).toThrow();
    }
    const r = raw(ss);
    r.coverage = [];
    expect(() => buildReport(r, ss, applicant, 0)).toThrow();
  });
  it("preserves raw failure identity while downgrading unsupported applicability", async () => {
    const ss = await sources();
    const r = raw(ss);
    r.rules[1].scopeMatch = "unknown";
    r.findings[0].classification = "Potential Contradiction";
    const report = buildReport(r, ss, applicant, 1);
    expect(r.findings[0].classification).toBe("Potential Contradiction");
    expect(report.findings[0].modelClassification).toBe(
      "Potential Contradiction",
    );
    expect(report.findings[0].classification).toBe("Insufficient Evidence");
    expect(report.findings[0].guardNotes.length).toBeGreaterThan(0);
  });
  it("rejects duplicates and incomplete responses rather than claiming empty success", async () => {
    const ss = await sources();
    const r = raw(ss);
    r.findings.push(r.findings[0]);
    expect(() => buildReport(r, ss, applicant, 0)).toThrow();
    r.analysisStatus = "incomplete";
    expect(() => buildReport(r, ss, applicant, 0)).toThrow();
  });
  it("handles genuine zero suggestions without manufacturing agreement", async () => {
    const ss = await sources();
    const r = raw(ss);
    r.findings = [];
    expect(buildReport(r, ss, applicant, 0).findings).toEqual([]);
  });
  it.skipIf(!existsSync("tmp/pdfs/waikato-pg-english-2026.pdf"))(
    "extracts the complete approved Waikato research pair when present locally",
    async () => {
      const bytes = await readFile("tmp/pdfs/waikato-pg-english-2026.pdf");
      const s = await extractDocument(
        new File([new Uint8Array(bytes)], "Waikato.pdf"),
        "A",
      );
      expect(s.pages.length).toBe(9);
      expect(s.passages.map((p) => p.text).join("")).toBe(
        s.pages.map((p) => p.text).join(""),
      );
      expect(s.pages[7].text.toLowerCase()).toContain("waiver");
    },
    30000,
  );
});
describe("No accidental external requests and quota safety", () => {
  it("never contacts Google or reserves quota when the key is missing", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetcher = vi.fn();
    const reserve = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    await expect(
      analyze(
        await sources(),
        applicant,
        reserve,
        new AbortController().signal,
      ),
    ).rejects.toMatchObject({ code: "AI_CONFIGURATION_MISSING" });
    expect(reserve).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith(expect.stringContaining("GEMINI_API_KEY is missing"));
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("does not dispatch a generation when its atomic reservation fails; no automatic retries", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-only-not-a-real-key");
    const fetcher = vi
      .fn()
      .mockResolvedValue(Response.json({ totalTokens: 500 }));
    vi.stubGlobal("fetch", fetcher);
    const reserve = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("daily cap"));
    await expect(
      analyze(
        await sources(),
        applicant,
        reserve,
        new AbortController().signal,
      ),
    ).rejects.toThrow("daily cap");
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(reserve.mock.calls.map((c) => c[0])).toEqual([
      "count",
      "generation",
    ]);
  });
  it("uses one atomic admission operation and fails closed on busy or malformed state", async () => {
    const redis = vi.fn().mockResolvedValue([0, 15]);
    await expect(acquire(redis)).rejects.toThrow("busy");
    expect(redis).toHaveBeenCalledTimes(1);
    expect(redis.mock.calls[0][0][0]).toBe("EVAL");
    await expect(acquire(vi.fn().mockResolvedValue(null))).rejects.toThrow(
      "invalid response",
    );
  });
  it("resets day keys at midnight Pacific, including daylight-saving offsets", () => {
    expect(providerDay(new Date("2026-10-20T06:59:00Z"))).toBe("2026-10-19");
    expect(providerDay(new Date("2026-10-20T07:00:00Z"))).toBe("2026-10-20");
    expect(providerDay(new Date("2026-11-06T07:59:00Z"))).toBe("2026-11-05");
  });
  it("streams full sources and neutral missing-configuration information with zero upstream calls", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    const form = new FormData();
    form.append("documentA", new File(["SYNTHETIC\nA public rule."], "a.txt"));
    form.append(
      "documentB",
      new File(["SYNTHETIC\nA different rule."], "b.txt"),
    );
    form.append("context", JSON.stringify(applicant));
    form.append("inputRevision", "0");
    form.append("requestId", "local-test");
    form.append("privacyAcknowledged", "true");
    const response = await POST(
      new Request("http://localhost:3000/api/compare", {
        method: "POST",
        body: form,
      }),
    );
    const events = (await response.text())
      .trim()
      .split("\n")
      .map((x) => JSON.parse(x) as Event);
    expect(events.some((e) => e.type === "sources")).toBe(true);
    expect(events.some((e) => e.type === "result")).toBe(false);
    expect(events.at(-1)).toMatchObject({
      type: "info",
      code: "AI_CONFIGURATION_MISSING",
    });
    expect(events.some((e) => e.type === "error")).toBe(false);
    expect(log).toHaveBeenCalledWith(expect.stringContaining("GEMINI_API_KEY is missing"));
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("rejects cross-origin submissions before reading documents", async () => {
    const response = await POST(
      new Request("http://localhost:3000/api/compare", {
        method: "POST",
        headers: { origin: "https://other.example" },
        body: "x",
      }),
    );
    expect(response.status).toBe(403);
  });
});

it("runs configured Gemini through the route without the obsolete flag and keeps credentials private", async () => {
  const key = "test-only-gemini-secret";
  const token = "test-only-redis-secret";
  vi.stubEnv("GEMINI_API_KEY", key);
  vi.stubEnv("GEMINI_REQUESTS_ENABLED", "false");
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://test-only.upstash.io");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", token);
  const ss = await sources();
  const fetcher = vi.fn(async (url: string | URL, options?: RequestInit) => {
    if (String(url).includes("test-only.upstash.io")) return Response.json({ result: [1, 0] });
    expect(new Headers(options?.headers).get("x-goog-api-key")).toBe(key);
    if (String(url).endsWith(":countTokens")) return Response.json({ totalTokens: 500 });
    expect(String(url)).toBe("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent");
    return Response.json({ candidates: [{ finishReason: "STOP", content: { parts: [{ text: JSON.stringify(raw(ss)) }] } }] });
  });
  vi.stubGlobal("fetch", fetcher);
  const form = new FormData();
  ss.forEach((source, i) => form.append(i === 0 ? "documentA" : "documentB", new File([source.pages.map(p => p.text).join("")], source.name)));
  form.append("context", JSON.stringify(applicant));
  form.append("inputRevision", "0");
  form.append("requestId", "configured-test");
  form.append("privacyAcknowledged", "true");
  const response = await POST(new Request("http://localhost:3000/api/compare", { method: "POST", body: form }));
  const body = await response.text();
  const events: Event[] = body.trim().split("\n").map(line => JSON.parse(line));
  expect(events.at(-1)).toMatchObject({ type: "result", report: { model: "gemini-3.1-flash-lite", revision: 0 } });
  expect(events.some(e => e.type === "error" || e.type === "info")).toBe(false);
  expect(fetcher.mock.calls.filter(([url]) => String(url).includes("generativelanguage.googleapis.com"))).toHaveLength(2);
  expect(fetcher).toHaveBeenCalledTimes(6); // Admission, two reservations, two Gemini calls, release.
  expect(body).not.toContain(key);
  expect(body).not.toContain(token);
});
