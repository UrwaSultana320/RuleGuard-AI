import { z } from "zod";
import { rawSchema } from "@/shared/schemas";
import { LIMITS } from "@/shared/limits";
import type { Applicant, Source } from "@/shared/contracts";
import { instructions } from "./prompt";
import { AppError } from "./errors";
const MODEL = "gemini-3.1-flash-lite";
export function requestContents(sources: Source[], applicant: Applicant) {
  return [
    {
      role: "user",
      parts: [
        {
          text: JSON.stringify({
            applicant,
            sources: sources.map((s) => ({
              sourceId: s.id,
              filename: s.name,
              kind: s.kind,
              passages: s.passages.map((p) => ({
                passageId: p.id,
                text: p.text,
              })),
            })),
          }),
        },
      ],
    },
  ];
}
export async function analyze(
  sources: Source[],
  applicant: Applicant,
  reserve: (kind: "count" | "generation", tokens: number) => Promise<void>,
  signal: AbortSignal,
) {
  if (process.env.GEMINI_REQUESTS_ENABLED !== "true")
    throw new AppError(
      "AI_NOT_ENABLED",
      "AI analysis is not enabled in this local preview yet. You can inspect your extracted sources; no AI report was generated.",
    );
  const key = process.env.GEMINI_API_KEY;
  if (!key)
    throw new AppError(
      "PROVIDER_UNAVAILABLE",
      "AI analysis is not configured. Your extracted sources remain available.",
    );
  const contents = requestContents(sources, applicant);
  async function call(method: string, body: unknown) {
    let response: Response;
    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:${method}`,
        {
          method: "POST",
          headers: {
            "x-goog-api-key": key as string,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
          signal,
          cache: "no-store",
        },
      );
    } catch {
      throw new AppError(
        "UPSTREAM_UNCERTAIN",
        "The AI service did not respond in time. Your work is retained. Retry when available.",
      );
    }
    if (response.status === 429)
      throw new AppError(
        "PROVIDER_RATE_LIMIT",
        "Google’s current quota is unavailable. Check its reset guidance before retrying; retries also use quota.",
      );
    if (!response.ok)
      throw new AppError(
        "PROVIDER_UNAVAILABLE",
        "The AI service could not complete this request. Your work is retained; no report was created.",
      );
    try {
      return await response.json();
    } catch {
      throw new AppError(
        "INCOMPLETE_ANALYSIS",
        "The AI response could not be read. Please retry later.",
      );
    }
  }
  // A token utility is a real external request and gets its own reservation. No implicit retries.
  await reserve("count", LIMITS.inputTokens);
  const count = await call("countTokens", {
    generateContentRequest: {
      model: `models/${MODEL}`,
      systemInstruction: { parts: [{ text: instructions }] },
      contents,
    },
  });
  const tokens = count.totalTokens;
  if (
    !Number.isSafeInteger(tokens) ||
    tokens < 1 ||
    tokens > LIMITS.inputTokens
  )
    throw new AppError(
      "TEXT_CAPACITY",
      "The full documents exceed the supported input-token capacity or could not be counted safely. No text was truncated.",
    );
  await reserve("generation", tokens);
  const schema = z.toJSONSchema(rawSchema);
  delete (schema as Record<string, unknown>).$schema;
  const output = await call("generateContent", {
    systemInstruction: { parts: [{ text: instructions }] },
    contents,
    generationConfig: {
      temperature: 1,
      maxOutputTokens: LIMITS.outputTokens,
      responseMimeType: "application/json",
      responseJsonSchema: schema,
    },
  });
  const candidate = output.candidates?.[0];
  if (candidate?.finishReason !== "STOP")
    throw new AppError(
      "INCOMPLETE_ANALYSIS",
      "The AI analysis was blocked or incomplete. No completed report was created. Inspect the full sources or retry.",
    );
  try {
    return JSON.parse(
      candidate.content.parts
        .filter(
          (p: { text?: string; thought?: boolean }) => p.text && !p.thought,
        )
        .map((p: { text: string }) => p.text)
        .join(""),
    );
  } catch {
    throw new AppError(
      "INCOMPLETE_ANALYSIS",
      "The AI returned an unreadable structured response. No report was created.",
    );
  }
}
