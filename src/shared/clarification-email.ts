import { z } from "zod";
import type { Finding, Report, Review, Source } from "./contracts";

export const EMAIL_EMPTY_STATE = "Accept a finding to draft your email.";
export const EMAIL_FAILURE = "A safe draft could not be prepared. Review the source evidence and applicant details, then try again.";
export const MAILTO_LENGTH_LIMIT = 2000;
export const emailDraftSchema = z.object({ subject: z.string().min(1).max(240), body: z.string().min(1) }).strict();
export type EmailDraft = z.infer<typeof emailDraftSchema>;
export type EmailIssueType = "contradiction" | "missing_information" | "unclear_exception";
export type EmailContext = {
  report: Report; reviews: Record<string, Review>; sources: Source[];
  includeUncertain?: boolean; currentRevision: number; outdated?: boolean;
};
export type EmailQuotation = { sourceId: string; passageId: string; text: string };
export type EmailInput = {
  reportId: string; revision: number;
  applicant: { programme: string; intake: string; category: string };
  findings: {
    id: string; topic: string; type: EmailIssueType; status: "accepted" | "uncertain";
    verifiedSummary: string; quotations: EmailQuotation[];
    existingClarificationQuestion: string; applicability: string[];
  }[];
  include_uncertain: boolean;
};
export type EmailDiagnostic = "EMAIL_STALE" | "EMAIL_INPUT" | "EMAIL_CONTENT" | "EMAIL_STRUCTURE" | "EMAIL_EVIDENCE";
const oneLine = (text: string) => text.replace(/[\r\n]+/g, " ").trim();
const known = (text: string) => /^(?:not sure|unknown|unspecified|n\/a)?$/i.test(text.trim()) ? "" : oneLine(text);
const closing = "I would be grateful for a written reply, as I will plan my application around your answer.\n\nKind regards,\n[Your full name]\nApplication reference: [if you have one]";
export const EMAIL_LABELS = ["The problem:", "What the first document says:", "What the second document says:", "My question:"] as const;
// Supplements closed-template semantics and registry provenance; not a semantic
// verifier of arbitrary model prose. Model summaries never become email claims.
const prohibited = /\b(?:university|universities|institution|college|institute|school|synthetic|fictional|fixture|benchmark|test[- ]only|example[- ]data|offline|RuleGuard|Gemini|ChatGPT|OpenAI|automated verification|model confidence|AI found|Document [AB]|Source [AB]|passage[- ]?id|prepared (?:for|by)|lines? \d|PDF page)\b|\b\S+\.(?:txt|pdf|docx?|csv|json|html)\b|https?:\/\/|\*\*|[<>]/i;
function safe(text: string, context: EmailContext) {
  const terms = context.sources.map(s => s.name);
  const identifiers = context.report.findings.flatMap(f => [f.id, ...f.rules.flatMap(r => [r.id, ...r.evidence.map(e => e.id)])]);
  // Natural word IDs (such as "certificate") can also be legitimate prose.
  // Structured internal IDs and UUIDs have no place in an admissions email.
  terms.push(...identifiers.filter(id => /[-_:]|^[a-f0-9]{16,}$/i.test(id)));
  for (const s of context.sources) for (const p of s.passages) for (const line of p.text.split("\n")) {
    const header = /^(?:fictional )?institution(?: name)?:\s*(.+)$/i.exec(line.trim());
    if (header) terms.push(header[1].trim());
  }
  return !prohibited.test(text) && !/\bS\d{2}(?:[-_][a-z0-9]+)*\b|\b(?:sourceVerified|scopeMatch|degreeMatch|debug|confidence score|I demand|or else|legal action|I will sue)\b/i.test(text) && !terms.filter(Boolean).some(t => text.toLowerCase().includes(t.toLowerCase())) &&
    !/\[[^\]]*\]/.test(text.replaceAll("[Your full name]", "").replaceAll("[if you have one]", ""));
}
function documentedAlternative(text: string) {
  return Array.from(new Intl.Segmenter("en", { granularity: "sentence" }).segment(text)).some(({ segment }) =>
    /\b(?:except (?:for|when|where)|may (?:replace|be (?:waived|exempt))|accepted instead of|(?:exemption|waiver) (?:may|is available))\b/i.test(segment) &&
    !/\b(?:not|never|cannot|no)\b/i.test(segment));
}
export function emailIssueType(f: Finding): EmailIssueType | null {
  if (!f.rules.length || f.rules.some(r => r.degreeMatch === "other") ||
    f.rules.every(r => ["differs", "does_not_match"].includes(r.scopeMatch))) return null;
  const exception = f.rules.some(r => r.exceptions.length && r.evidence.some(e =>
    e.sourceVerified && documentedAlternative(e.text)));
  if (f.classification === "Potential Contradiction") return "contradiction";
  if (f.classification === "Insufficient Evidence") return exception ? "unclear_exception" : "missing_information";
  if (f.classification === "Different Applicable Conditions" && exception && f.unknowns.length && f.clarificationQuestion.trim()) return "unclear_exception";
  return null;
}
function quotationText(text: string, context: EmailContext) {
  const lines = text.split("\n");
  let preparationHeaderRemoved = false;
  // Only standalone preparation headers may be removed. Retain operative scope,
  // negations, conditions and subsequent sentences without editing their words.
  while (lines.length > 1 && /^(?:\s*$|\s*(?:SYNTHETIC (?:TEST DOCUMENT|POLICY|PROGRAMME GUIDANCE)|Fictional institution:|Fixture:|Prepared for benchmark review:|Document [AB]\s*$|Source:|File:))/i.test(lines[0]) &&
    !/\b(?:must|required?|may|only|unless|except|covers?|appl(?:y|ies|icants))\b/i.test(lines[0])) {
    lines.shift(); preparationHeaderRemoved = true;
  }
  // A benchmark preparation scope header is not the policy quotation. Omit
  // only this contiguous prefix when no operative condition is embedded in it.
  // Never infer that the two sources therefore share applicant applicability.
  if (preparationHeaderRemoved && /^Scope:/i.test(lines[0] ?? "") &&
    !/\b(?:must|required?|may|only|unless|except|covers?|applies)\b/i.test(lines[0])) lines.shift();
  const quote = lines.join("\n").trim();
  return quote && safe(quote, context) ? quote : null;
}
export function prepareEmailInput(context: EmailContext): EmailInput {
  const { report, reviews, sources } = context;
  if (context.outdated || report.revision !== context.currentRevision || report.applicability.gate === "blocked") throw Error("EMAIL_STALE");
  const findings: EmailInput["findings"] = [];
  for (const f of report.findings) {
    const status = reviews[f.id];
    if (status !== "Accepted" && !(status === "Uncertain" && context.includeUncertain === true)) continue;
    const type = emailIssueType(f);
    if (!type) continue;
    const quotations: EmailQuotation[] = [];
    for (const r of f.rules) for (const e of r.evidence) {
      const source = sources.find(s => s.id === r.sourceId);
      const passage = source?.passages.find(p => p.id === e.id && p.sourceId === r.sourceId);
      if (!e.sourceVerified || e.sourceId !== r.sourceId || !passage || passage.text !== e.text ||
        passage.page !== e.page || passage.lineStart !== e.lineStart || passage.lineEnd !== e.lineEnd) continue;
      const text = quotationText(passage.text, context);
      if (text && !quotations.some(q => q.sourceId === source!.id && q.text === text)) quotations.push({ sourceId: source!.id, passageId: passage.id, text });
    }
    if (!quotations.length || (type === "contradiction" && new Set(quotations.map(q => q.sourceId)).size < 2)) throw Error("EMAIL_EVIDENCE");
    findings.push({ id: f.id, topic: oneLine(f.topic), type, status: status === "Accepted" ? "accepted" : "uncertain",
      verifiedSummary: quotations.map(q => q.text).join("\n"), quotations,
      existingClarificationQuestion: f.clarificationQuestion,
      applicability: f.rules.filter(r => r.degreeMatch !== "unknown" && r.scopeMatch === "matches").map(r => r.scope),
    });
  }
  return { reportId: report.id, revision: report.revision, applicant: {
    programme: known(report.applicant.program), intake: known(report.applicant.intake), category: known(report.applicant.category),
  }, findings, include_uncertain: context.includeUncertain === true };
}
export function exactQuotation(quote: string, source: string) {
  if (source.includes(quote)) return true;
  const segments = quote.split(/\s*\[…\]\s*|\s*\[\.\.\.\]\s*/);
  if (segments.length < 2 || segments.some(s => !s)) return false;
  let offset = 0;
  for (const segment of segments) {
    const at = source.indexOf(segment, offset);
    if (at < 0) return false;
    offset = at + segment.length;
  }
  return true;
}
function question(f: EmailInput["findings"][number], fallback: boolean) {
  const topic = fallback ? "this admission requirement" : f.topic.replace(/[?.!]+$/, "");
  return f.type === "unclear_exception"
    ? `Could you confirm the conditions for the documented exception regarding ${topic}?`
    : `Could you confirm which requirement applies to my application regarding ${topic}${f.quotations.some(q => documentedAlternative(q.text)) ? ", including the conditions for any documented alternative" : ""}?`;
}
function problem(f: EmailInput["findings"][number], fallback: boolean) {
  const topic = fallback ? "this admission requirement" : f.topic;
  if (f.type === "missing_information") return `The available evidence does not establish all the requirements or conditions for ${topic}. I would appreciate confirmation of the applicable requirement.`;
  if (f.type === "unclear_exception") return `The guidance documents an exception concerning ${topic}, but its applicability to my application remains uncertain.`;
  const positions = [...new Map(f.quotations.map(q => [q.sourceId, q.text])).values()];
  const firstSentence = (text: string) => oneLine(Array.from(new Intl.Segmenter("en", { granularity: "sentence" }).segment(text))[0]?.segment ?? text);
  return fallback ? `The available guidance gives different instructions concerning ${topic}. I would appreciate confirmation of which requirement applies.`
    : `The first guidance states: ${firstSentence(positions[0])}\nThe second guidance states: ${firstSentence(positions[1])}`;
}
function subject(input: EmailInput, fallback: boolean) {
  const prefix = [input.applicant.programme, input.applicant.intake].filter(Boolean).join(", ");
  const topic = fallback ? "this admission requirement" : input.findings[0].topic.replace(/[?.!]+$/, "");
  const shortQuestion = topic.split(/\s+/).length > 7 || topic.length > 80 || /\b(?:conflicts?|contradict\w*|disagree\w*)\b/i.test(topic) ? "Which admission requirement applies?" : `Which requirement applies to ${topic}?`;
  const request = input.findings.length > 1 ? `clarification needed on ${input.findings.length} admission requirements` : shortQuestion;
  return `${prefix ? prefix + ": " : ""}${request}`;
}
function introduction(input: EmailInput) {
  const { programme, intake, category } = input.applicant;
  const applicant = category ? category.replace(/\s+applicant$/i, "").toLowerCase() + " applicant" : "applicant";
  return `I am ${/^[aeiou]/i.test(applicant) ? "an" : "a"} ${applicant}${programme ? ` for ${programme}` : ""}${intake ? `${programme ? "," : " for"} ${intake} intake` : ""}.`;
}
function evidenceArea(f: EmailInput["findings"][number]) {
  return [...new Set(f.quotations.map(q => q.sourceId))].map((id, j) => `${EMAIL_LABELS[j + 1]}\n${f.quotations.filter(q => q.sourceId === id).map(q => `“${q.text}”`).join("\n\n")}`).join("\n\n");
}
export function renderEmail(input: EmailInput, fallback = false): EmailDraft {
  const sections = input.findings.map((f, i) => `${input.findings.length > 1 ? `${i + 1}. ${fallback ? "Admission requirement" : f.topic}\n\n` : ""}The problem:\n${problem(f, fallback)}\n\n${evidenceArea(f)}\n\nMy question:\n${question(f, fallback)}${f.status === "uncertain" ? "\nI may have misread this; please correct me if so." : ""}`);
  return { subject: subject(input, fallback), body: `Dear Admissions Team,\n\n${introduction(input)}\nI would appreciate clarification of the following admission ${input.findings.length === 1 ? "requirement" : "requirements"} before planning my application.\n\n${sections.join("\n\n")}\n\n${closing}` };
}
/** Parse the actual output and validate against current reviews and registry.
 * Semantic correctness comes from closed source-derived templates, not regexes
 * claiming to establish the meaning of arbitrary AI prose.
 */
export function validateClarificationEmail(draft: EmailDraft, input: EmailInput, context: EmailContext): EmailDiagnostic | null {
  let current: EmailInput;
  try { current = prepareEmailInput(context); } catch { return "EMAIL_STALE"; }
  if (!current.findings.length || JSON.stringify(current) !== JSON.stringify(input)) return "EMAIL_INPUT";
  if (!emailDraftSchema.safeParse(draft).success || /[\r\n]/.test(draft.subject)) return "EMAIL_STRUCTURE";
  if (!safe(draft.subject + "\n" + draft.body, context)) return "EMAIL_CONTENT";
  for (const f of current.findings) {
    // A model topic heading is not evidence for an admission score or deadline.
    // Unknown numeric claims must disappear in the conservative fallback.
    const supportedNumbers = new Set(f.quotations.flatMap(q => q.text.match(/\d+(?:\.\d+)?/g) ?? []));
    if ((draft.subject.includes(f.topic) || draft.body.includes(f.topic)) &&
      (f.topic.match(/\d+(?:\.\d+)?/g) ?? []).some(n => !supportedNumbers.has(n))) return "EMAIL_CONTENT";
  }
  if (!draft.body.startsWith(`Dear Admissions Team,\n\n${introduction(current)}\n`) || !draft.body.endsWith(closing)) return "EMAIL_STRUCTURE";
  const blocks = draft.body.split("The problem:\n");
  if (blocks.length !== current.findings.length + 1) return "EMAIL_STRUCTURE";
  for (let i = 0; i < current.findings.length; i++) {
    const f = current.findings[i], block = blocks[i + 1];
    const first = block.indexOf("What the first document says:\n"), ask = block.indexOf("My question:\n");
    if (first < 1 || ask <= first) return "EMAIL_STRUCTURE";
    if (![problem(f, false), problem(f, true)].includes(block.slice(0, first).trim())) return "EMAIL_CONTENT";
    const q = block.slice(ask + "My question:\n".length).split("\n")[0];
    if (![question(f, false), question(f, true)].includes(q) || q.match(/\?/g)?.length !== 1) return "EMAIL_CONTENT";
    if (block.slice(first, ask).trim() !== evidenceArea(f)) return "EMAIL_EVIDENCE";
    for (const quotation of f.quotations) {
      const source = context.sources.find(s => s.id === quotation.sourceId);
      const passage = source?.passages.find(p => p.id === quotation.passageId && p.sourceId === quotation.sourceId);
      if (!passage || !exactQuotation(quotation.text, passage.text)) return "EMAIL_EVIDENCE";
    }
  }
  // Reject extra assertions, excluded findings, wrong counts/numbering, changed
  // context, unknown placeholders or misleading uncertainty wording.
  return [renderEmail(current), renderEmail(current, true)].some(d => d.subject === draft.subject && d.body === draft.body) ? null : "EMAIL_STRUCTURE";
}
export function generateClarificationEmail(context: EmailContext, renderer = renderEmail): {
  draft: EmailDraft | null; diagnostics: EmailDiagnostic[]; mode: "normal" | "fallback" | "empty" | "failed";
} {
  const diagnostics: EmailDiagnostic[] = [];
  let input: EmailInput;
  try { input = prepareEmailInput(context); }
  catch (e) { return { draft: null, diagnostics: [e instanceof Error && e.message === "EMAIL_STALE" ? "EMAIL_STALE" : "EMAIL_EVIDENCE"], mode: "failed" }; }
  if (!input.findings.length) return { draft: null, diagnostics, mode: "empty" };
  for (const fallback of [false, true]) {
    let draft: EmailDraft;
    try { draft = fallback ? renderEmail(input, true) : renderer(input); }
    catch { diagnostics.push("EMAIL_STRUCTURE"); continue; }
    const failure = validateClarificationEmail(draft, input, context);
    if (!failure) return { draft, diagnostics, mode: fallback ? "fallback" : "normal" };
    diagnostics.push(failure);
  }
  return { draft: null, diagnostics, mode: "failed" };
}
export function buildClarificationEmail(report: Report, reviews: Record<string, Review>, includeUncertain = false, sources: Source[] = []): EmailDraft | null {
  return generateClarificationEmail({ report, reviews, includeUncertain, sources, currentRevision: report.revision }).draft;
}
export function emailCopyText(draft: EmailDraft) { return `Subject: ${draft.subject}\n\n${draft.body}`; }
export function emailMailto(draft: EmailDraft, recipient = ""): { href: string | null; reason: "recipient" | "length" | null } {
  const address = recipient.trim();
  if (address && !/^[^\s@,;<>?&#%]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(address)) return { href: null, reason: "recipient" };
  const href = `mailto:${encodeURIComponent(address)}?subject=${encodeURIComponent(oneLine(draft.subject))}&body=${encodeURIComponent(draft.body)}`;
  return href.length > MAILTO_LENGTH_LIMIT ? { href: null, reason: "length" } : { href, reason: null };
}
