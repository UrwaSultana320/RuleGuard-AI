import { beforeEach, expect, it } from "vitest";
import {
  buildClarificationEmail, emailCopyText, emailMailto, emailDraftSchema,
  generateClarificationEmail, prepareEmailInput, renderEmail, validateClarificationEmail,
  exactQuotation, emailIssueType, type EmailContext,
} from "@/shared/clarification-email";
import { editorialReport, editorialSources } from "../fixtures/editorial";

let context: EmailContext;
beforeEach(() => {
  context = { report: structuredClone(editorialReport(0)), sources: structuredClone(editorialSources), reviews: { certificate: "Accepted" }, currentRevision: 0 };
});
const generate = () => generateClarificationEmail(context);
const draft = () => generate().draft!;
function changeQuote(text: string, side = 0) {
  const evidence = context.report.findings[0].rules[side].evidence[0];
  evidence.text = text;
  context.sources[side].passages.find(p => p.id === evidence.id)!.text = text;
}
function invalid(mutator: (d: { subject: string; body: string }) => void) {
  const input = prepareEmailInput(context), value = renderEmail(input);
  mutator(value);
  expect(validateClarificationEmail(value, input, context)).not.toBeNull();
}

it("builds a professional single contradiction with exact evidence after the problem", () => {
  const before = structuredClone(context), value = draft();
  expect(generate().mode).toBe("normal");
  expect(value.subject).toBe("MSc Computing, September 2026: Which requirement applies to English-medium certificates?");
  expect(value.body).toMatch(/^Dear Admissions Team,\n\nI am an international applicant for MSc Computing, September 2026 intake\./);
  expect(value.body).toContain("The first guidance states: An official certificate");
  expect(value.body.indexOf("The problem:")).toBeLessThan(value.body.indexOf("What the first document says:"));
  for (const rule of context.report.findings[0].rules) expect(value.body).toContain(`“${rule.evidence[0].text}”`);
  expect(value.body).toContain("including the conditions for any documented alternative?");
  expect(value.body).not.toMatch(/\n1\. /);
  expect(value.body).toContain("I would be grateful for a written reply, as I will plan my application around your answer.");
  expect(value.body).toMatch(/Kind regards,\n\[Your full name\]\nApplication reference: \[if you have one\]$/);
  expect(value.body.split(/\s+/).length).toBeLessThanOrEqual(260);
  expect(context).toEqual(before);
});
it("accepted missing information can use only one source without inventing a second quotation", () => {
  context.reviews = { identity: "Accepted" };
  context.report.findings[3].rules = [context.report.findings[3].rules[0]];
  expect(prepareEmailInput(context).findings[0].type).toBe("missing_information");
  expect(draft().body).toContain("does not establish all the requirements or conditions for Qualification equivalence");
  expect(draft().body).toContain("What the first document says:");
  expect(draft().body).not.toContain("What the second document says:");
  expect(draft().body).not.toContain("policy is silent");
});
it("maps documented unresolved exceptions without forcing compatible conditions into emails", () => {
  const f = context.report.findings[0];
  f.classification = "Different Applicable Conditions";
  f.rules[0].exceptions = ["A certificate may replace IELTS subject to approval."];
  expect(emailIssueType(f)).toBe("unclear_exception");
  expect(draft().body).toContain("documents an exception");
  expect(draft().body).toContain("conditions for the documented exception");
  f.unknowns = [];
  expect(emailIssueType(f)).toBeNull();
  expect(generate().mode).toBe("empty");
});
it("maps insufficient evidence with a documented exception to unclear exception", () => {
  const f = context.report.findings[0]; f.classification = "Insufficient Evidence";
  f.rules[0].exceptions = ["Certificate substitution"];
  expect(prepareEmailInput(context).findings[0].type).toBe("unclear_exception");
});
it("numbers multiple findings and counts the included findings accurately", () => {
  context.reviews = { certificate: "Accepted", score: "Accepted", pathway: "Accepted", identity: "Accepted" };
  expect(draft().subject).toBe("MSc Computing, September 2026: clarification needed on 2 admission requirements");
  expect(draft().body).toContain("1. English-medium certificates");
  expect(draft().body).toContain("2. Qualification equivalence");
  expect(draft().body).not.toContain("3. ");
  expect(draft().body).not.toContain("IELTS score requirements");
  expect(draft().body).not.toContain("Course entry and degree admission");
});
it("excludes uncertain findings by default", () => {
  context.reviews.identity = "Uncertain";
  expect(prepareEmailInput(context).include_uncertain).toBe(false);
  expect(draft().body).not.toContain("Qualification equivalence");
});
it("includes uncertain findings only on explicit opt-in, even without an acceptance", () => {
  context.reviews = { certificate: "Uncertain" }; context.includeUncertain = true;
  expect(draft().body).toContain("I may have misread this; please correct me if so.");
  expect(prepareEmailInput(context).findings[0].status).toBe("uncertain");
});
it.each(["Rejected", "Pending"] as const)("always excludes %s findings", review => {
  context.reviews = { certificate: review, identity: "Accepted" }; context.includeUncertain = true;
  expect(draft().body).not.toContain("English-medium certificates");
});
it("returns an empty state without eligible findings", () => {
  context.reviews = {}; expect(generate()).toEqual({ draft: null, diagnostics: [], mode: "empty" });
  context.reviews = { score: "Accepted", pathway: "Accepted" }; expect(generate().mode).toBe("empty");
});
it("excludes rules that do not apply to the applicant", () => {
  for (const rule of context.report.findings[0].rules) rule.scopeMatch = "does_not_match";
  expect(generate().mode).toBe("empty");
});
it("does not need any new model response or invent unknown intake/category/programme", () => {
  context.report.applicant.intake = context.report.applicant.category = "Not sure";
  context.report.applicant.program = "MSc AI";
  expect(draft().subject).toBe("MSc AI: Which requirement applies to English-medium certificates?");
  expect(draft().body).toContain("I am an applicant for MSc AI.");
  expect(draft().body).not.toContain("Not sure");
  context.report.applicant.program = "";
  expect(draft().subject).toBe("Which requirement applies to English-medium certificates?");
});
it("preserves exact multiline passages and does not change their words", () => {
  changeQuote("No waiver is automatic.\nAn MOI certificate may replace IELTS only with approval.\n");
  expect(draft().body).toContain("“No waiver is automatic.\nAn MOI certificate may replace IELTS only with approval.”");
});
it.each(["fabricated text", "An official certificate is always accepted."])("rejects altered or fabricated quotations: %s", text => {
  context.report.findings[0].rules[0].evidence[0].text = text;
  expect(generate().draft).toBeNull(); expect(generate().diagnostics).toContain("EMAIL_EVIDENCE");
});
it("rejects report-only verification flags without a matching source registry", () => {
  context.sources = []; expect(generate().draft).toBeNull();
});
it("rejects unverified evidence and cross-source or changed passage associations", () => {
  delete context.report.findings[0].rules[0].evidence[0].sourceVerified;
  expect(generate().draft).toBeNull();
  context.report.findings[0].rules[0].evidence[0].sourceVerified = true;
  context.report.findings[0].rules[0].evidence[0].sourceId = "B";
  expect(generate().draft).toBeNull();
});
it("validates exact substrings and ordered explicit ellipses without rewriting words", () => {
  const text = "Applicants must provide evidence and obtain approval before admission.";
  expect(exactQuotation("must provide evidence", text)).toBe(true);
  expect(exactQuotation("Applicants must […] obtain approval before admission.", text)).toBe(true);
  expect(exactQuotation("Applicants must [...] obtain approval before admission.", text)).toBe(true);
  expect(exactQuotation("obtain approval […] Applicants must", text)).toBe(false);
  expect(exactQuotation("Applicants may […] obtain approval", text)).toBe(false);
  expect(exactQuotation("Applicants must ... admission.", text)).toBe(false);
});
it.each(["Example University requires IELTS.", "Policy.pdf requires IELTS.", "Document A requires IELTS.", "Source B permits a waiver.", "S01 fixture requires IELTS.", "AI found an exemption.", "Gemini confirmed an exemption.", "Prepared for benchmark review: 2026", "RuleGuard says yes.", "Lines 1–8 require IELTS."])("fails closed when required evidence contains prohibited content: %s", text => {
  changeQuote(text); expect(generate().draft).toBeNull();
});
it("blocks institution names declared in source preparation headers", () => {
  context.sources[0].passages.push({ ...context.sources[0].passages[0], id: "header", text: "Institution: Example Academy" });
  changeQuote("Example Academy accepts certificates."); expect(generate().draft).toBeNull();
});
it.each(["[University name]", "[Your score]", "[Application reference number, if any]"])("rejects unapproved placeholder %s", placeholder => {
  invalid(d => { d.body += placeholder; });
});
it("accepts only the two approved generated placeholders", () => {
  expect(draft().body.match(/\[[^\]]+\]/g)).toEqual(["[Your full name]", "[if you have one]"]);
});
it("rejects unsupported applicant-context assertions even when they contain no banned word", () => {
  invalid(d => { d.body = d.body.replace("The problem:", "These policies both cover my programme and intake.\nThe problem:"); });
  invalid(d => { d.body = d.body.replace("I am an international applicant", "I have met every requirement and am an international applicant"); });
  invalid(d => { d.body = d.body.replace("Could you confirm", "I already qualify. Could you confirm"); });
});
it("rejects excluded findings, incorrect counts and wrong quotation order in supplied outputs", () => {
  invalid(d => { d.subject = "Clarification needed on 2 admission requirements"; });
  invalid(d => { d.body += "Qualification equivalence"; });
  invalid(d => { d.body = d.body.replace("What the first document says:", "My question:"); });
  invalid(d => { d.body = d.body.replace("An official certificate", "An altered certificate"); });
});
it("rejects input tampering, including source associations or selection", () => {
  const input = prepareEmailInput(context), value = renderEmail(input);
  input.findings[0].quotations[0].sourceId = "B";
  expect(validateClarificationEmail(value, input, context)).toBe("EMAIL_INPUT");
});
it("uses a revalidated deterministic fallback with privacy-safe diagnostics", () => {
  const result = generateClarificationEmail(context, () => ({ subject: "Unsafe.pdf", body: "AI found something" }));
  expect(result.mode).toBe("fallback"); expect(result.diagnostics).toEqual(["EMAIL_CONTENT"]);
  expect(result.draft!.body).toContain("available guidance gives different instructions");
  expect(validateClarificationEmail(result.draft!, prepareEmailInput(context), context)).toBeNull();
});
it("falls back on a renderer exception without logging its private message", () => {
  const result = generateClarificationEmail(context, () => { throw Error("private source text"); });
  expect(result.mode).toBe("fallback"); expect(result.diagnostics).toEqual(["EMAIL_STRUCTURE"]);
});
it("falls back for an unsafe topic but fails closed for unsafe applicant details", () => {
  context.report.findings[0].topic = "Document A";
  expect(generate().mode).toBe("fallback");
  context.report.applicant.program = "Example University programme";
  expect(generate().mode).toBe("failed"); expect(generate().draft).toBeNull();
  expect(generate().diagnostics).toEqual(["EMAIL_CONTENT", "EMAIL_CONTENT"]);
});
it.each(["applicant", "document", "degree"])("invalidates stale reports after a %s edit", () => {
  context.currentRevision++; expect(generate().draft).toBeNull(); expect(generate().diagnostics).toEqual(["EMAIL_STALE"]);
});
it("invalidates a previous draft after reviews or source snapshots change", () => {
  const input = prepareEmailInput(context), value = renderEmail(input);
  context.reviews.certificate = "Rejected";
  expect(validateClarificationEmail(value, input, context)).toBe("EMAIL_INPUT");
});
it("defines a strict Zod output schema", () => {
  expect(emailDraftSchema.safeParse(draft()).success).toBe(true);
  expect(emailDraftSchema.safeParse({ ...draft(), debug: "private" }).success).toBe(false);
});
it("retains the builder adapter with registry-backed input", () => {
  expect(buildClarificationEmail(context.report, context.reviews, false, context.sources)).toEqual(draft());
});
it("copies and encodes plain text with normal labels and no Markdown asterisks", () => {
  const value = draft(); expect(emailCopyText(value)).toBe(`Subject: ${value.subject}\n\n${value.body}`);
  const small = { subject: "MSc AI & requirements?", body: "The problem:\nA+B & 50%\nMy question:\nWhich applies?" };
  const url = new URL(emailMailto(small, "admissions+masters@example.edu").href!);
  expect(url.searchParams.get("body")).toBe(small.body); expect(url.searchParams.get("subject")).toBe(small.subject);
  expect(decodeURIComponent(url.pathname)).toBe("admissions+masters@example.edu");
  expect(emailMailto(small).href).toMatch(/^mailto:\?/);
  expect(emailCopyText(value)).not.toContain("**");
  expect(emailMailto(small, "a@example.edu\r\nBcc:someone@example.edu").reason).toBe("recipient");
  expect(emailMailto(small, "a@example.edu?bcc=b@example.edu").reason).toBe("recipient");
});
it("offers copy for long email bodies without truncation", () => {
  const value = { subject: "Long draft", body: "exact passage\n".repeat(1000) };
  expect(emailMailto(value)).toEqual({ href: null, reason: "length" });
  expect(emailCopyText(value)).toContain(value.body);
});

it("handles a non-language admission requirement without English-specific boilerplate", () => {
  context.report.findings[0].topic = "Application deposit";
  changeQuote("A deposit of 100 is required before enrolment.");
  changeQuote("A deposit of 200 is required before enrolment.", 1);
  expect(draft().body).toContain("A deposit of 100");
  expect(draft().body).toContain("A deposit of 200");
  expect(draft().body).toContain("regarding Application deposit?");
  expect(draft().body).not.toMatch(/English|IELTS|TOEFL/);
});
it("does not infer a permissive alternative from a prohibition", () => {
  changeQuote("All applicants must submit a test. No waiver is available.");
  changeQuote("A language test is required. There are no exemptions.", 1);
  expect(draft().body).not.toContain("documented alternative");
});
it("keeps long single subjects concise without inventing a policy answer", () => {
  context.report.findings[0].topic = "Which of the several requirements concerning the application deadline and deposit applies";
  expect(draft().subject).toBe("MSc Computing, September 2026: Which admission requirement applies?");
});
it("rejects an output quote assigned to the wrong finding even when it exists in another source", () => {
  invalid(value => { value.body = value.body.replace(context.sources[0].passages[2].text, context.sources[0].passages[1].text); });
});
it("does not remove operative conditions when preparation metadata is unsafe", () => {
  changeQuote("SYNTHETIC POLICY. This rule applies only to MSc Computing.\nApplicants must submit a test.");
  expect(generate().draft).toBeNull();
});

it.each(["S01-contradiction", "A-design-3", "finding-1", "RULE-A-001", "sourceVerified"])("rejects internal structured identifiers: %s", id => {
  if (id === "finding-1") context.report.findings[0].id = id;
  if (id === "RULE-A-001") context.report.findings[0].rules[0].id = id;
  changeQuote(`Applicants must follow ${id} before admission.`);
  expect(generate().draft).toBeNull();
});

it("omits only standalone preparation headings before the S01 operative rule", () => {
  for (const side of [0, 1]) {
    const original = context.report.findings[0].rules[side].evidence[0].text;
    changeQuote(`SYNTHETIC TEST DOCUMENT - NOT OFFICIAL UNIVERSITY GUIDANCE\nFictional institution: RuleGuard Example University\nFixture: S01-contradiction; Source: ${side ? 'B' : 'A'}\nPrepared for benchmark review: 2026-10-15\nScope: Master's in Artificial Intelligence; September 2026 intake; international applicants.\n\n${original}`, side);
  }
  expect(generate().mode).toBe("normal");
  expect(draft().body).not.toMatch(/Scope:|S01|synthetic|fictional|fixture|University|Prepared for/);
  expect(draft().body).toContain("The first guidance states: An official certificate");
});

it("does not promote an unsupported score in a model topic into email prose", () => {
  context.report.findings[0].topic = "IELTS 9.0 admission requirement";
  expect(generate().mode).toBe("fallback");
  expect(draft().subject + draft().body).not.toContain("9.0");
});
it("rejects demanding or threatening wording even in generated topic data", () => {
  context.report.findings[0].topic = "I demand an exemption or else legal action";
  expect(generate().mode).toBe("fallback");
  expect(draft().body).not.toContain("I demand");
});
