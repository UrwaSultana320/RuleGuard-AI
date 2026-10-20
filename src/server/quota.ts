import { randomUUID } from "node:crypto";
import { AppError } from "./errors";
import { LIMITS } from "@/shared/limits";
type Redis = (command: (string | number)[]) => Promise<unknown>;
export const acquireScript = `local now=redis.call('TIME'); local ms=now[1]*1000+math.floor(now[2]/1000)
redis.call('ZREMRANGEBYSCORE',KEYS[1],'-inf',ms)
if redis.call('ZCARD',KEYS[1])>=tonumber(ARGV[2]) then return {0,15} end
redis.call('ZADD',KEYS[1],ms+330000,ARGV[1]); redis.call('EXPIRE',KEYS[1],360); return {1,0}`;
export const reserveScript = `local now=redis.call('TIME'); local ms=now[1]*1000+math.floor(now[2]/1000)
local lease=redis.call('ZSCORE',KEYS[1],ARGV[1]); if not lease or tonumber(lease)<=ms then return {0,15} end
if redis.call('EXISTS',KEYS[7])==1 then return {0,60} end
redis.call('ZREMRANGEBYSCORE',KEYS[3],'-inf',ms-60000); redis.call('ZREMRANGEBYSCORE',KEYS[4],'-inf',ms-60000)
redis.call('ZREMRANGEBYSCORE',KEYS[5],'-inf',ms-60000)
local generation=tonumber(ARGV[3]); local tokens=tonumber(ARGV[4]); local total=0
for _,v in ipairs(redis.call('ZRANGE',KEYS[5],0,-1)) do local n=string.match(v,'|(%d+)$'); total=total+tonumber(n or '0') end
if generation==1 and tonumber(redis.call('GET',KEYS[2]) or '0')>=tonumber(ARGV[5]) then return {0,86400} end
if tonumber(redis.call('GET',KEYS[6]) or '0')>=tonumber(ARGV[7]) then return {0,86400} end
if generation==1 and redis.call('ZCARD',KEYS[3])>=tonumber(ARGV[6]) then return {0,60} end
if redis.call('ZCARD',KEYS[4])>=tonumber(ARGV[8]) or total+tokens>tonumber(ARGV[9]) then return {0,60} end
if generation==1 then redis.call('INCR',KEYS[2]); redis.call('EXPIRE',KEYS[2],172800); redis.call('ZADD',KEYS[3],ms,ARGV[2]); redis.call('EXPIRE',KEYS[3],120) end
redis.call('INCR',KEYS[6]); redis.call('EXPIRE',KEYS[6],172800); redis.call('ZADD',KEYS[4],ms,ARGV[2]); redis.call('EXPIRE',KEYS[4],120)
redis.call('ZADD',KEYS[5],ms,ARGV[2]..'|'..tokens); redis.call('EXPIRE',KEYS[5],120); redis.call('SET',KEYS[7],'1','EX',120); return {1,0}`;
export const releaseScript = `return redis.call('ZREM',KEYS[1],ARGV[1])`;
export function providerDay(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
export function redisClient(): Redis {
  const endpoint = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!endpoint || !token)
    throw new AppError(
      "QUOTA_UNAVAILABLE",
      "Analysis is unavailable until secure quota protection is configured. Your documents remain in this session.",
    );
  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    throw new AppError(
      "QUOTA_UNAVAILABLE",
      "Quota protection is unavailable. Please try later.",
    );
  }
  if (
    url.protocol !== "https:" ||
    !url.hostname.endsWith(".upstash.io") ||
    url.username ||
    url.password
  )
    throw new AppError(
      "QUOTA_UNAVAILABLE",
      "Quota protection is unavailable. Please try later.",
    );
  return async (command) => {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) throw Error();
      const data = await response.json();
      if (data.error || !("result" in data)) throw Error();
      return data.result;
    } catch {
      throw new AppError(
        "QUOTA_UNAVAILABLE",
        "Quota protection is temporarily unavailable. No AI request was made. Please try later.",
      );
    }
  };
}
export async function acquire(redis: Redis) {
  const lease = randomUUID();
  const key = "ruleguard:v1:leases";
  const result = await redis([
    "EVAL",
    acquireScript,
    1,
    key,
    lease,
    LIMITS.concurrency,
  ]);
  check(result);
  return {
    lease,
    async release() {
      await redis(["EVAL", releaseScript, 1, key, lease]);
    },
    async reserve(kind: "count" | "generation", tokens: number) {
      if (
        !Number.isSafeInteger(tokens) ||
        tokens < 0 ||
        tokens > LIMITS.inputTokens
      )
        throw new AppError(
          "TEXT_CAPACITY",
          "The complete input exceeds the token limit. No content was omitted.",
        );
      const day = providerDay();
      const prefix = "ruleguard:v1:";
      const requestId = randomUUID();
      check(
        await redis([
          "EVAL",
          reserveScript,
          7,
          key,
          prefix + "day:" + day,
          prefix + "starts",
          prefix + "requests",
          prefix + "tokens",
          prefix + "providerday:" + day,
          prefix + "reservation:" + requestId,
          lease,
          requestId,
          kind === "generation" ? 1 : 0,
          tokens,
          LIMITS.dayAttempts,
          LIMITS.minuteStarts,
          LIMITS.providerRpd,
          LIMITS.providerRpm,
          LIMITS.inputTpm,
        ]),
      );
    },
  };
}
function check(value: unknown): asserts value is number[] {
  if (
    !Array.isArray(value) ||
    value.length !== 2 ||
    !value.every(Number.isFinite)
  )
    throw new AppError(
      "QUOTA_UNAVAILABLE",
      "Quota protection returned an invalid response. No AI request was made.",
    );
  if (value[0] !== 1)
    throw new AppError(
      value[1] >= 86400 ? "DAILY_CAPACITY" : "TEMPORARY_RATE_LIMIT",
      value[1] >= 86400
        ? "The daily analysis allowance is exhausted. Try after the next midnight Pacific reset."
        : "Analysis capacity is busy. Your work is retained; please retry shortly.",
      value[1] >= 86400 ? undefined : Math.max(1, value[1]),
    );
}
