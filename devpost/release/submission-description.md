# RuleGuard AI — submission copy for owner review

Prepared at the owner's explicit request. Review for accuracy before pasting; this
file has not been posted or submitted. Do not describe prepared or mocked behavior
as a successful hosted/live test. Personal reflections and exit-survey answers
remain yours to supply. Adapt field placement to the actual signed-in Devpost form.

## Project name

RuleGuard AI

## Short description

Compare university admissions documents, inspect source-backed findings, and draft
focused clarification emails while keeping human review central.

## Problem and target users

International Bachelor's and Master's applicants often need to reconcile admissions
requirements spread across multiple documents. A difference may be a real conflict,
an exception, a different submission stage, or a rule for another applicant group.
Misreading that context can lead to unnecessary documents, expenses or missed steps.
RuleGuard AI helps applicants inspect the evidence and ask admissions staff a more
precise question.

## What it does

Applicants select a degree and enter a program, intake and applicant category, then
provide two readable PDF or TXT documents. The application extracts the supported
full text and proposes degree applicability and admissions comparisons. Topics can
include academic prerequisites, English requirements, document attestation,
transcripts, references, deadlines and fees when supported by the uploaded sources.

Findings distinguish Consistent, Potential Contradiction, Different Applicable
Conditions and Insufficient Evidence. A backend verifier reconstructs quotations
from registered passages and checks source references and structural consistency.
Users can inspect the complete extracted sources, then Accept, Reject or mark
findings Uncertain. Supported exclusive degree mismatches block comparison;
uncertain applicability requires acknowledgment.

Accepted clarification-worthy findings feed one editable email with the concern,
available exact quotations and a focused question for each issue. Uncertain
findings require explicit inclusion. Drafting is deterministic and uses no extra
AI request. Users can copy the draft or open their own mail app; nothing sends
automatically.

## Technical architecture

The application uses Next.js App Router, React and TypeScript. A Node.js route
validates uploads, parses text PDFs with PDF.js, registers passages, and streams
progress and extracted sources over NDJSON. The server calls Google Gemini for a
token-count preflight and one combined structured reasoning response on a normal
successful attempt. Zod validates the response shape; the evidence layer checks
references, reconstructs quotations and applies declared applicability safeguards.

Upstash Redis atomically reserves concurrency, request, generation and input-token
allowances before provider dispatch. Bounded retries and optional fallback share
one time budget. Browser inputs, reports and reviews remain in session memory.
Ordinary uploads are not persisted by the app; only exact built-in synthetic
examples qualify for a temporary verified-result cache. Google processes the
extracted input under its separate terms. The prepared hosting target is Vercel
Hobby with Node 24 and Fluid Compute; public deployment is not yet verified.

## What has actually been demonstrated

Offline tests exercise the current application UI, real PDF/TXT extraction,
evidence validation, degree gates, review state, retries/quota failures and email
drafting. Multi-topic admissions tests use clearly labeled synthetic documents
and authored model-response fixtures. These establish software behavior, not
Gemini reasoning accuracy.

Earlier development included a genuine single-generation synthetic English-rule
smoke test with a rendered, source-traceable report. Its reasoning quality was
partial. The broader admissions prompt and subsequent degree changes have not
received new live model validation. Cumulative Gemini usage remains 40. The demo
must label any offline fixture playback and any historical footage accordingly.

## Limitations

This is a preliminary human-review proof of concept, not an admissions decision or
official university service. Exact citations do not prove correct interpretation,
complete extraction, document authenticity, policy currency or eligibility. The
model can miss conditions, group clauses incorrectly or misread submission stages;
previous benchmark failures remain disclosed. GPA scales are not automatically
converted, and silence is not treated as an exemption.

There is no OCR; supported PDFs must contain readable text. Each file is limited
to 2 MB and 15 PDF pages, the pair to 60,000 extracted characters and the complete
input to 20,000 tokens. Oversized/incomplete analysis fails rather than silently
truncating. Free-tier quotas can make analysis unavailable. Use public or synthetic
documents and nonsensitive applicant context only. Confirm important questions
with the university.

## Required Devpost Learn Skill Pack explanation

The Devpost Learn Skill Pack structured development from idea to release preparation.
The 1-start workflow recorded the initial idea and collaboration preferences;
2-scope narrowed the proof of concept; 3-prd defined the applicant journey, evidence
review and failure states; and 4-spec mapped those behaviors to components, data
contracts and deployment constraints. The approved scope.md, prd.md and spec.md are
included under devpost/ in the repository.

The 5-build workflow organized implementation and offline verification into working
slices, with recorded reviews and an app map. Investigation of a failed genuine
smoke test led to clearer evidence diagnostics and regression tests. The 6-ship
workflow guided release checks, repository preparation and submission requirements.
The owner directed the scope and accepted revisions; Codex assisted implementation,
testing and release preparation. No unrecorded personal learning outcome is claimed.

## Before submitting

- Confirm or edit the wording above; add your own learning reflection and exit survey.
- Put the **public GitHub repository URL in Devpost's Try it out field**, not only
  inside the description. Planning documents and a detected open-source LICENSE
  must be visible in that repository.
- Supply a public YouTube/Vimeo video link with a video **under three minutes**.
- Answer the separate Skill Pack question and personally complete the
  **age-of-majority checkbox** truthfully; do not delegate that attestation.
- Add a hosted URL only if separately approved, deployed and tested; it is optional.
- Review every required field in the actual signed-in form. No publication,
  deployment, video upload or Devpost submission has been performed by this draft.

Requirements checked October 26, 2026:
[official rules](https://learn-ai-basics.devpost.com/rules) and
[organizer's submission-form update](https://learn-ai-basics.devpost.com/updates/46821-two-new-questions-on-the-submission-form).
