import type { Finding } from "./contracts";
import { findingSummary } from "./finding-display";

function hasVerifiedEvidence(finding: Finding) {
  return finding.rules.length > 0 && finding.rules.every(rule =>
    rule.evidence.length > 0 && rule.evidence.every(evidence =>
      evidence.sourceVerified === true && evidence.sourceId === rule.sourceId));
}

export function resultsVerdict(findings: Finding[]) {
  const verified = findings.filter(hasVerifiedEvidence);
  const conflict = verified.find(finding =>
    finding.classification === "Potential Contradiction" &&
    ["A", "B"].every(id => finding.rules.some(rule => rule.sourceId === id)));
  const unverified = verified.length !== findings.length || verified.some(finding =>
    finding.classification === "Potential Contradiction" &&
    !["A", "B"].every(id => finding.rules.some(rule => rule.sourceId === id)));
  if (conflict) return {
    kind: "conflict" as const,
    title: "Conflict found: these two documents disagree.",
    summary: findingSummary(conflict).replace(/;\s*(?=Document B\b)/i, ". "),
    unverified,
  };
  if (unverified || verified.some(finding =>
    finding.classification === "Different Applicable Conditions" ||
    finding.classification === "Insufficient Evidence")) return {
    kind: "clarification" as const,
    title: "No direct conflict, but clarification is needed.",
    summary: "",
    unverified,
  };
  return {
    kind: "clear" as const,
    title: "No conflicts found in what we compared. Check the originals before relying on this.",
    summary: "",
    unverified,
  };
}
