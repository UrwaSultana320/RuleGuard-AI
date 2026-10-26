# Demonstration script — target 2 minutes 45 seconds

Record the actual app window. Hide environment files, provider dashboards, terminals
containing credentials, notifications and personal applicant information. Use no
unlicensed music or university logos. Public YouTube/Vimeo upload requires the
owner's action/approval and is not done. Rehearse to remain below three minutes.

## Choose the truthful recording mode

No new Gemini request is authorized. For a recording today without new requests,
use the existing offline admissions browser-test harness (`tests/e2e/admissions.spec.ts`)
against the real local application. It extracts the synthetic samples and passes
authored model output through the real evidence verifier, then operates the real UI.
The test intercepts the comparison endpoint: it does not demonstrate a fresh model
generation or actual hosted transport. Keep a visible recording caption throughout:
**Synthetic test documents · offline model-response fixture · actual application UI**.
Capture the flow at its normal pace using local recording tooling; do not replace
the production application with canned runtime results. The existing test is also
a precise click/review guide; recording footage itself has not been prepared.

If separate API approval later permits a fresh successful comparison, use genuine
results instead, update the caption to **Synthetic test documents · live AI analysis**,
and account for all count/retry/fallback calls. Do not present the old English-only
smoke screenshot as current multi-topic admissions validation.

## 0:00–0:20 — problem and audience

Screen: RuleGuard AI input page, degree and applicant-context fields visible.

Narration: “University applicants often face requirements spread across documents.
RuleGuard AI helps Bachelor's and Master's applicants compare those requirements,
inspect the evidence, and ask admissions staff a focused clarification question.”

## 0:20–0:45 — context and document provenance

Screen: select Master's; show Computing, September 2026 and International applicant.
Show `admissions-A.txt` and `admissions-B.txt` in the offline admissions harness flow,
their synthetic labels and the privacy notice. Do not substitute the built-in English
example and imply that it contains the multi-topic admissions pair.

Narration: “These are fictional test documents, not real university guidance. They
include GPA, apostille, deadline and supporting-document examples. This recording
uses an offline model-response fixture in the actual application. Real AI analysis
requires separately configured services and sends extracted text to Google.”

## 0:45–1:25 — applicability, findings and source verification

Screen: the test opens the results dashboard. Show degree applicability, the
apostille-at-application and GPA findings, then inspect the cited text and full
extracted sources. Show the compatible submission-stage difference separately.

Narration: “The selected degree and applicant context shape the comparison. A
supported exclusive degree mismatch blocks comparison; uncertain applicability
requires acknowledgment. Here I can inspect the exact source quotations. Different
submission stages may explain different requirements. Verified references establish
where wording came from; they do not prove the AI interpreted it correctly.”

## 1:25–2:05 — human review and useful handoff

Screen: Accept the apostille and GPA issues; mark the missing recommendation issue
Uncertain. Draft Clarification Email, then explicitly include uncertain findings
and regenerate. Show the concern, exact quotations and question. Show editable text
and Copy email. Do not click Send or use a real recipient.

Narration: “I decide which findings deserve clarification. One editable email
collects accepted issues with their evidence and a precise question. Uncertain
issues stay out unless I explicitly include them. Drafting uses no additional
model call. I review the wording before copying it or opening my own mail app.”

## 2:05–2:30 — architecture and limits

Screen: stay on the actual application; show full-source view and uncertainty text.

Narration: “Next.js and TypeScript power the app, PDF.js reads text PDFs, Gemini
proposes a structured comparison, and backend checks reconstruct citations. Upstash
enforces shared quotas before provider calls. This proof of concept has no OCR and
does not guarantee complete or correct policy reasoning. Confirm important answers
with the university. Real official PDFs have separate provenance and copyright;
the synthetic conflict shown here is not a claim about any institution.”

## 2:30–2:45 — Skill Pack and close

Screen: briefly show repository planning files locally, then return to the app.

Narration: “The Devpost Learn Skill Pack guided the scope, product requirements,
technical spec, tested build steps and release checks. RuleGuard AI turns scattered
requirements into inspectable evidence and a practical clarification request.”

## Recording checks

- Keep disclosures readable and cuts honest. Do not relabel fixtures as live AI.
- If demonstrating real PDFs separately, name their official origin, show actual
  extraction only unless live comparison was approved, and make no invented conflict.
- If the form requests personal reflections, provide your own words separately.
- Verify the uploaded public video works while signed out; record its URL only then.
- A script or test video is not a completed submission demo; the owner must record,
  review and publish an accurate demonstration of the working proof of concept.
