---
doc: scope
status: approved
---

# RuleGuard AI

## Admissions Comparison Expansion — 2026-10-26

This approved local change supersedes earlier English-only comparison boundaries and the deferral of other admissions requirement domains. The original English-language benchmark remains a historical demonstration, with its recorded failures unchanged. The current product scope is comparison across admissions requirements supported by two uploaded university documents for a selected Bachelor's or Master's degree, programme, intake and applicant category.

Analyze academic eligibility, GPA and prerequisites; English tests and exemptions; apostille, attestation, notarization and translations; transcripts and academic certificates; SOP, CV and recommendation letters; application deadlines and submission stages; application fees and relevant financial evidence; and any other supported admissions requirement. These examples are not a fixed category whitelist. Scholarship selection and unrelated policy advice remain outside this admissions scope.

Identify applicable sections before comparison. Preserve source-specific degree, programme, applicant category, intake, exception and submission-stage conditions. Application, conditional offer, enrolment and original-document verification can have compatible differences. Same-stage apostille required versus explicitly not required can be a potential contradiction; silence does not establish a waiver. Compare GPA scales and calculation bases without conversion; compare deadlines for the same intake and event, preserving stated time zones. Different institutional scopes must not be assumed to form a common contradictory policy. Decisive unknown selectors require Insufficient Evidence, with the precise missing information stated.

Retain Potential Contradiction, Different Applicable Conditions, Consistent and Insufficient Evidence, exact source-backed quotations, full-source inspection and human review. Accepted clarification-worthy findings and explicitly included Uncertain findings feed the improved deterministic email workflow. Compatible stage differences and consistent findings do not automatically become clarification issues.

The implementation retains one combined reasoning response, existing countTokens preflight, bounded retries/fallback, quota protection, file/page/text/token limits, strict schema, degree gates, citation reconstruction and session privacy. It adds no AI call, institution rule, canned result, persistence or paid dependency. The prompt hash invalidates prior synthetic-example cache entries automatically. Gemini usage remains 40; no live verification, deployment, publication, billing or Devpost submission is authorized by this change.

Offline fixtures verify extraction, transport, contracts, evidence identity, declared applicability safeguards, review and email behavior across these topics. Authored expected model outputs are not measured Gemini reasoning. Genuine broader extraction/classification, exception reconciliation, stage interpretation and completeness remain unverified. The backend checks references and structural consistency; it cannot independently prove semantic support or detect a stage mismatch that the model fails to disclose. Passage-sized quotations may include neighbouring requirements and produce long drafts; they retain exact source wording. Dense multi-topic output can hit the existing 8192-token limit and must fail as incomplete rather than silently truncate. No complete coverage, guaranteed accuracy or admissions eligibility is claimed.


## Approved Evidence-Backed Email Upgrade — 2026-10-26

This is an approved MVP requirement change to the existing clarification handoff. It supersedes earlier email eligibility and direct-mailto wording only. Degree-aware comparison, the approved light editorial theme, source safeguards, session privacy and unrelated approved requirements remain in force. No additional Gemini request, paid service, public deployment, repository publication or Devpost submission is authorized. Cumulative Gemini usage remains 40.

Evidence-backed clarification emails are an MVP deliverable: after reviewing findings, an applicant can prepare one professional, applicant-specific subject and complete editable body that explains the concern, presents exact available source quotations and asks a precise question for each eligible finding. This turns reviewed evidence into a useful request for a written admissions response. Drafts can address any admission-requirement topic already present in a validated report; this does not add a new comparison pipeline or extend the first English-language demonstration benchmark.

Only explicitly Accepted clarification-worthy findings qualify by default. Uncertain findings require explicit opt-in, which defaults off. Rejected, Pending, non-applicable, outdated, Consistent and compatible Different Applicable Conditions findings do not automatically qualify. An unresolved documented exception may qualify; a compatible difference alone does not. Show a helpful empty state when nothing qualifies.

Use a deterministic TypeScript builder and the existing report/source registry, without another model call. The output is one subject and body, using available programme/intake/category without invented facts. Verified quotations retain their wording; unavailable evidence is not fabricated. Institution names, uploaded filenames, internal references and preparation metadata are excluded from the email. Every generated draft and its simpler fallback must pass validation; otherwise show a recoverable failure. Keep the editable draft, copy and optional mail-app handoff, with no invented recipient and no automatic sending. Changes invalidate current export; edited drafts require deliberate replacement. All content stays in the active session.


## Approved Degree-Aware Revision — 2026-10-20

Approved controlled extension of the previously completed 5-build: support international Bachelor's / Undergraduate and Master's / Postgraduate applicants. This explicitly supersedes the Master's-only boundary and fixed degree selection; unrelated approved requirements remain unchanged. Local implementation and offline tests are authorized. No additional Gemini requests, billing changes, public deployment, repository publication, Devpost submission or 6-ship are authorized. Cumulative Gemini usage remains 40.

Select the degree explicitly before uploading two readable PDF/TXT documents; neither degree is preselected. Retain program, intake and applicant category. Examine the complete supported extracted content of both documents, not filenames, titles or isolated keywords. Display a separate preliminary applicability assessment for each source, with backend-reconstructed quotations and PDF page / TXT line references: applicable to selected degree, explicitly another degree, multiple degrees, general policy applicable to selected degree, or uncertain.

A clear, exclusively other-degree document with supporting references blocks comparison and requires replacement; acknowledgment cannot override it. Weak, ambiguous or conflicting mismatch evidence is uncertain. Mixed-degree documents are accepted only where the selected branch is supported; compare selected-degree rules and applicable general rules, conditions and exceptions only. Inventory other-degree rules for coverage, but do not include them in comparison findings. A genuinely general policy needs no degree-specific title. Never inherit rules across degrees or assume every postgraduate statement applies to every Master's program.

For uncertainty, show **Degree applicability could not be confirmed**, available evidence and missing information before revealing findings. Require an explicit acknowledgment and Continue action. Reuse the same validated response in session memory, without another AI call; mark the resulting preliminary report **Degree applicability unverified**. Scope, condition satisfaction and contradiction remain separate concepts. Unknown rule-degree scope yields Insufficient Evidence. Human review and acknowledgment do not certify correctness, completeness, official status, authenticity or publication currency.

Every degree or document edit invalidates the applicability decision, acknowledgment, previous comparison and related review decisions. Full extracted sources remain inspectable, without a guarantee of extraction fidelity. Preserve original quotes, four finding categories, dashboard totals for AI-identified findings only, Accept/Reject/Uncertain controls, clarification drafts, privacy/session handling, all upload limits, backend-only credentials and free-tier global quotas. Existing Master's-only samples remain labeled Master's; provide separately labeled Bachelor's samples rather than relabeling them.

Acceptance checks cover both matching degrees; opposite-only mismatches in either direction; mixed sections; general policy; uncertainty and explicit continuation; non-overridable mismatch; invalid/cross-source applicability references; stale degree edits; degree-specific conditions/exceptions; and retained Master's behavior. Offline tests verify implementation and guards, not live Gemini degree reasoning. The revised feature is not release-ready solely because offline tests pass; local UI review and separately authorized live validation remain outstanding.


Context-aware comparison of requirements across documents, with evidence and transparent uncertainty. English-language proficiency for international Bachelor's and Master's applicants is the first hackathon demonstration scenario.

## The Real-World Problem
International applicants must interpret requirements scattered across official websites, PDFs, and admission guidelines. Apparent conflicts and unclear exceptions can lead to costly application mistakes. They need to know what applies to them and what requires official confirmation.

## The Unique Kernel
Context-aware comparison of requirements across documents, with evidence-based explanations and transparency when the AI is uncertain. The system compares the requirements and applicable conditions found in the supplied documents. English-language proficiency is the first demonstration scenario; MOI versus IELTS/TOEFL is an example, not hardcoded product logic.

## Who It's For
An international student applying for a Bachelor's or Master's program who needs to understand English-language proficiency requirements, especially whether a Medium of Instruction (MOI) certificate is accepted or IELTS/TOEFL is required.

## The Core Loop
The applicant explicitly selects degree level, then uploads two relevant documents and provides basic context such as degree level, intended program, intake, and applicant category. RuleGuard AI extracts and compares requirements in that context, then presents a simple visual report with evidence and questions the applicant can send to the university.

Preliminary AI findings suggest agreements, potential contradictions, different applicable conditions, and requirements that cannot be verified. Users inspect cited evidence and the full extracted source text, then accept, reject, or mark each suggestion as uncertain. These review choices do not establish accuracy, applicant eligibility, or complete requirement coverage. The applicant leaves with clearer requirements and knows what needs official confirmation.

## Inspiration & Identity
I prioritize trust, clear evidence, and visible uncertainty. I want a simple visual report; further visual direction is not yet decided.

## Why This Matters to the Learner
The idea comes from my own international application experience: I encountered requirements spread across official sources and struggled to determine which rules applied to my situation. I want to help applicants avoid costly mistakes and make informed decisions. My goal is a competitive hackathon submission demonstrating useful, reliable AI, while learning to collaborate effectively with Codex and making the important product decisions myself.

## What "Working" Looks Like
One complete, reliable user journey demonstrating context-aware comparison through English-language proficiency requirements. MOI acceptance versus IELTS/TOEFL requirements is an illustrative comparison drawn from document evidence, not a fixed rule that automatically implies a contradiction.

In a one-minute demo, generate a clear visual report of preliminary AI suggestions requiring human review, showing the applicant's profile and the English-language requirement comparison. An explicit success criterion is recognizing when different requirements apply to different programs, intakes, or applicant categories and not incorrectly flagging those differences as contradictions.

Show exact evidence from both documents with verifiable references, explain the reasoning in simple language, and clearly highlight uncertainty. When one document accepts MOI and another requires IELTS, explain the apparent contradiction without automatically deciding which document is correct. Suggest a specific clarification question the applicant can send to the university.

Success means accurately identifying the issue, supporting it with verifiable references, and helping the applicant understand what to do next. The approved University of Waikato pair is the primary real-world benchmark candidate; labeled synthetic cases are retained and Trinity remains secondary. Provenance and page mappings are recorded in `spec.md > Approved Test Inputs and Provenance`.

A completed processing run does not mean all requirements were found. Human acceptance records a review choice, not proof that a finding is correct. Existing correctness expectations remain desired behavior and test criteria; the failed S06, S09 and Waikato pathway benchmark outcomes remain failures, not passes after this amendment. The narrower release claim is a functioning, evidence-traceable review workflow with disclosed AI limitations, not autonomous reliable coverage.

## Three Testable Demonstration Cases
These are planned input conditions and expected outcomes, not results from documents already analyzed. Select or prepare suitable document pairs before validation. All cases stay within the English-language demonstration scenario.

1. **Genuine contradiction:** Both documents explicitly apply to the same program, intake, and applicant category. One permits MOI instead of a language test; the other explicitly requires IELTS/TOEFL and rejects MOI as a substitute, with no stated exception reconciling them. **Pass:** flag a potential contradiction, cite both incompatible statements and their shared context, explain the conflict, and suggest a clarification question without choosing the authoritative document.
2. **Compatible requirements in different contexts:** Documents state different English-language requirements, but explicitly apply to different programs, intakes, or applicant categories. **Pass:** identify the different applicable conditions, cite their evidence, explain which applies to the supplied applicant context where supported, and do not flag a contradiction. Validate this criterion with variations covering each context dimension: program, intake, and applicant category.
3. **Missing or ambiguous evidence:** A readable document omits MOI eligibility or does not clearly identify the applicable program, intake, or applicant category. **Pass:** identify what cannot be verified, cite the available relevant evidence, make the missing information or ambiguity explicit, and suggest a targeted clarification question. Do not invent evidence or assert an unsupported contradiction or agreement.

## The POC Boundary
Demonstrate comparison across evidence-supported admissions requirements for Bachelor's and Master's applicants. English proficiency is one retained example. Use two official documents and applicant context covering program, intake, and applicant category. MOI acceptance versus IELTS/TOEFL requirements is an example to compare using the document evidence, not hardcoded product logic. Present exact supporting evidence and distinguish potential contradictions from differences in applicable conditions. The original demonstration cases validate the English example; the October 26 offline suite extends contract checks across other admissions topics.

Accept two uploaded documents in PDF or TXT format. PDFs must contain readable text. Extract text while preserving source references, including page numbers for PDFs. If a document cannot be read, show a clear error rather than generate unreliable results. Prioritize accurate AI comparison and evidence-based explanations over broad format support.

Include an in-session full extracted-text view and per-finding review choices. Keep the Bachelor's/Master's selection, two documents and all format boundaries. Compare admissions topics supported by the evidence. Do not add a manual rules editor, document annotation platform or report history.

## Later
Scholarship selection can be considered after the hackathon. Evidence-supported admissions topics are included by the October 26 expansion.

Scanned PDFs, images, Word documents, and website URLs are future enhancements; they are excluded from this proof of concept to keep document support focused.

## Explicitly Cut
A large platform with many incomplete features: the proof of concept demonstrates one complete, reliable journey for this hackathon.

Automatically deciding which conflicting document is correct: provide evidence, explanation, and a clarification question for official confirmation.

## Open Decisions
The approved University of Waikato pair is the primary real-world benchmark candidate; labeled synthetic cases are retained and Trinity remains secondary. Provenance and page mappings are recorded in `spec.md > Approved Test Inputs and Provenance`.

## Approval & Handoff
Original approval and handoff (2026-10-14): scope approved and `2-scope` complete; `3-prd` and coding were deferred at that time. Subsequent PRD/spec approvals and the October 20 approved degree-aware revision govern current local implementation.

Human-review amendment approved on 2026-10-19: [approved amendment](human-review-amendment.md). This records approval of the amendment separately from the original document approval. At that amendment handoff, the technical specification remained DRAFT and implementation was not yet authorized. Final 4-spec approval and local 5-build authorization followed on October 20; additional Gemini calls and public deployment still require separate approval.
