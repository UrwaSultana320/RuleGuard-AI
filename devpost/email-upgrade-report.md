# Professional clarification email upgrade — development report

Approved local requirement change, October 26, 2026. Ready for project-owner visual and functional review after the final checks recorded below; this is not public-release approval.

## Previous implementation

The existing shared TypeScript builder was deterministic, not a Gemini response or second model call. It hardcoded English-language phrasing, generated an email automatically after acceptance, included accepted Consistent findings, required an acceptance even for uncertainty opt-in, emitted original filenames, line/page references and internal document labels, used unapproved placeholders, and remounted the editor when reviews changed, discarding edits. The new work changes this existing feature. The Gemini comparison pipeline, source verifier, degree-aware behavior, light editorial theme and pre-existing unrelated working-tree changes are preserved.

## Result and review handling

Click Draft Clarification Email to generate one professional subject/body for all selected clarification issues. Accepted findings qualify only when their category and applicability require clarification. Rejected and Pending never qualify. Uncertain is excluded by default and included only with explicit opt-in; an uncertain-only request is supported. Consistent and compatible Different Applicable Conditions findings are excluded. Different conditions qualify as unclear_exception only with a documented permissive exception plus an unresolved condition and existing question. Insufficient Evidence maps to missing_information or a documented unclear_exception; Potential Contradiction maps to contradiction. Exclude other-degree, wholly non-applicable, blocked and stale report content.

Known programme/intake/category are used without invented facts; MSc AI remains intact. Multiple findings have numbered sections and an accurate subject count. The problem precedes exact available quotations, followed by one topic-specific question. A more permissive alternative is mentioned only where positive source language supports one; prohibitions are not exceptions. Unknown numeric claims in model topic headings trigger conservative fallback. A missing-information finding can use one source; a contradiction requires two source positions. There is no fake second quotation. Normal/fallback outputs use the required greeting, uncertainty sentence, written-reply request and two approved placeholders.

Both subject and body editors grow to display their complete contents at mobile widths. The preview bolds only the four labels. Textareas, clipboard and mailto stay plain text. Optional recipients begin empty. Long mailto URLs disable that action and retain full copy. Changed reviews, uncertainty inclusion, applicant/degree/documents or evidence prevent current export. Edited drafts require deliberate replacement; the previous draft remains read-only when stale while the composer is mounted. Navigating away unmounts the composer and clears its draft; no cross-navigation draft persistence was added. Nothing is automatically sent.

## Validation and safe failure

- Strict Zod output schema: only subject/body, nonempty, subject bounded to 240 characters.
- Reconstruct eligible findings/input against current report identity, revision, reviews, source snapshots and opt-in; reject input tampering or excluded findings.
- Require backend sourceVerified markers and matching rule/source/passage identity, full text, page and line metadata. A report-only flag without a matching registry does not suffice.
- Validate exact quotation substrings and finding/source association. Ordered explicit omission segments are supported by the verifier; the builder emits contiguous quotations without generated ellipses. Literal source ellipses remain literal. Altered/reordered/fabricated quotations fail.
- Remove only contiguous standalone preparation headers, including a non-operative preparation scope heading. Preserve operative conditions and negations and never rewrite quotation words. Full source/evidence displays remain unchanged.
- Check problem-before-evidence, one deterministic question, correct subject counts/numbering, exact introduction/closing, uncertainty notice and approved placeholders. Source-derived/closed templates prevent arbitrary model prose from adding claims of matching applicant scope or qualification.
- Reject institution wording, known names from preparation headers, source filenames, fixture/test identifiers, structured internal IDs, tool/debug/confidence language, unsafe URLs, unapproved placeholders, Markdown markers and threatening wording. Do not blindly ban AI in legitimate programme names.
- On normal failure use a simpler deterministic fallback with the same evidence and revalidate identically. If input evidence cannot support even a safe fallback, or fallback validation fails, return no draft and show a recoverable message. No unsafe generated output is displayed/exported.
- Record only fixed diagnostic categories: EMAIL_STALE, EMAIL_INPUT, EMAIL_CONTENT, EMAIL_STRUCTURE, EMAIL_EVIDENCE. No private fields, documents, quotations, credentials or exception messages are logged.

The original backend evidence-verification and comparison guards are unchanged. The historical frozen S01 response predates sourceVerified markers and correctly fails email drafting; that test now expects the fail-closed message. Saved historical content was not upgraded, reclassified or edited. The current S01 replay extracts real bundled sources and uses the real backend buildReport verifier with offline model output to verify the new subject/body.

## Documentation updated

- README.md
- devpost/scope.md
- devpost/scope.html
- devpost/prd.md
- devpost/prd.html
- devpost/spec.md
- devpost/spec.html
- devpost/checklist.md
- devpost/app-map.html
- devpost/human-review-amendment.md
- devpost/human-review-amendment.html
- devpost/email-upgrade-report.md (this report)

The scope makes evidence-backed emails an MVP deliverable; the PRD specifies the complete journey, output, selection, empty/failure states and acceptance checks; the specification records input/output, Zod, provenance, rendering, fallback, diagnostics and privacy. All three canonical HTML articles match their Markdown, and their existing CSS/scripts are byte-for-byte preserved. Dated historical requirements are retained with explicit email supersession notes. No submission write-up or existing changelog was present. Release notes follow the repository's specification/checklist convention. Existing benchmark records and unrelated evidence displays retain their source labels.

## Verification

Node 24.19.0, offline only:

- **217/217 Vitest unit/integration tests passed**, 16 files, 0 failures and 0 skipped. This repository runs unit and integration cases together; there is no separate integration runner or invented independent integration total. The count includes **60 email regressions**, 4 evidence-route tests, 13 example-cache-route tests, 2 deployment/streaming tests and 15 mixed core tests; the remaining cases exercise degree, evidence diagnostics, source encoding, UI, cache, provider errors/retries and upload security.
- **27/27 Playwright browser tests passed**, 0 failures and 0 skipped, against the actual local production build at 127.0.0.1:3007. All provider outputs are offline interceptions; real extraction paths run with credentials explicitly empty. Current S01 and optional historical/PDF tests ran.
- **Typecheck, lint and production build passed.** The existing Vitest/Vite future-config warning and Playwright NO_COLOR/FORCE_COLOR warning are non-fatal; no configuration/dependency refactor was introduced.
- **PDF release trace passed:** 534 files, 56,774,707 bytes. Hosted Linux behavior remains unverified.
- **Client-secret check passed:** 19 client/static HTML artifacts, no server key names or configured secret values found.
- **3/3 Markdown/HTML companion synchronizations passed**; original companion CSS/scripts unchanged.
- Targeted responsive/keyboard checks passed at 320, 375, 768, 1366 and 1920 px; retained tests also exercise 390 px. No horizontal overflow was found in those states. Desktop/mobile screenshots were visually inspected; a clipped mobile subject was corrected with automatic height fitting and a browser regression before final verification.


Initial verification found one obsolete unit assertion (Email ready wording) and two browser expectations (old viewport behavior; old frozen S01 email availability). These were corrected without modifying frozen data or weakening current evidence checks. Additional source review added regressions for preparation-scope headings, structured IDs, unsupported numeric topic claims and threatening text. Final status is recorded above; initial failed attempts are not represented as passes.

Screenshots generated from offline design data: test-results/email-review-{320,375,768,1366,1920}.png and test-results/email-composer-{375,1366}.png (automated element captures). Clean review captures are [mobile](../test-results/email-composer-review-375.png) and [desktop](../test-results/email-composer-review-1366.png). The S01 offline current-verifier replay also updates live-example-email-full.png and live-example-email-viewport.png. The clean captures suppress only the already offscreen skip link to avoid a Chrome element-capture artifact; runtime geometry confirmed that link is unfocused and above the visible viewport. These are ignored local development artifacts, not production accuracy evidence. Viewports exercise 320–1920 px; native keyboard controls, touch target heights, no horizontal overflow and plain text exports are tested. Existing editorial contrast/focus and degree-gate checks remain in the browser suite. This is targeted accessibility verification, not complete accessibility certification.

## Remaining limitations and boundaries

Exact source matching does not certify semantic entailment, policy authenticity/currency, complete extraction, accurate topic classification or full requirement coverage. The conservative builder avoids importing AI explanation/question prose as factual email assertions. Keyword/registry checks catch institutional wording and names identified in preparation headers, but arbitrary unmarked proper names cannot be universally recognized from the current source contract. This is an unresolved limit of institution-name detection, not a claim of a general semantic/named-entity verifier. Unsafe required passages may block drafting rather than yield a rewritten quotation. Long evidence is preserved and can exceed the approximate word target or mailto limit. Manual user edits are outside the generated-draft validator's provenance guarantee and must be reviewed before sending. Draft edits are not retained after navigating away from the composer.

No new live reasoning/provider validation was performed. Existing benchmark failures, accepted tooling advisory and hosted-only/Linux/access/quota/availability checks remain as previously documented; this work does not certify release readiness. No new services, billing, public deployment, publication, submission, repository push or email sending occurred. No Gemini API request was made; cumulative usage remains **40**. Local review runs on http://127.0.0.1:3007/ with Gemini/Redis credentials explicitly empty. Historical enable flags alone are not used as a current API block. No additional feature development is authorized.

## Generated examples — SYNTHETIC TEST DATA

The following examples were generated and validated by the actual builder from offline test data. This description belongs to this development report, never to the email subject/body. They are not real admissions guidance.

### One accepted contradiction

```text
Subject: MSc Computing, September 2026: Which requirement applies to English-medium certificates?

Dear Admissions Team,

I am an international applicant for MSc Computing, September 2026 intake.
I would appreciate clarification of the following admission requirement before planning my application.

The problem:
The first guidance states: An official certificate of three completed years of English-taught study may replace IELTS, subject to admissions approval.
The second guidance states: An English-medium instruction certificate cannot replace IELTS for this programme.

What the first document says:
“An official certificate of three completed years of English-taught study may replace IELTS, subject to admissions approval.”

What the second document says:
“An English-medium instruction certificate cannot replace IELTS for this programme. No waiver is available under this rule.”

My question:
Could you confirm which requirement applies to my application regarding English-medium certificates, including the conditions for any documented alternative?

I would be grateful for a written reply, as I will plan my application around your answer.

Kind regards,
[Your full name]
Application reference: [if you have one]
```

### Two accepted findings

```text
Subject: MSc Computing, September 2026: clarification needed on 2 admission requirements

Dear Admissions Team,

I am an international applicant for MSc Computing, September 2026 intake.
I would appreciate clarification of the following admission requirements before planning my application.

1. English-medium certificates

The problem:
The first guidance states: An official certificate of three completed years of English-taught study may replace IELTS, subject to admissions approval.
The second guidance states: An English-medium instruction certificate cannot replace IELTS for this programme.

What the first document says:
“An official certificate of three completed years of English-taught study may replace IELTS, subject to admissions approval.”

What the second document says:
“An English-medium instruction certificate cannot replace IELTS for this programme. No waiver is available under this rule.”

My question:
Could you confirm which requirement applies to my application regarding English-medium certificates, including the conditions for any documented alternative?

2. Qualification equivalence

The problem:
The available evidence does not establish all the requirements or conditions for Qualification equivalence. I would appreciate confirmation of the applicable requirement.

What the first document says:
“Academic English course entry requires IELTS 5.5. Course entry is conditional and does not itself satisfy Master's admission requirements.”

What the second document says:
“Completion and the required final grade of an Academic English qualification must be confirmed by admissions. This guide does not identify equivalent certificate names.”

My question:
Could you confirm which requirement applies to my application regarding Qualification equivalence?

I would be grateful for a written reply, as I will plan my application around your answer.

Kind regards,
[Your full name]
Application reference: [if you have one]
```
