import type { Finding } from "./contracts";

const sentences = (text: string) =>
  Array.from(new Intl.Segmenter("en", { granularity: "sentence" }).segment(text));

export function findingSummary(finding: Finding) {
  const first = sentences(finding.explanation)[0]?.segment.trim();
  if (first && /Document A\b/i.test(first) && /Document B\b/i.test(first)) return first;
  // Older reports may not have a two-sided explanation. Keep their source-specific
  // interpretations rather than inventing a counterpart or an exemption.
  return ["A", "B"].map(id => {
    const rules = finding.rules.filter(rule => rule.sourceId === id);
    const descriptions = rules.map(rule => rule.description.trim().replace(/[.!?]+$/, ""));
    return `Document ${id}: ${descriptions.length ? descriptions.join("; ") : "no supporting rule was identified; agreement or absence is not established"}`;
  }).join("; ") + ".";
}

export function quoteDisplay(text: string, context: string) {
  const lines = text.split("\n");
  let start = 0;
  // Trim only recognizable standalone metadata. Scope headings and operative
  // language stay intact; original text and reference are never changed.
  const header = /^(?:\s*$|\s*(?:SYNTHETIC (?:TEST DOCUMENT|POLICY|PROGRAMME GUIDANCE)|Fictional institution:|Fixture:|Prepared for benchmark review:|Document [AB]\s*$|Source:|File:))/i;
  const operative = /\b(?:must|required?|accepts?|permits?|may|cannot|no waiver|covers?|appl(?:y|ies|icants)|only|unless|except)\b/i;
  while (start < lines.length - 1 && header.test(lines[start]) && !operative.test(lines[start])) start++;
  const display = lines.slice(start).join("\n");
  const terms = new Set(context.toLowerCase().match(/[a-z0-9]{3,}/g)?.filter(word =>
    !["the", "and", "for", "with", "document", "source", "this", "that", "applicants"].includes(word)));
  const candidates = sentences(display);
  const score = (value: string) => {
    const words = new Set(value.toLowerCase().match(/[a-z0-9]{3,}/g));
    return [...words].filter(word => terms.has(word)).length;
  };
  const key = candidates.reduce<(typeof candidates)[number] | undefined>((best, item) =>
    !best || score(item.segment) > score(best.segment) ? item : best, undefined);
  return {
    before: key ? display.slice(0, key.index) : "",
    highlight: key?.segment.trimEnd() ?? display,
    after: key ? display.slice(key.index + key.segment.trimEnd().length) : "",
    trimmed: display !== text,
  };
}
