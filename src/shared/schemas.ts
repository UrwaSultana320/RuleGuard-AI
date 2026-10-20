import { z } from "zod";
import { CATEGORIES } from "./limits";
export const applicantSchema = z
  .object({
    degree: z.enum(["Bachelor's", "Master's"]),
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
    documentAssessments: z.array(
      z
        .object({
          sourceId: z.string(),
          status: z.enum([
            "selected",
            "other_degree",
            "multiple",
            "general",
            "uncertain",
          ]),
          explanation: z.string().trim().min(1),
          evidence: z.array(clause),
          missingInformation: z.array(z.string().trim().min(1)),
          exclusivelyOtherDegree: z.boolean(),
          conflictingEvidence: z.boolean(),
        })
        .strict(),
    ),
    rules: z.array(
      z
        .object({
          ruleId: z.string(),
          sourceId: z.string(),
          requirement: clause,
          scope: clause,
          degreeMatch: z.enum(["selected", "general", "other", "unknown"]),
          degreeEvidence: clause,
          scopeMatch: z.enum(["matches", "does_not_match", "unknown"]),
          conditionStatus: z.enum([
            "met",
            "not_met",
            "unknown",
            "not_applicable",
          ]),
          conditions: z
            .array(clause)
            .describe(
              "Every source-stated prerequisite, including evidence possession/submission, completion, achievement, timing and approval; include cited clauses even when also mentioned in requirement. Empty does not prove absence.",
            ),
          exceptions: z
            .array(clause)
            .describe(
              "Only clauses allowing a departure from a general rule. Prohibitions, mandatory rules and no-exception statements are not exceptions. Preserve uncertain structure in requirement and limitations.",
            ),
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
                detail: z
                  .string()
                  .describe(
                    "The precise fact that is unknown and why it matters. For condition satisfaction, identify unknown evidence possession, achievement, completion or approval. Do not merely restate a policy disagreement or infer applicant achievements.",
                  ),
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
