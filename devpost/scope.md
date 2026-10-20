---
doc: scope
status: approved
---

# RuleGuard AI

Context-aware comparison of requirements across documents, with evidence and transparent uncertainty. English-language proficiency for international Master's applicants is the first hackathon demonstration scenario.

## The Real-World Problem
International applicants must interpret requirements scattered across official websites, PDFs, and admission guidelines. Apparent conflicts and unclear exceptions can lead to costly application mistakes. They need to know what applies to them and what requires official confirmation.

## The Unique Kernel
Context-aware comparison of requirements across documents, with evidence-based explanations and transparency when the AI is uncertain. The system compares the requirements and applicable conditions found in the supplied documents. English-language proficiency is the first demonstration scenario; MOI versus IELTS/TOEFL is an example, not hardcoded product logic.

## Who It's For
An international student applying for a Master's program who needs to understand English-language proficiency requirements, especially whether a Medium of Instruction (MOI) certificate is accepted or IELTS/TOEFL is required.

## The Core Loop
The applicant uploads two relevant documents and provides basic context such as degree level, intended program, intake, and applicant category. RuleGuard AI extracts and compares requirements in that context, then presents a simple visual report with evidence and questions the applicant can send to the university.

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
Demonstrate the core comparison capability through one narrow scenario: English-language proficiency requirements for international Master's applicants. Use two official documents and applicant context covering program, intake, and applicant category. MOI acceptance versus IELTS/TOEFL requirements is an example to compare using the document evidence, not hardcoded product logic. Present exact supporting evidence and distinguish potential contradictions from differences in applicable conditions. The three demonstration cases validate this same journey; they do not add other requirement domains to the MVP.

Accept two uploaded documents in PDF or TXT format. PDFs must contain readable text. Extract text while preserving source references, including page numbers for PDFs. If a document cannot be read, show a clear error rather than generate unreliable results. Prioritize accurate AI comparison and evidence-based explanations over broad format support.

Include an in-session full extracted-text view and per-finding review choices. Keep the existing narrow English-language Master's comparison scenario, two documents, and all format boundaries. Do not add a manual rules editor, document annotation platform, report history or additional requirement domains.

## Later
Additional types of admission and scholarship requirements can be considered after the hackathon.

Scanned PDFs, images, Word documents, and website URLs are future enhancements; they are excluded from this proof of concept to keep document support focused.

## Explicitly Cut
A large platform with many incomplete features: the proof of concept demonstrates one complete, reliable journey for this hackathon.

Automatically deciding which conflicting document is correct: provide evidence, explanation, and a clarification question for official confirmation.

## Open Decisions
The approved University of Waikato pair is the primary real-world benchmark candidate; labeled synthetic cases are retained and Trinity remains secondary. Provenance and page mappings are recorded in `spec.md > Approved Test Inputs and Provenance`.

## Approval & Handoff
I approved this scope on 2026-10-14. The official Devpost Learn `2-scope` stage is complete. I will begin `3-prd` in a new Codex chat; do not start it or coding in this chat.

Human-review amendment approved on 2026-10-19: [approved amendment](human-review-amendment.md). This records approval of the amendment separately from the original document approval. The technical specification remains DRAFT; no additional Gemini requests, application development, 5-build or deployment are authorized.
