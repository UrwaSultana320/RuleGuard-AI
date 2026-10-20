import type { Applicability, DegreeAssessment } from "./contracts";

export function degreeGate(
  assessments: DegreeAssessment[],
): Applicability["gate"] {
  if (assessments.some((a) => a.status === "other_degree")) return "blocked";
  if (assessments.some((a) => a.status === "uncertain")) return "uncertain";
  return "allowed";
}

export function canReveal(applicability: Applicability, acknowledged: boolean) {
  // Acknowledgment is never an override for a mismatching source.
  const gate = degreeGate(applicability.assessments);
  return (
    applicability.assessments.length === 2 &&
    applicability.gate === gate &&
    gate !== "blocked" &&
    (gate === "allowed" || acknowledged)
  );
}

export const degreeLabels = {
  selected: "Applicable to selected degree",
  other_degree: "Explicitly another degree — replace this document",
  multiple: "Covers multiple degree levels",
  general: "General policy applicable to selected degree",
  uncertain: "Degree applicability could not be confirmed",
} as const;
