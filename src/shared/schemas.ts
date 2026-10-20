import { z } from "zod";
import { CATEGORIES } from "./limits";
export const applicantSchema = z
  .object({
    degree: z.literal("Master's"),
    program: z.string().trim().min(1, "Enter the intended program.").max(120),
    intake: z.string().trim().min(1).max(80),
    category: z.string().trim().min(1).max(120),
  })
  .strict();
const clause = z
  .object({ text: z.string(), passageIds: z.array(z.string()) })
  .strict();
export const rawSchema = z
  .object({
    analysisStatus: z.enum(["complete", "incomplete"]),
    sourceIds: z.array(z.string()),
    limitations: z.array(z.string()),
    rules: z.array(
      z
        .object({
          ruleId: z.string(),
          sourceId: z.string(),
          requirement: clause,
          scope: clause,
          scopeMatch: z.enum(["matches", "does_not_match", "unknown"]),
          conditionStatus: z.enum([
            "met",
            "not_met",
            "unknown",
            "not_applicable",
          ]),
          conditions: z.array(clause),
          exceptions: z.array(clause),
        })
        .strict(),
    ),
    coverage: z.array(
      z
        .object({
          passageId: z.string(),
          ruleIds: z.array(z.string()),
          disposition: z.enum(["rules", "context_only", "outside_comparison"]),
          reason: z.string(),
        })
        .strict(),
    ),
    findings: z.array(
      z
        .object({
          topic: z.string(),
          ruleIds: z.array(z.string()),
          classification: z.enum(CATEGORIES),
          unknowns: z.array(
            z
              .object({
                detail: z.string(),
                kind: z.enum([
                  "source_scope",
                  "applicant_selector",
                  "condition_satisfaction",
                  "qualification_identity",
                  "missing_source_support",
                ]),
                blocksComparison: z.boolean(),
              })
              .strict(),
          ),
          explanation: z.string(),
          clarificationQuestion: z.string(),
        })
        .strict(),
    ),
  })
  .strict();
export type RawAnalysis = z.infer<typeof rawSchema>;
