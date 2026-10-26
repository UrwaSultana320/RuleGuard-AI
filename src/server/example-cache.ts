import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Applicant, Source } from "@/shared/contracts";
import { redisClient } from "./quota";
import { instructions } from "./prompt";

const hash = (value: string | Uint8Array) => createHash("sha256").update(value).digest("hex");

// Source hashes come from backend extraction of the exact upload bytes.
// The client marker alone, a filename, or a synthetic-looking title is insufficient.
export async function exampleCacheKey(
  origin: FormDataEntryValue | null,
  sources: Source[],
  applicant: Applicant,
): Promise<string | null> {
  if (origin !== "built-in-synthetic" || sources.length !== 2 ||
      sources.some((source, i) => source.id !== ["A", "B"][i] || source.kind !== "TXT"))
    return null;
  try {
    const pairs = await Promise.all(["", "bachelor-"].map(async prefix =>
      Promise.all(["A", "B"].map(async id =>
        hash(await readFile(path.join(process.cwd(), "public", "samples", `${prefix}synthetic-${id}.txt`))),
      )),
    ));
    if (!pairs.some(pair => pair.every((digest, i) => digest === sources[i].hash))) return null;
  } catch {
    // An optional cache must never break a live comparison if bundled files are unavailable.
    return null;
  }
  return hash(JSON.stringify([
    "synthetic-example-v2", hash(instructions), sources.map(source => source.hash),
    [applicant.degree, applicant.program, applicant.intake, applicant.category],
  ]));
}

type SavedAnalysis = { raw: unknown; model: string };

// Only verified live analyses with a server-qualified key reach this cache.
// Bounded and ephemeral: a cold start or deployment clears it.
export class ExampleCache {
  private entries = new Map<string, { saved: SavedAnalysis; expires: number }>();
  constructor(private readonly capacity = 32, private readonly ttlMs = 24 * 60 * 60 * 1000) {}

  get(key: string | null): SavedAnalysis | undefined {
    if (!key) return;
    const entry = this.entries.get(key);
    if (!entry) return;
    if (entry.expires <= Date.now()) {
      this.entries.delete(key);
      return;
    }
    return structuredClone(entry.saved);
  }

  put(key: string | null, saved: SavedAnalysis) {
    if (!key) return;
    for (const [id, entry] of this.entries) {
      if (entry.expires <= Date.now()) this.entries.delete(id);
    }
    this.entries.delete(key);
    this.entries.set(key, { saved: structuredClone(saved), expires: Date.now() + this.ttlMs });
    while (this.entries.size > this.capacity) this.entries.delete(this.entries.keys().next().value!);
  }
}

export const EXAMPLE_CACHE_TTL_SECONDS = 24 * 60 * 60;
const REDIS_PREFIX = "ruleguard:v2:synthetic:";
type Redis = ReturnType<typeof redisClient>;

function configuredRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  return redisClient();
}

// Only server-qualified hashes reach either store. Redis is shared across cold
// starts; bounded memory is a best-effort fallback, never a quota fallback.
export class SharedExampleCache {
  constructor(
    private readonly connect: () => Redis | null = configuredRedis,
    private readonly memory = new ExampleCache(),
  ) {}

  async get(key: string | null): Promise<SavedAnalysis | undefined> {
    if (!key || !/^[a-f0-9]{64}$/.test(key)) return;
    try {
      const redis = this.connect();
      if (redis) {
        const value = await redis(["GET", REDIS_PREFIX + key]);
        if (typeof value === "string") {
          const entry = JSON.parse(value);
          if (entry && Number.isFinite(entry.expiresAt) && entry.expiresAt > Date.now() &&
              entry.saved && typeof entry.saved.model === "string" && "raw" in entry.saved) {
            return entry.saved as SavedAnalysis;
          }
          return;
        }
      }
    } catch {
      // Cache failure is optional. Do not log its response, analysis or secrets.
    }
    return this.memory.get(key);
  }

  async put(key: string | null, saved: SavedAnalysis): Promise<void> {
    if (!key || !/^[a-f0-9]{64}$/.test(key)) return;
    this.memory.put(key, saved);
    try {
      const redis = this.connect();
      if (redis) await redis([
        "SET", REDIS_PREFIX + key,
        JSON.stringify({ saved, expiresAt: Date.now() + EXAMPLE_CACHE_TTL_SECONDS * 1000 }),
        "EX", EXAMPLE_CACHE_TTL_SECONDS,
      ]);
    } catch {
      // Local fallback expires too. Live AI quota checks still fail closed.
    }
  }
}

export const exampleCache = new SharedExampleCache();
