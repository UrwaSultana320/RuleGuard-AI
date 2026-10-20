---
doc: scope
status: approved
---

# RuleGuard AI

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
Demonstrate the core comparison capability through one narrow scenario: English-language proficiency requirements for international Bachelor's and Master's applicants. Use two official documents and applicant context covering program, intake, and applicant category. MOI acceptance versus IELTS/TOEFL requirements is an example to compare using the document evidence, not hardcoded product logic. Present exact supporting evidence and distinguish potential contradictions from differences in applicable conditions. The three demonstration cases validate this same journey; they do not add other requirement domains to the MVP.

Accept two uploaded documents in PDF or TXT format. PDFs must contain readable text. Extract text while preserving source references, including page numbers for PDFs. If a document cannot be read, show a clear error rather than generate unreliable results. Prioritize accurate AI comparison and evidence-based explanations over broad format support.

Include an in-session full extracted-text view and per-finding review choices. Keep the existing narrow English-language Bachelor's/Master's comparison scenario, two documents, and all format boundaries. Do not add a manual rules editor, document annotation platform, report history or additional requirement domains.

## Later
Additional types of admission and scholarship requirements can be considered after the hackathon.

Scanned PDFs, images, Word documents, and website URLs are future enhancements; they are excluded from this proof of concept to keep document support focused.

## Explicitly Cut
A large platform with many incomplete features: the proof of concept demonstrates one complete, reliable journey for this hackathon.

Automatically deciding which conflicting document is correct: provide evidence, explanation, and a clarification question for official confirmation.

## Open Decisions
The approved University of Waikato pair is the primary real-world benchmark candidate; labeled synthetic cases are retained and Trinity remains secondary. Provenance and page mappings are recorded in `spec.md > Approved Test Inputs and Provenance`.

## Approval & Handoff
Original approval and handoff (2026-10-14): scope approved and `2-scope` complete; `3-prd` and coding were deferred at that time. Subsequent PRD/spec approvals and the October 20 approved degree-aware revision govern current local implementation.

Human-review amendment approved on 2026-10-19: [approved amendment](human-review-amendment.md). This records approval of the amendment separately from the original document approval. At that amendment handoff, the technical specification remained DRAFT and implementation was not yet authorized. Final 4-spec approval and local 5-build authorization followed on October 20; additional Gemini calls and public deployment still require separate approval.
