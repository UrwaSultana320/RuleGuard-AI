import { readFile } from "node:fs/promises";
import { afterEach, expect, it, vi } from "vitest";
import { ExampleCache, SharedExampleCache, EXAMPLE_CACHE_TTL_SECONDS, exampleCacheKey } from "@/server/example-cache";
import { extractDocument } from "@/server/documents";
import type { Applicant } from "@/shared/contracts";

const applicant: Applicant = { degree: "Master's", program: "Artificial Intelligence", intake: "September 2026", category: "International applicant" };
async function sources(prefix = "") {
  return Promise.all(["A", "B"].map(async id => extractDocument(
    new File([await readFile(`public/samples/${prefix}synthetic-${id}.txt`)], `Synthetic-policy-${id}.txt`), id,
  )));
}
afterEach(() => vi.useRealTimers());
it.each(["", "bachelor-"])("qualifies only an exact built-in %s pair with an explicit sample origin", async prefix => {
  const ss = await sources(prefix);
  expect(await exampleCacheKey("built-in-synthetic", ss, applicant)).toMatch(/^[a-f0-9]{64}$/);
  expect(await exampleCacheKey(null, ss, applicant)).toBeNull();
  expect(await exampleCacheKey("user-upload", ss, applicant)).toBeNull();
  expect(await exampleCacheKey("built-in-synthetic", ss.toReversed(), applicant)).toBeNull();
});
it("keys every applicant field and exact document bytes, independent of context property order", async () => {
  const ss = await sources();
  const key = await exampleCacheKey("built-in-synthetic", ss, applicant);
  expect(await exampleCacheKey("built-in-synthetic", ss, { category: applicant.category, intake: applicant.intake, program: applicant.program, degree: applicant.degree })).toBe(key);
  for (const field of ["program", "intake", "category"] as const)
    expect(await exampleCacheKey("built-in-synthetic", ss, { ...applicant, [field]: "Changed" })).not.toBe(key);
  expect(await exampleCacheKey("built-in-synthetic", ss, { ...applicant, degree: "Bachelor's" })).not.toBe(key);
  const bytes = await readFile("public/samples/synthetic-A.txt");
  ss[0] = await extractDocument(new File([bytes, " "], "Synthetic-policy-A.txt"), "A");
  expect(await exampleCacheKey("built-in-synthetic", ss, applicant)).toBeNull();
});
it("rejects a forged sample marker and filename on uploaded private content", async () => {
  const ss = await sources();
  ss[1] = await extractDocument(new File(["PRIVATE uploaded policy"], "Synthetic-policy-B.txt"), "B");
  expect(await exampleCacheKey("built-in-synthetic", ss, applicant)).toBeNull();
});
it("clones saved analyses, expires them, and bounds memory", () => {
  vi.useFakeTimers();
  const cache = new ExampleCache(2, 1000);
  const saved = { raw: { findings: ["original"] }, model: "test-only" };
  cache.put(null, saved);
  expect(cache.get(null)).toBeUndefined();
  cache.put("a", saved);
  saved.raw.findings[0] = "mutated";
  const first = cache.get("a")!;
  expect(first.raw).toEqual({ findings: ["original"] });
  (first.raw as { findings: string[] }).findings[0] = "changed on read";
  expect(cache.get("a")!.raw).toEqual({ findings: ["original"] });
  cache.put("b", saved);
  cache.put("c", saved);
  expect(cache.get("a")).toBeUndefined();
  vi.advanceTimersByTime(1000);
  expect(cache.get("b")).toBeUndefined();
  expect(cache.get("c")).toBeUndefined();
});

it("shares synthetic output across instances using a hash key and a 24-hour Redis expiry", async () => {
  const values = new Map<string, string>();
  const redis = vi.fn(async (command: (string | number)[]) => {
    if (command[0] === "SET") {
      values.set(String(command[1]), String(command[2]));
      return "OK";
    }
    return values.get(String(command[1])) ?? null;
  });
  const writer = new SharedExampleCache(() => redis);
  const reader = new SharedExampleCache(() => redis);
  const key = "a".repeat(64);
  const saved = { raw: { findings: ["synthetic only"] }, model: "test-model" };
  await writer.put(key, saved);
  expect(redis.mock.calls[0][0]).toMatchObject({
    0: "SET", 1: `ruleguard:v2:synthetic:${key}`, 3: "EX", 4: 86400,
  });
  expect(await reader.get(key)).toEqual(saved);
  expect(EXAMPLE_CACHE_TTL_SECONDS).toBe(86400);
});

it("never touches Redis or memory for an ineligible upload key", async () => {
  const connect = vi.fn();
  const memory = new ExampleCache();
  const cache = new SharedExampleCache(connect, memory);
  const put = vi.spyOn(memory, "put");
  await cache.put(null, { raw: "PRIVATE", model: "unused" });
  expect(await cache.get(null)).toBeUndefined();
  await cache.put("not-a-qualified-hash", { raw: "PRIVATE", model: "unused" });
  expect(connect).not.toHaveBeenCalled();
  expect(put).not.toHaveBeenCalled();
});

it("uses bounded memory without Upstash and tolerates optional cache outages without logging content", async () => {
  vi.useFakeTimers();
  const key = "b".repeat(64);
  const saved = { raw: { findings: ["synthetic only"] }, model: "test-model" };
  const cache = new SharedExampleCache(() => null);
  await cache.put(key, saved);
  expect(await cache.get(key)).toEqual(saved);
  vi.advanceTimersByTime(86400 * 1000);
  expect(await cache.get(key)).toBeUndefined();
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  const offline = new SharedExampleCache(() => { throw Error("PRIVATE cache error"); });
  await offline.put(key, saved);
  expect(await offline.get(key)).toEqual(saved);
  expect(log).not.toHaveBeenCalled();
  log.mockRestore();
});

it("does not revive an expired or malformed Redis entry", async () => {
  const redis = vi.fn().mockResolvedValue(JSON.stringify({ saved: { raw: {}, model: "old" }, expiresAt: Date.now() - 1 }));
  const cache = new SharedExampleCache(() => redis);
  expect(await cache.get("c".repeat(64))).toBeUndefined();
  redis.mockResolvedValue("not JSON");
  expect(await cache.get("c".repeat(64))).toBeUndefined();
});
