import { applicantSchema } from "@/shared/schemas";
import { LIMITS } from "@/shared/limits";
import type { Event } from "@/shared/contracts";
import { extractDocument } from "@/server/documents";
import { AppError, safeError } from "@/server/errors";
import { acquire, redisClient } from "@/server/quota";
import { analyze, hasGeminiKey, missingGeminiConfiguration } from "@/server/gemini";
import { buildReport } from "@/server/evidence";
import { exampleCache, exampleCacheKey } from "@/server/example-cache";
export const runtime = "nodejs";
// Hobby Fluid Compute maximum; internal operation/provider budgets are smaller.
export const maxDuration = 300;
export const dynamic = "force-dynamic";
const headers = {
  "Content-Type": "application/x-ndjson; charset=utf-8",
  "Cache-Control": "private, no-store, no-transform, max-age=0",
  "X-Accel-Buffering": "no",
  "X-Content-Type-Options": "nosniff",
};
let localReads = 0;
export async function POST(request: Request) {
  const deadlineAt = Date.now() + LIMITS.timeoutMs;
  const signal = AbortSignal.any([
    request.signal,
    AbortSignal.timeout(LIMITS.timeoutMs),
  ]);
  const origin = request.headers.get("origin");
  if (origin) {
    let matches = false;
    try {
      const url = new URL(origin);
      matches =
        url.host === request.headers.get("host") &&
        url.protocol === new URL(request.url).protocol;
    } catch {
      /* Malformed or null origin is rejected. */
    }
    if (!matches)
      return Response.json(
        { message: "Request origin is not allowed." },
        { status: 403, headers: { "Cache-Control": "no-store" } },
      );
  }

  const length = Number(request.headers.get("content-length"));
  if (length > LIMITS.bodyBytes)
    return Response.json(
      { message: "Combined upload exceeds the safe request limit." },
      { status: 413 },
    );
  let bytes: Uint8Array;
  try {
    if (!request.body) throw Error();
    const chunks: Uint8Array[] = [];
    let size = 0;
    const reader = request.body.getReader();
    const cancelRead = () => { void reader.cancel().catch(() => {}); };
    signal.addEventListener("abort", cancelRead, { once: true });
    try {
      while (true) {
        signal.throwIfAborted();
        const { value, done } = await reader.read();
        signal.throwIfAborted();
        if (done) break;
        size += value.length;
        if (size > LIMITS.bodyBytes) {
          await reader.cancel();
          return Response.json(
            { message: "Combined upload exceeds the safe request limit." },
            { status: 413 },
          );
        }
        chunks.push(value);
      }
    } finally {
      signal.removeEventListener("abort", cancelRead);
    }
    bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
  } catch {
    return Response.json(
      { message: "The upload could not be read. Please try again." },
      { status: 400 },
    );
  }
  let form: FormData;
  try {
    form = await new Response(bytes as BodyInit, {
      headers: { "Content-Type": request.headers.get("content-type") ?? "" },
    }).formData();
  } catch {
    return Response.json(
      { message: "Choose two supported files and try again." },
      { status: 400 },
    );
  }
  const a = form.get("documentA"),
    b = form.get("documentB");
  const revision = Number(form.get("inputRevision"));
  const requestId = form.get("requestId");
  let applicant;
  try {
    applicant = applicantSchema.parse(JSON.parse(String(form.get("context"))));
  } catch {
    return Response.json(
      { message: "Check the required applicant fields." },
      { status: 400 },
    );
  }
  if (
    !(a instanceof File) ||
    !(b instanceof File) ||
    !Number.isSafeInteger(revision) ||
    revision < 0 ||
    typeof requestId !== "string" ||
    requestId.length > 80 ||
    form.get("privacyAcknowledged") !== "true"
  )
    return Response.json(
      { message: "Add both documents and acknowledge the privacy notice." },
      { status: 400 },
    );
  return new Response(
    new ReadableStream({
      async start(controller) {
        let closed = false;
        const emit = (event: Omit<Event, "revision" | "requestId">) => {
          if (!closed && !request.signal.aborted)
            try {
              controller.enqueue(
                new TextEncoder().encode(
                  JSON.stringify({ ...event, revision, requestId }) + "\n",
                ),
              );
            } catch {
              closed = true;
            }
        };
        let lease: Awaited<ReturnType<typeof acquire>> | undefined;
        let preview = false;
        let uncertainUpstream = false;
        try {
          const live = hasGeminiKey();
          const configurationMessage = live ? null : missingGeminiConfiguration();
          if (live) lease = await acquire(redisClient());
          else {
            if (localReads >= 2)
              throw new AppError(
                "TEMPORARY_RATE_LIMIT",
                "Document reading is busy. Please retry shortly.",
                15,
              );
            localReads++;
            preview = true;
          }
          emit({ type: "stage", stage: 0 } as Event);
          const sources = [
            await extractDocument(a, "A"),
            await extractDocument(b, "B"),
          ];
          if (signal.aborted)
            throw new AppError(
              "INCOMPLETE_ANALYSIS",
              "Processing timed out. Your inputs are retained.",
            );
          if (
            sources.reduce(
              (n, s) => n + s.pages.reduce((m, p) => m + p.text.length, 0),
              0,
            ) > LIMITS.textCharacters
          )
            throw new AppError(
              "TEXT_CAPACITY",
              "The full pair exceeds the supported text capacity. No content was omitted.",
            );
          emit({ type: "sources", sources } as Event);
          if (!live) {
            emit({ type: "info", code: "AI_CONFIGURATION_MISSING", message: configurationMessage! } as Event);
            return;
          }
          emit({ type: "stage", stage: 1 } as Event);
          const cacheKey = await exampleCacheKey(form.get("exampleOrigin"), sources, applicant);
          let modelUsed: string | undefined;
          let raw: unknown;
          let savedExample = false;
          try {
            raw = await analyze(sources, applicant, lease!.reserve, signal, {
              deadlineAt,
              onProgress: (progress) => emit({ type: "provider_progress", progress } as Event),
              onModelUsed: (model) => { modelUsed = model; },
            });
          } catch (error) {
            const transient = error instanceof AppError && [
              "PROVIDER_UNAVAILABLE", "PROVIDER_RATE_LIMIT", "PROVIDER_TIMEOUT", "UPSTREAM_UNCERTAIN",
            ].includes(error.code);
            const saved = transient && !request.signal.aborted ? await exampleCache.get(cacheKey) : undefined;
            if (!saved) throw error;
            raw = saved.raw;
            modelUsed = saved.model;
            savedExample = true;
            uncertainUpstream = error instanceof AppError && error.code === "UPSTREAM_UNCERTAIN";
          }
          emit({ type: "stage", stage: 2 } as Event);
          // Reconstruct and verify saved evidence against the current extracted
          // sources too; never replay a report or its old revision/review state.
          const report = buildReport(raw, sources, applicant, revision);
          if (modelUsed) report.model = modelUsed;
          if (savedExample) report.savedExample = true;
          else if (!signal.aborted && report.applicability.gate !== "blocked")
            await exampleCache.put(cacheKey, { raw, model: report.model });
          emit({ type: "stage", stage: 3 } as Event);
          // Source identity, applicability prerequisites and counts were checked locally, not separate AI calls.
          emit({ type: "stage", stage: 4 } as Event);
          if (report.applicability.gate === "blocked")
            emit({
              type: "applicability",
              applicability: report.applicability,
            } as Event);
          else emit({ type: "result", report } as Event);
        } catch (error) {
          console.error("[RuleGuard compare]", {
            code: error instanceof AppError ? error.code : "INCOMPLETE_ANALYSIS",
            ...(error instanceof AppError ? error.providerDiagnostic : undefined),
          });
          uncertainUpstream ||= error instanceof AppError && error.code === "UPSTREAM_UNCERTAIN";
          emit({ type: "error", ...safeError(error) } as Event);
        } finally {
          if (preview) localReads--;
          // Ambiguous upstream failure conservatively retains the lease until its bounded expiry.
          if (lease && !uncertainUpstream)
            try {
              await lease.release();
            } catch {
              /* Fail closed: the lease expires; never log content or credentials. */
            }
          if (!closed) {
            try {
              controller.close();
            } catch {
              closed = true;
            }
          }
        }
      },
    }),
    { headers },
  );
}
