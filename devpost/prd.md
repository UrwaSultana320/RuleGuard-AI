---
doc: prd
status: approved
---

# RuleGuard AI — Product Requirements

## Approved Degree-Aware Revision — 2026-10-20

Approved controlled extension of the previously completed 5-build: support international Bachelor's / Undergraduate and Master's / Postgraduate applicants. This explicitly supersedes the Master's-only boundary and fixed degree selection; unrelated approved requirements remain unchanged. Local implementation and offline tests are authorized. No additional Gemini requests, billing changes, public deployment, repository publication, Devpost submission or 6-ship are authorized. Cumulative Gemini usage remains 40.

Select the degree explicitly before uploading two readable PDF/TXT documents; neither degree is preselected. Retain program, intake and applicant category. Examine the complete supported extracted content of both documents, not filenames, titles or isolated keywords. Display a separate preliminary applicability assessment for each source, with backend-reconstructed quotations and PDF page / TXT line references: applicable to selected degree, explicitly another degree, multiple degrees, general policy applicable to selected degree, or uncertain.

A clear, exclusively other-degree document with supporting references blocks comparison and requires replacement; acknowledgment cannot override it. Weak, ambiguous or conflicting mismatch evidence is uncertain. Mixed-degree documents are accepted only where the selected branch is supported; compare selected-degree rules and applicable general rules, conditions and exceptions only. Inventory other-degree rules for coverage, but do not include them in comparison findings. A genuinely general policy needs no degree-specific title. Never inherit rules across degrees or assume every postgraduate statement applies to every Master's program.

For uncertainty, show **Degree applicability could not be confirmed**, available evidence and missing information before revealing findings. Require an explicit acknowledgment and Continue action. Reuse the same validated response in session memory, without another AI call; mark the resulting preliminary report **Degree applicability unverified**. Scope, condition satisfaction and contradiction remain separate concepts. Unknown rule-degree scope yields Insufficient Evidence. Human review and acknowledgment do not certify correctness, completeness, official status, authenticity or publication currency.

Every degree or document edit invalidates the applicability decision, acknowledgment, previous comparison and related review decisions. Full extracted sources remain inspectable, without a guarantee of extraction fidelity. Preserve original quotes, four finding categories, dashboard totals for AI-identified findings only, Accept/Reject/Uncertain controls, clarification drafts, privacy/session handling, all upload limits, backend-only credentials and free-tier global quotas. Existing Master's-only samples remain labeled Master's; provide separately labeled Bachelor's samples rather than relabeling them.

Acceptance checks cover both matching degrees; opposite-only mismatches in either direction; mixed sections; general policy; uncertainty and explicit continuation; non-overridable mismatch; invalid/cross-source applicability references; stale degree edits; degree-specific conditions/exceptions; and retained Master's behavior. Offline tests verify implementation and guards, not live Gemini degree reasoning. The revised feature is not release-ready solely because offline tests pass; local UI review and separately authorized live validation remain outstanding.


Context-aware comparison of English-language proficiency requirements for international Bachelor's and Master's applicants, supported by verifiable evidence and visible uncertainty.

Final product definition, approved by the learner on 2026-10-14. Markdown is canonical; `prd.html` is its offline visual review companion. All consequential product choices below come from the approved scope or the learner interview. The official Devpost Learn `3-prd` stage is complete. Its original handoff deferred `4-spec` and coding; final spec approval and local build authorization followed on October 20. The approved degree-aware revision above governs this controlled local extension.

## The Core Journey

Source: `scope.md > The Core Loop` and `The POC Boundary`.

1. Open the first screen and explicitly select degree level before uploading documents; retain branding, purpose, applicant context, and **Compare Requirements**.
2. Explicitly select Bachelor's / Undergraduate or Master's / Postgraduate first, then upload documents and provide intended program. Supply intake and applicant category or choose **Not sure**.
3. Select **Compare Requirements**. Validate required inputs and both documents, showing helpful inline messages for problems.
4. Watch the five actual analysis stages. Prevent duplicate requests while processing.
5. After complete processing, display both document applicability assessments first. Block an exclusive supported mismatch; require explicit acknowledgment and continuation for uncertainty. After the gate, open the dedicated dashboard with the applicant profile, explained AI-suggested totals, and four preliminary finding categories requiring human review; this does not establish complete requirement coverage.
6. Expand a preliminary finding and select **View Evidence** to inspect verified source excerpts and context-aware reasoning. Inspect either complete extracted source, including uncited passages, and accept, reject or mark the suggestion uncertain without implying independently verified correctness.
7. For potential contradictions or insufficient evidence that are not Rejected, review a preliminary clarification question, copy it or the email text, or open an editable draft in the default email application; review its assertions before use.
8. Return to inputs without restarting. Changing a document or context immediately marks the previous report **Outdated — Reanalysis Required**.
9. Explicitly select **Run Comparison Again**. Retain the outdated report through processing or failure; replace it only when reanalysis succeeds.

Before comparison, validate required applicant fields and both uploaded documents using helpful inline messages. On errors, preserve inputs within the active browser session and offer document replacement or analysis retry as appropriate. Never present incomplete analysis as a completed comparison.

## Screens and Layout

### First Screen

Source: `scope.md > The Core Loop`. Learner decision recorded on 2026-10-14.

- A clean header with the RuleGuard AI logo and branding.
- A visually appealing hero with a compelling headline explaining the purpose.
- A short description emphasizing AI-powered requirement comparison, verifiable evidence, and transparency.
- Two elegant document upload cards: side by side on desktop and stacked on mobile. Accept PDF and TXT, subject to the approved readable-text PDF boundary.
- An integrated applicant information section for degree level, intended program, intake, and applicant category.
- A prominent **Compare Requirements** button.
- A subtle three-stage progress indicator: **Select Degree → Upload and Context → Applicability and Comparison**. This is the overall journey indicator, distinct from the five processing stages. No clickable wizard or additional screen is required by this decision.

### Results Dashboard

Source: `scope.md > What "Working" Looks Like` and `The Core Loop`. Learner decision recorded on 2026-10-14.

A visually impressive but easy-to-understand dashboard displays preliminary AI findings, with a persistent report notice and a preliminary label on every finding:

“AI suggestions — human review required. Findings may be incorrect or incomplete. Check conditions and exceptions in the full extracted sources. Accepting a finding does not confirm accuracy or admissions eligibility.”

The dashboard displays:

- **AI-suggested requirements compared:** Consistent + Potential Contradictions + Different Applicable Conditions.
- **AI-suggested unresolved findings:** Topics classified as Insufficient Evidence.
- **AI-suggested topics assessed:** AI-suggested requirements compared + AI-suggested unresolved findings.
- Consistent requirements.
- Potential contradictions.
- Requirements applying to different contexts.
- Missing or insufficient evidence.
- Exact supporting references from both documents where evidence is available; omissions remain explicit and are never filled with invented references.
- AI-generated explanations and suggested clarification questions.

Use distinct but restrained visual indicators for finding categories. Potential contradictions must be immediately noticeable. Do not display document similarity percentages or an overall AI-generated accuracy score. At the top, show the applicant profile and elegant summary cards for the four finding categories. Potential contradictions receive the most visual attention. Below the summary, display expandable finding cards. Each includes a requirement name, classification, short understandable explanation, visual status indicator, and **View Evidence** action.

Selecting a finding opens an expanded evidence section with both document excerpts side by side. Each excerpt identifies its source document and page number when available. Highlight relevant statements and explain why they agree, conflict, or apply to different applicant contexts. Only display quotations and references verified against the uploaded documents. The counting rules are defined below. Evidence cards appear side by side when space permits and stack on narrower screens, as defined under Responsive Layout and Accessibility.

Each displayed suggestion starts **Pending review** and has **Accept**, **Reject**, **Mark uncertain**, and a way to return to Pending review. These are user review choices, independent of the four system classifications; accepting Insufficient Evidence cannot change it to Consistent, waive missing evidence, alter quotations/page references or override validation. Rejected suggestions remain visible and clearly labeled rather than deleted. Acceptance never establishes accuracy, eligibility or complete coverage.

The three totals count all displayed, validated AI suggestions, including rejected suggestions; they do not measure complete source coverage or human agreement. Review choices do not change category totals. Show a compact Pending / Accepted / Uncertain / Rejected review summary whose counts sum to all displayed suggestions, separate from category counts and without accuracy or completeness scores.

## Look and Feel

Source: `scope.md > Inspiration & Identity`, expanded by learner decisions on 2026-10-14.

- Premium, modern SaaS presentation: professional, trustworthy, and visually distinctive.
- Sophisticated dark navy theme with subtle violet and cyan accents.
- Visual inspiration from modern SaaS applications such as Linear, while retaining RuleGuard AI's own identity. This is a learner-supplied reference, not a researched design specification.
- Elegant typography, balanced spacing, refined cards, subtle gradients, soft borders, and tasteful icons.
- Smooth, minimal animations and responsive interactions.
- Avoid excessive visual effects, clutter, and a generic chatbot appearance.
- Prioritize accessibility, readability, intuitive navigation, clear loading states, helpful errors, and mobile responsiveness.
- Visual design enhances the approved comparison journey without adding product scope.

Exact typeface, branding artwork, and component details remain presentation details for later specification within this agreed visual direction; this PRD does not prescribe them.

## Features and Behavior

### Document Input and Applicant Context

Source: `scope.md > The POC Boundary` and `The Core Loop`.

Accept two uploaded documents in PDF or TXT format. PDFs must contain readable text. Collect only context needed for reliable comparison:

- **Degree level:** Required explicit Bachelor's / Undergraduate or Master's / Postgraduate selection, with no preselection.
- **Intended program:** Required.
- **Intake:** Allow **Not sure**.
- **Applicant category:** Allow **Not sure**.

Validate required fields and both uploaded documents before comparison. Show helpful inline validation messages attached to the relevant input, rather than generic errors. If a document cannot be read, identify the failed document, explain the reason when known, and allow replacement of only that document while retaining the other document and applicant context.

When intake or applicant category is unknown, compare using the available context. Never invent missing applicant details or assume a requirement applies. Clearly identify findings whose applicability cannot be determined. If missing information prevents a reliable conclusion, classify the finding as **Insufficient Evidence** and explain which applicant detail is needed.

The demonstration remains English-language requirements for international Bachelor's and Master's applicants. These rules develop `scope.md > The Core Loop` and `Three Testable Demonstration Cases`, with learner decisions recorded on 2026-10-14.

### Context-Aware Comparison

Source: `scope.md > The Unique Kernel` and `Three Testable Demonstration Cases`.

Compare document requirements in the supplied context. MOI versus IELTS/TOEFL is an evidence-led example, not a hardcoded conflict rule. Distinguish potential contradictions from compatible requirements applying to different programs, intakes, or applicant categories. Explain missing or ambiguous evidence without unsupported conclusions.

All conclusions from this comparison are preliminary suggestions requiring human review. Display the report/finding labels defined under Results Dashboard; a completed run does not establish that all relevant requirements, conditions or exceptions were identified.

### Empty Results

Source: `scope.md > The Unique Kernel`, `The POC Boundary`, and the learner's final review decisions.

When both documents are readable and processing completes but the AI identifies no relevant topics, show **AI suggested no relevant requirement topics. Review the full extracted sources; relevant requirements may have been missed.** This is neither an unreadable-file error nor proof that no relevant requirements exist, and it is not a meaningful completed comparison.

Show zero AI-suggested topics assessed, zero AI-suggested requirements compared, and zero AI-suggested unresolved findings for this outcome, with a clear explanation. Do not manufacture requirement topics, evidence, clarification questions, or findings to fill the dashboard, and do not present the absence of AI-identified topics as agreement. Allow users to return to their retained inputs, replace documents, and explicitly run the comparison again. If a previous report exists, the current outcome must not imply that its old findings apply to these inputs; retain the existing outdated-report rules.

This state differs from a relevant topic with missing evidence: an identified relevant topic that cannot reliably be compared remains **Insufficient Evidence**, not an empty result. It also differs from failure or partial analysis, which keep their existing error/incomplete labels and retry actions.

### Evidence Verification and Unsupported Output

Source: `scope.md > What "Working" Looks Like` and `Three Testable Demonstration Cases`, strengthened by the learner's final review decisions.

Before presenting any AI-generated quotation or source reference as evidence, verify it against the extracted uploaded document. Verification covers the quotation text, source identity, and cited location, including PDF page numbers. A matching quotation with an incorrect source or page reference does not pass verification.

Reject any quotation or reference that cannot be verified, or visibly mark it **Unsupported** outside verified evidence. Never display fabricated quotations as supporting evidence, including with an unsupported badge. Unsupported output must not be used to establish agreement, contradiction, or applicability. Where the remaining verified evidence cannot support a reliable comparison, classify the relevant topic as **Insufficient Evidence**, explaining the missing support. Preserve verified evidence that is available; do not invent a replacement citation or silently treat unsupported content as verified.

### Document Privacy Explanation

Source: `scope.md > Inspiration & Identity` and the learner's final review decisions.

Provide a clear, user-facing explanation available before document processing. Explain what document content is processed, where processing occurs, how documents/extracted content are handled temporarily, and whether an external AI provider receives document content. If content is sent externally, accurately describe the content sent and the provider used. Explain actual retention/deletion behavior and distinguish active-browser-session input preservation from any server or provider handling.

The decisions recorded in `spec.md` are backend PDF/TXT processing and genuine Gemini analysis of public/synthetic documents with nonsensitive context only; backend-only credentials; active-session browser memory for inputs, full extracted sources, reports and review choices; no permanent application content storage or content logging. Before submission, disclose Google's separate Free Tier processing, retention/data-use terms and possible human review, the refresh/close loss of work, and RuleGuard AI's unofficial admissions status. Redis holds temporary quota metadata only. The notice must match these decisions and must not promise local-only processing, immediate physical erasure or provider deletion. No application-user accounts or permanent document storage are added.

### Responsive Layout and Accessibility

Learner decisions recorded on 2026-10-14, developing the approved simple visual report and trust/readability priorities in `scope.md > Inspiration & Identity` and `What "Working" Looks Like`.

The entire application must adapt across mobile, tablet, laptop, and desktop: landing/first screen, uploads, applicant forms, navigation, analysis progress, results dashboard, finding cards, and clarification questions. Layout, typography, cards, and controls adapt to available width while retaining dark navy, violet, and cyan styling. Buttons and inputs must be comfortable for touch interaction. Maintain accessible color contrast and visible keyboard focus states.

On mobile and narrower screens, stack Document A and Document B evidence cards vertically. Each card shows its document name, page number when available, and exact supporting excerpt with relevant text highlighted. Place the AI explanation below both cards. Allow long excerpts to expand and collapse. Avoid tiny text and horizontal scrolling.

On desktop and tablets with sufficient space, show evidence cards side by side with consistent alignment, spacing, and readability; switch automatically to stacked cards when space becomes insufficient.

Mandatory acceptance criteria during development:

- Verify the complete journey at representative viewport widths of **375px (mobile), 768px (tablet), 1366px (laptop), and 1920px (desktop)**.
- At each width, all listed application surfaces remain functional, readable, and visually consistent, with no overlapping components, clipped content, or unwanted horizontal scrolling.
- Evidence uses stacked cards at narrow widths and side-by-side cards only when sufficient space is available. Source names, available page numbers, highlighted excerpts, and the explanation remain readable.
- Long excerpts expand and collapse without breaking the layout.
- Buttons and inputs remain comfortable for touchscreen users; interactive controls expose visible keyboard focus states; text and category indicators maintain accessible contrast.

### Finding Classification and Dashboard Counts

Learner decisions recorded on 2026-10-14, developing `scope.md > The Core Loop`, `What "Working" Looks Like`, and `Three Testable Demonstration Cases`.

- One comparison represents one distinct requirement topic or condition identified across the two documents. Mentions of the same minimum IELTS score topic in both documents count as one comparison, not two. Distinct topics such as IELTS minimum score and MOI acceptance may count separately.
- Each finding belongs to exactly one dashboard category; do not double count.
- If statements appear contradictory but applicability to the applicant is unclear, classify the finding as **Insufficient Evidence**. Explain that a contradiction may exist but cannot yet be established for this applicant.
- Classify a finding as **Potential Contradiction** only when both statements clearly apply to the same applicant context and cannot reasonably be reconciled. Do not select the authoritative document.
- Missing or unverified requirements must not be represented as confirmed comparisons; report them as unresolved findings.
- Display clear explanations of how dashboard totals are calculated. Do not use similarity percentages or unsupported confidence scores.

The learner resolved the headline counting decision as follows:

1. **AI-suggested requirements compared = Consistent + Potential Contradictions + Different Applicable Conditions.**
2. **AI-suggested unresolved findings = topics classified as Insufficient Evidence.** These have been assessed but could not be reliably compared; exclude them from AI-suggested requirements compared.
3. **AI-suggested topics assessed = AI-suggested requirements compared + AI-suggested unresolved findings.**
4. Every distinct requirement topic has exactly one primary classification, preventing double counting.
5. Explain these metrics clearly in the dashboard.

Observable acceptance criteria: the three classified comparison counts sum to AI-suggested requirements compared; Insufficient Evidence equals AI-suggested unresolved findings; adding the compared and unresolved totals produces AI-suggested topics assessed. No topic contributes to more than one primary category. No similarity percentages or unsupported AI confidence scores appear.

### Evidence and Next Steps

Source: `scope.md > What "Working" Looks Like`.

Provide exact supporting evidence, verifiable references, PDF page numbers, simple explanations, visible uncertainty, and targeted questions the applicant can send to the university. Do not automatically decide which conflicting document is correct. Findings are expandable cards with a **View Evidence** action. The expanded evidence section presents verified document excerpts side by side, identifies their source and available page number, highlights relevant statements, and explains their relationship to the applicant context. Missing evidence remains explicitly absent rather than fabricated. Suggested clarification questions appear for potential contradictions or uncertain findings. Each clarification question has a **Copy Question** button and a **Draft Email** button. Explain briefly which conflicting or uncertain requirements it addresses and reference the relevant documents. **Draft Email** opens the user's default email application with a prefilled subject and message that the user can review and edit before sending. No university email address is required. Users can also copy the email text when an address is unavailable.

The generated question is clear and professional. The email is polite and concise, explains uncertainty without claiming that the university made a mistake, and does not fabricate references when evidence is missing. Do not automatically send email or integrate Gmail/Outlook APIs.

Observable acceptance criteria: potential-contradiction and insufficient-evidence findings whose review choice is not Rejected offer the question, explanation, relevant document references, **Copy Question**, and **Draft Email**; copying produces the displayed question; drafting opens an editable subject/message in the default email application without requiring a recipient; email text remains available to copy. No action automatically sends a message. These interaction decisions were supplied by the learner on 2026-10-14.

Extend **View Evidence** with **View full extracted source** for either document, including passages the AI did not cite. Display all extracted text in canonical page order with filenames, PDF page indexes or TXT line spans and passage identifiers; cited passages link to their locations. Long text may scroll or expand but must not be omitted. This view does not guarantee original PDF layout, complete extraction or extraction accuracy; known unreliable extraction still triggers the existing error/Insufficient Evidence rules.

Clarification and email assertions are preliminary; users must review them before use. Disable finding-specific copy/draft actions while its review choice is Rejected; changing that choice restores the original eligible actions for Potential Contradiction and Insufficient Evidence only. No extra AI call, new draft category or email integration is added.

### Analysis Progress

Learner decision recorded on 2026-10-14, developing `scope.md > The Core Loop`.

Show a polished, smooth loading screen with these meaningful stages:

1. Reading uploaded documents.
2. Extracting requirements.
3. Checking applicant-specific conditions.
4. Comparing requirements.
5. Preparing the evidence-based report.

Stage changes must reflect actual processing. Do not simulate progress with fake stage animations. Show both document applicability assessments when analysis completes; open the dedicated results dashboard only after the gate and explicit continuation, retaining the established visual theme.

### Error Recovery and Incomplete Analysis

Learner decisions recorded on 2026-10-14, developing `scope.md > The POC Boundary` and its clear-error requirement.

Unreadable uploads identify the affected document and the cause when known. Users can replace only that document, preserving the unaffected upload and applicant information. Analysis failures explain that comparison could not be completed and provide **Retry Analysis** while retaining both uploads and context. Prevent duplicate analysis requests while processing.

If partial results exist, visibly label them as incomplete, never treat them as a completed comparison, and allow retry. Do not fabricate findings. Keep error messages nontechnical, with an optional technical details section and clear recovery actions.

### Revise and Compare Again

Learner decision recorded on 2026-10-14, developing `scope.md > The Core Loop`.

Allow users to return to their uploaded documents, modify applicant information, and run the comparison again without restarting the application. Preserve the uploaded documents for this in-application return journey. Allow replacement of a problematic document without discarding the other document or applicant information. Preserve inputs during errors and retries within the active browser session. Accounts and permanent document storage are not required. No cross-session persistence is promised.

### Outdated Reports and Reanalysis

Learner decisions recorded on 2026-10-14, developing `scope.md > The Core Loop`.

Changing either uploaded document or any applicant context field after viewing results immediately marks the previous report **Outdated — Reanalysis Required**. Keep its findings visible for reference, but clearly identify the report and findings as outdated; they must not appear current or verified for the revised inputs. Display a prominent **Run Comparison Again** button.

Do not automatically rerun analysis when inputs change; the learner wants to avoid unnecessary processing and API usage. When the user requests reanalysis, show actual processing progress and retain the previous report with its outdated warning until the new analysis completes successfully. If reanalysis fails, preserve the outdated report, documents, and applicant context, and allow retry. Only successful reanalysis replaces the previous report with updated findings. Partial or failed reanalysis does not replace the previous report with a current-looking result.

Observable acceptance criteria:

- Changing a document or context field immediately displays **Outdated — Reanalysis Required** on the retained report and makes **Run Comparison Again** prominent.
- Editing inputs alone does not start analysis.
- Starting reanalysis shows actual analysis progress while the old report retains its outdated status.
- Failed reanalysis leaves the old report visibly outdated and retains inputs for retry.
- Successful reanalysis replaces the previous report with findings for the revised inputs.

Review choices stay with their report in active-session memory across navigation, errors and retries. Input changes mark both report and review choices **Outdated — Reanalysis Required**. Failed reanalysis retains that outdated work; a successful new analysis starts new suggestions at Pending review without transferring old acceptance. Refresh/close clears files, context, extracted sources, results and review choices.

## States and Boundaries

- **Empty results:** When readable documents yield no AI-identified relevant topics after completed processing, show **AI suggested no relevant requirement topics. Review the full extracted sources; relevant requirements may have been missed.** and explained zero metrics; do not invent findings, imply agreement or certify absence. Preserve inputs and full extracted sources and provide a path to revise and explicitly compare again.
- **Unsupported evidence:** Reject unverifiable quotations/references or clearly mark unsupported output outside verified evidence. Fabricated quotations never appear as supporting evidence. If verified support is inadequate for an identified topic, classify it as **Insufficient Evidence**.
- **Privacy disclosure:** Before processing, make accurate information about document processing, temporary handling, external AI transfers, and actual retention/deletion available. Technical details remain for `4-spec`.
- **First use:** Show the confirmed first-screen layout, two upload cards indicating PDF/TXT support, and the context fields. No findings are presented before analysis. Exact instructional copy is a presentation detail, not an additional feature.
- **Analysis:** Show the five confirmed processing stages, reflecting actual work, with a smooth loading presentation. Transition automatically to the dedicated dashboard on completion. Prevent duplicate analysis requests while processing. If analysis fails, preserve both documents and context and provide **Retry Analysis**.
- **Unreadable document:** Identify which document failed. Explain the reason when known, such as a scanned PDF, corrupted file, unsupported format, or empty document. Allow replacement of only the problematic document, preserving the other document and all applicant information.
- **Analysis failure:** Clearly explain that the comparison could not be completed. Offer **Retry Analysis**, retaining both uploaded documents and applicant context. Never fabricate findings or mark incomplete analysis as successful.
- **Partial analysis:** If part of the analysis succeeds, clearly label the results as incomplete and offer retry. Do not present them as a complete comparison. Partial results are a conditional failure state, not an additional required analysis capability.
- **Recovery presentation:** Use clear, nontechnical messages with an optional technical details section, visible retry or replacement actions, and the established dark navy design.
- **Outdated report:** Any document or applicant-context change immediately marks the previous report **Outdated — Reanalysis Required**. Retain it for reference through reanalysis and failure, without presenting it as current or verified for revised inputs. Offer **Run Comparison Again**; replace it only after successful reanalysis.
- **Active session:** Preserve inputs during errors and retries within the active browser session. Accounts and permanent document storage are not required.
- **Missing or ambiguous evidence:** Explicitly identify what cannot be verified; do not invent evidence or assert an unsupported agreement or contradiction.
- **Unknown applicant context:** Intake and applicant category may be **Not sure**. Continue with available information; where missing context prevents a reliable conclusion, label the finding **Insufficient Evidence** and name the applicant detail needed. Never invent details or assume applicability.
- **Incomplete required inputs:** Validate explicit degree selection, intended program, and both documents before comparison. Present helpful inline messages rather than generic errors.
- **Accessibility and responsive layout:** Apply the Responsive Layout and Accessibility criteria throughout the application, including readable evidence, comfortable touch controls, accessible contrast, visible keyboard focus, and checks at 375px, 768px, 1366px, and 1920px.

## Key Acceptance Criteria

These are requirements for later development validation, not claims that the application has been implemented or tested.

### Input and Context Validation

- With either document absent, an unsupported/unreadable document, or intended program missing, comparison does not begin and the affected input has a helpful inline message.
- Degree level requires explicit Bachelor's / Undergraduate or Master's / Postgraduate selection, with no preselection. **Not sure** is accepted for intake and applicant category without blocking an otherwise valid comparison.
- Unknown context is not invented. A finding needing that context is **Insufficient Evidence**, names the missing detail, and does not assert applicability or an established contradiction.

### Analysis and Results

- With two valid documents and required context, a single comparison request displays the five specified stages based on actual processing; repeated activation during processing does not create duplicate requests.
- Successful analysis followed by the applicability gate and explicit continuation opens a dedicated dashboard showing the applicant profile, three explained metrics, all four categories, and expandable finding cards with name, classification, explanation, status indicator, and **View Evidence**.
- Every distinct topic has one primary classification. The dashboard satisfies the metric equations under **Finding Classification and Dashboard Counts**.
- Contradictions are visually prominent but categories remain readable through labels as well as restrained visual indicators. Similarity percentages, overall accuracy scores, and unsupported confidence scores are absent.

### Verifiable Evidence

- Every displayed quotation matches the uploaded source text, and its reference leads the reader to the relevant source location. PDFs include the correct page number; TXT references identify the document and relevant excerpt without inventing PDF pages.
- A finding with evidence in both sources displays both excerpts, source names, relevant highlights, and a plain-language explanation of agreement, conflict, or context differences.
- If a source has no supporting evidence, the report explicitly says what is missing instead of inventing a second quotation or reference.
- Narrow layouts stack the evidence cards with the explanation below both; long excerpts expand and collapse. Wider layouts use side-by-side cards when space permits.

### Recovery and Report Validity

- An unreadable upload identifies the failed document and known reason. Replacing it preserves the unaffected document and every applicant field.
- Analysis failure shows a clear nontechnical message and **Retry Analysis**, retaining both uploads and context. Technical details may be expanded when available.
- Any partial analysis is visibly incomplete, permits retry, and is never presented as a complete comparison or used to replace an old report as current.
- Document/context changes immediately mark retained findings **Outdated — Reanalysis Required** and offer **Run Comparison Again**, without automatically requesting analysis.
- During reanalysis and after failure, the previous report remains visibly outdated. Success replaces it with updated findings. Inputs survive errors/retries within the active browser session.

### Clarification Handoff

- Potential Contradiction and Insufficient Evidence findings whose review choice is not Rejected include a professional question, a short issue explanation, and relevant available document references.
- **Copy Question** copies the displayed question; email text is also available to copy without a recipient address.
- **Draft Email** opens the default email application with an editable, polite, concise subject/message explaining uncertainty without accusing the university of a mistake. No recipient is required and nothing is sent automatically.

### Responsive and Accessible Journey

- Verify all first-screen, navigation, upload, form, progress, dashboard, findings, evidence, error, outdated-report, and clarification states at **375px, 768px, 1366px, and 1920px**.
- All controls remain functional and readable; there are no overlaps, clipped content, tiny text, or unwanted horizontal scrolling. Touch controls are comfortable; keyboard focus is visible; color contrast is accessible.
- The dark navy theme with violet/cyan accents remains visually consistent. Animations stay smooth and minimal; visual effects do not obscure content or state.

### Empty Results, Verification, and Privacy

- With two readable documents, completed processing and no AI-identified relevant topics, show **AI suggested no relevant requirement topics. Review the full extracted sources; relevant requirements may have been missed.** and zero assessed/compared/unresolved metrics. No invented finding, agreement, quotation, clarification question or certified absence appears. Inputs and full extracted sources remain available for review, revision and explicit rerun.
- A relevant topic with missing support is still **Insufficient Evidence**; processing failure or partial output is still failed/incomplete. These outcomes are not mislabeled as empty success.
- Given an AI-generated quotation absent from the extracted document, reject it; it never appears as supporting evidence. Given an unverifiable source identity or page reference, reject it or mark it **Unsupported** outside verified evidence; it contributes no support to a conclusion.
- If an unsupported quotation/reference leaves an identified topic without sufficient verified evidence, the topic is **Insufficient Evidence** and the explanation identifies the evidence limitation. Any remaining verified excerpts remain correctly attributed.
- Before processing documents, the user can read a plain-language explanation of actual processing, temporary handling, external-provider transfers, and retention/deletion. Validate the notice against the final `4-spec` and implemented data flow, including whether document content reaches an external AI provider. No unsupported local-only, deletion, or retention claim is shown.

### Human Review and Full Extracted Sources

- Every finding is preliminary and starts Pending review; Accept, Reject, Mark uncertain and return-to-Pending change only the review choice, without requests or evidence/classification overrides.
- Rejected suggestions remain visible, keep their AI category count contribution and disable finding-specific clarification actions; restoring a review choice restores only originally eligible actions.
- Review-summary counts sum to displayed suggestions; the three category equations remain unchanged and do not imply complete source coverage or human agreement.
- All extracted passages/pages, including uncited ones, are accessible with source/page or TXT line references. No extraction-fidelity guarantee is displayed.
- Navigation/errors/retries retain review choices and extracted sources; edited inputs mark old review choices outdated, successful reanalysis resets new choices to Pending, and refresh/close clears all work.
- Human acceptance never becomes an accuracy, official approval or completeness badge; invalid or unsupported evidence cannot be accepted into supporting evidence.

### Approved Demonstration Cases

Source: `scope.md > Three Testable Demonstration Cases` and `What "Working" Looks Like`.

1. **Genuine contradiction:** Use documents explicitly applying to the same program, intake, and applicant category, with one permitting MOI and the other requiring IELTS/TOEFL while rejecting MOI, with no reconciling exception. Pass: **Potential Contradiction**, both incompatible statements and shared-context evidence, a plain explanation, and a clarification question; no authoritative-document selection.
2. **Different applicable conditions:** Use documents with different requirements explicitly applying to different contexts. Validate separate variations for **program, intake, and applicant category**. Pass: **Different Applicable Conditions**, evidence identifying the differing conditions, an explanation of which requirement applies to the supplied context where supported, and no false contradiction.
3. **Missing/ambiguous evidence:** Use readable documents omitting MOI eligibility or failing to identify relevant applicability. Pass: **Insufficient Evidence**, available relevant evidence, an explicit missing-information explanation, and a targeted question; no invented quotations, applicability, agreement, or contradiction.
4. **One-minute demonstration:** Show the complete English-language comparison journey, applicant profile, clear report, verifiable evidence, uncertainty, and useful next action. This is a demo presentation criterion, not a promised analysis latency.

## Product Decisions

- Use a polished document intelligence identity, with dark navy and restrained violet/cyan accents, to communicate professionalism and trust.
- Take inspiration from Linear and modern SaaS interfaces while preserving a distinct RuleGuard AI identity.
- Put purpose, document input, applicant context, and the comparison action on the first screen to keep the journey intuitive.
- Arrange upload cards side by side on desktop and stacked on mobile.
- Use the three-stage progress indicator with the learner's specified labels.
- Display dashboard totals and the four finding categories alongside verifiable evidence, explanations, and clarification questions.
- Make potential contradictions immediately noticeable using restrained category indicators.
- Exclude similarity percentages, an overall AI-generated accuracy score, and unsupported confidence scores.
- Show actual processing through five meaningful analysis stages; do not fake progress.
- Show document applicability assessments first; after the gate and explicit continuation, open a dedicated results dashboard with applicant profile and finding summary cards at the top.
- Use expandable finding cards and side-by-side verified evidence, with relevant statements highlighted and plain-language explanations.
- Display clarification questions for potential contradictions or uncertain findings.
- Support returning to retained uploads, editing applicant context, and comparing again within the application.
- Require explicit Bachelor's / Undergraduate or Master's / Postgraduate selection with no preselection; require intended program; allow **Not sure** for intake and applicant category.
- Compare with available context, explicitly mark unresolved applicability, and classify findings as **Insufficient Evidence** when missing context prevents a reliable conclusion. Identify the needed detail without making assumptions.
- Validate required fields and both documents before comparison using helpful inline messages.
- Preserve progress during errors and retries within the active browser session, without accounts or permanent document storage.
- Identify unreadable documents and known causes, and allow replacement of only the affected upload.
- Provide **Retry Analysis** after failure, retaining both documents and context; prevent duplicate requests during processing.
- Clearly label any partial analysis as incomplete and offer retry. Never fabricate findings or report incomplete analysis as successful.
- Use nontechnical error messages with an optional technical details section and visible recovery actions.
- Count distinct requirement topics or conditions once across the document pair; assign each finding exactly one category.
- Use **Insufficient Evidence** when unclear applicability prevents establishing an apparent contradiction for the applicant.
- Reserve **Potential Contradiction** for irreconcilable statements that clearly share the applicant context.
- Exclude Insufficient Evidence from **AI-suggested requirements compared**; show it as **AI-suggested unresolved findings**. Show **AI-suggested topics assessed** as the sum of compared and unresolved topics, and clearly explain all three metrics.
- Immediately mark reports outdated after input changes; retain them for reference and offer explicit reanalysis. Do not rerun automatically, to avoid unnecessary processing and API usage.
- Keep the previous report outdated during reanalysis and after failure; replace it only when the new comparison succeeds.
- Provide **Copy Question** and **Draft Email** for potential contradictions and insufficient evidence, with a brief issue explanation and relevant document references.
- Open a polite, concise, editable email draft in the user's default email application with subject and message, without requiring a university address. Allow copying email text as well.
- Never automatically send email; exclude Gmail/Outlook API integrations from the MVP.
- Stack evidence cards on mobile/narrow screens, place the explanation below both, and support expanding or collapsing long excerpts. Use side-by-side cards only when space permits.
- Require responsive behavior across every application surface with comfortable touch controls, accessible contrast, visible keyboard focus, and no overlaps, clipping, tiny text, or unwanted horizontal scrolling.
- Make verification at 375px, 768px, 1366px, and 1920px mandatory development acceptance criteria.
- Prioritize accessibility, readability, loading/error clarity, and responsive behavior without expanding the approved POC.

- On completed processing with no relevant topics, show a distinct empty-results state without fabricated findings or an implied meaningful comparison.
- Verify all AI-generated quotations and source references against extracted documents; reject unverifiable evidence or clearly separate unsupported output from verified evidence.
- Explain actual document processing, temporary handling, and external AI transfers to users before processing; technical handling is recorded in `spec.md` and must be accurately reflected before processing.

## What We're Building

Source: `scope.md > The POC Boundary`.

One complete comparison journey for two official documents and applicant context, demonstrating English-language proficiency requirements. Validate genuine contradiction, different applicable conditions, and missing or ambiguous evidence using the approved demonstration cases, including program, intake, and applicant-category variations.

## Deferred From the POC

Source: `scope.md > Later` and `The POC Boundary`.

Additional admission and scholarship requirement domains, scanned PDFs, images, Word documents, and website URLs remain deferred to keep the proof of concept focused.

User accounts and permanent document storage are excluded from the MVP: preserving inputs during the active browser session is sufficient, per the learner decision.

Gmail/Outlook API integrations are excluded; clarification uses copying and the default email application to keep the handoff simple.

## Non-Goals

Source: `scope.md > Explicitly Cut`, plus learner decisions.

- A large platform with many incomplete features.
- Automatically selecting the correct document when requirements conflict.
- Document similarity percentages, an overall AI-generated accuracy score, or unsupported confidence scores.
- Fake processing-stage progress.
- Automatically sending emails or requiring university email addresses.

## Open Questions

No product-defining interview question remains open. Privacy and temporary-handling decisions are recorded in `spec.md > Privacy and Input Eligibility Gate` and `Data Model and Lifetime`; accurately reflect them in the notice before processing. This does not claim that production handling has been tested.

The approved University of Waikato pair is the primary real-world benchmark candidate; labeled synthetic cases are retained and Trinity remains secondary. Provenance and page mappings are recorded in `spec.md > Approved Test Inputs and Provenance`. These are test inputs, not a new product feature; selection does not imply passing model results.

## Scope Cross-Check

Reviewed against the approved `scope.md` on 2026-10-14.

- **The Unique Kernel / The POC Boundary:** Preserved. Comparison remains context-aware and evidence-led within English-language requirements for international Bachelor's and Master's applicants. MOI versus IELTS/TOEFL is illustrative, not hardcoded.
- **The Core Loop:** Preserved and made concrete through two uploads, applicant context, actual processing stages, a dedicated report, evidence review, and clarification handoff.
- **What "Working" Looks Like:** Preserved through PDF page references, exact evidence, uncertainty, no automatic authority decision, and the one-minute demo criterion.
- **Three Testable Demonstration Cases:** Fully restated as acceptance criteria, including separate program/intake/category variations. The approved Waikato pair and labeled synthetic fixtures supply the test inputs; benchmark failures remain recorded in spec.md.
- **The POC Boundary / Later / Explicitly Cut:** Preserved. Only readable PDF/TXT; no OCR, website ingestion, extra requirement domains, accounts, permanent storage, or automatic resolution of conflicts.
- **Counting contradiction resolved:** Early interview wording could include unresolved topics in compared totals. The learner's final equations supersede that wording: insufficient evidence is excluded from AI-suggested requirements compared and reported separately.
- **Potential evidence contradiction resolved:** Showing both source panels does not imply both contain relevant evidence. Missing evidence remains explicit; quotations are never manufactured to fill the layout.
- **Apparent progress mismatch resolved:** The three-stage first-screen indicator describes the overall journey; the five-stage loading experience describes actual AI processing. Neither requires fabricated progress.
- **Added interaction detail, within scope:** Responsive styling, manual reanalysis with outdated reports, copying questions, and opening email drafts support the same core journey. They do not add new analysis domains, communications services, or storage infrastructure.
- **Complexity watch:** Premium styling must not displace reliable comparison. Partial results are handled only if produced, not a separate required streaming capability. Email drafting uses the default application; no provider integration. Preserving an old report is active-session behavior, not report history.

- **Final-review additions:** A distinct no-relevant-requirements state, rejection/separation of unverifiable evidence, and accurate document privacy disclosure reinforce the existing evidence/trust boundary. They add no analysis domain, accounts, permanent storage, or provider integration requirement. Privacy technical details remain explicitly deferred to `4-spec`.

No unresolved conflict with the approved scope was found. Demonstration inputs are selected as recorded in spec.md; production validation remains outstanding. Exact headline copy, typography, branding artwork, and layout breakpoints are later presentation choices within this PRD, not assumed learner decisions.

## Approval and Handoff

The learner explicitly approved this PRD on 2026-10-14 after reviewing the Markdown and visual HTML companion. The official Devpost Learn `3-prd` stage is complete. All agreed product decisions, acceptance criteria, and approved-scope boundaries remain in force.

The original handoff deferred `4-spec` and coding. Final spec approval and local build authorization followed on October 20; the approved degree-aware revision governs this extension. At the original handoff, privacy details and demonstration-document preparation were downstream work; those decisions are now recorded in spec.md, including the approved Waikato pair. This records the later decisions without claiming that production processing has been validated.

Human-review amendment approved on 2026-10-19: [approved amendment](human-review-amendment.md). This records approval of the amendment separately from the original document approval. At that amendment handoff, the technical specification remained DRAFT and implementation was not yet authorized. Final 4-spec approval and local 5-build authorization followed on October 20; additional Gemini calls and public deployment still require separate approval.
