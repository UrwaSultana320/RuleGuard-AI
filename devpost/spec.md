---
doc: spec
status: approved
updated: 2026-10-26
approval_gate: approved-with-documented-hobby-uncertainty
---

# RuleGuard AI — Technical Specification

## Admissions Comparison Expansion — 2026-10-26

This approved local change supersedes earlier English-only comparison boundaries and the deferral of other admissions requirement domains. The original English-language benchmark remains a historical demonstration, with its recorded failures unchanged. The current product scope is comparison across admissions requirements supported by two uploaded university documents for a selected Bachelor's or Master's degree, programme, intake and applicant category.

Analyze academic eligibility, GPA and prerequisites; English tests and exemptions; apostille, attestation, notarization and translations; transcripts and academic certificates; SOP, CV and recommendation letters; application deadlines and submission stages; application fees and relevant financial evidence; and any other supported admissions requirement. These examples are not a fixed category whitelist. Scholarship selection and unrelated policy advice remain outside this admissions scope.

Identify applicable sections before comparison. Preserve source-specific degree, programme, applicant category, intake, exception and submission-stage conditions. Application, conditional offer, enrolment and original-document verification can have compatible differences. Same-stage apostille required versus explicitly not required can be a potential contradiction; silence does not establish a waiver. Compare GPA scales and calculation bases without conversion; compare deadlines for the same intake and event, preserving stated time zones. Different institutional scopes must not be assumed to form a common contradictory policy. Decisive unknown selectors require Insufficient Evidence, with the precise missing information stated.

Retain Potential Contradiction, Different Applicable Conditions, Consistent and Insufficient Evidence, exact source-backed quotations, full-source inspection and human review. Accepted clarification-worthy findings and explicitly included Uncertain findings feed the improved deterministic email workflow. Compatible stage differences and consistent findings do not automatically become clarification issues.

The implementation retains one combined reasoning response, existing countTokens preflight, bounded retries/fallback, quota protection, file/page/text/token limits, strict schema, degree gates, citation reconstruction and session privacy. It adds no AI call, institution rule, canned result, persistence or paid dependency. The prompt hash invalidates prior synthetic-example cache entries automatically. Gemini usage remains 40; no live verification, deployment, publication, billing or Devpost submission is authorized by this change.

Offline fixtures verify extraction, transport, contracts, evidence identity, declared applicability safeguards, review and email behavior across these topics. Authored expected model outputs are not measured Gemini reasoning. Genuine broader extraction/classification, exception reconciliation, stage interpretation and completeness remain unverified. The backend checks references and structural consistency; it cannot independently prove semantic support or detect a stage mismatch that the model fails to disclose. Passage-sized quotations may include neighbouring requirements and produce long drafts; they retain exact source wording. Dense multi-topic output can hit the existing 8192-token limit and must fail as incomplete rather than silently truncate. No complete coverage, guaranteed accuracy or admissions eligibility is claimed.


### Implementation audit and release impact

The pre-expansion src/server/prompt.ts explicitly instructed Gemini to compare English-language proficiency only and used an English-evidence extraction example. The scope and PRD explicitly excluded other admissions domains; page metadata advertised English comparison. These were real restrictions, despite the broader product name. The historical English sample/quality suite did not verify other admissions topics. The professional email upgrade was already completed and mechanically verified before this work (see email-upgrade-report.md).

The PDF/TXT extractor sends all supported readable text, split into approximately 900-character line-preserving passages. It has no English keyword filter or admissions topic selection. Long individual lines can exceed the passage target; unreadable PDFs, unsupported formats and over-limit inputs fail explicitly. The provider sends every passage; one combined reasoning response supplies degree assessments, rules, coverage and findings. Token-count preflight and the existing bounded retry/fallback attempts are separate provider requests, not a newly added reasoning pipeline.

The strict response schema uses free-text requirements/topics, cited scope/conditions/exceptions and four classifications. It has no language-test-only fields or topic enum. Evidence reconstruction checks source and passage identity, same-source references, all-passage accounting, complete status, supported degree handling and structural classification consistency. It does not verify that free-text claims follow semantically from a cited passage, independently find omissions or prove the model's classification. Different stages are preserved in existing scope/condition clauses rather than a new stage field; missed or falsely declared stage alignment remains a model risk. A stronger independent semantic verifier would require a separately approved design and evaluation, not weakened validation.

The dashboard, review state, finding summaries, quote emphasis and email input are topic-neutral. Sentence handling uses English locale but does not filter requirements by subject. The new email builder already uses generic admission wording, registry-checked quotations and explicit uncertainty inclusion. Its conservative content safety checks can still refuse a source passage that contains disallowed metadata or institution wording; this change does not bypass them. Whole-passage quotations can repeat context or include neighbouring unselected issues, although only eligible reviewed findings become email issues.

The runtime changes in this expansion are limited to prompt scope/instructions and page metadata. No schema migration, new model call, category whitelist, university-specific rule or validation relaxation was needed. New tests use authored synthetic responses and real extraction/buildReport; the API integration mocks the provider and quota service, and browser tests intercept the analysis transport. Separate public samples admissions-A.txt and admissions-B.txt exercise multiple topics without replacing the built-in English demonstration or entering its cache allowlist. No saved historical benchmark result was relabeled as a success.

Release recommendation: freeze further architecture changes for the October 26 submission. The local evidence-review workflow can demonstrate the broader contract with clearly labeled offline tests; comprehensive Gemini reasoning accuracy and complete coverage remain unverified. Existing S06, S09 and Waikato failures still apply. Do not claim a fully verified comprehensive comparison engine or final public-release readiness. Hosted parser/runtime verification and the owner's final review remain separate release work; no deployment or submission is performed here.

### October 26 local release verification

Node 24.19.0: 245/245 Vitest unit/integration tests passed across 17 files, including 27 admissions contract/sample regressions and the additional admissions-wide API integration. 28/28 Playwright tests passed against the local production app at 127.0.0.1:3011, including the new multi-topic review/email flow. There were no skipped cases in either run. Browser transport/provider outputs were intercepted or AI was disabled; no genuine Gemini request was made. Cumulative usage remains 40.

Lint, TypeScript checks and the production build passed. The self-contained PDF trace and client-secret checks passed (534 traced parser files; 19 client/static HTML artifacts scanned). Canonical scope/PRD/spec HTML articles were regenerated from their Markdown while retaining companion CSS and scripts. Existing Vite future-configuration and Playwright color-environment warnings are non-fatal. These checks establish local workflow regressions, not hosted behavior or semantic model accuracy.

Offline coverage includes same-stage apostille disagreement, compatible apostille and deadline stages, GPA threshold disagreement and unestablished scale equivalence, certified versus uncertified transcripts, conflicting same-event deadlines, selected/mixed degree handling, conditional translation and English exemptions, missing recommendation evidence, unknown applicability, SOP, CV, prerequisites, notarization/attestation, fees, financial evidence and an unlisted portfolio/interview topic. Multi-category pairs retain all independent topics. Source forgery and missing passage accounting are still rejected. Review selection and explicit uncertainty inclusion are tested through the real email builder.

## Approved Evidence-Backed Email Upgrade — 2026-10-26

This is an approved MVP requirement change to the existing clarification handoff. It supersedes earlier email eligibility and direct-mailto wording only. Degree-aware comparison, the approved light editorial theme, source safeguards, session privacy and unrelated approved requirements remain in force. No additional Gemini request, paid service, public deployment, repository publication or Devpost submission is authorized. Cumulative Gemini usage remains 40.

### Existing implementation and architecture change

The previous shared TypeScript template was already deterministic; no LLM email call is being replaced. It included reviewed Consistent findings, required an acceptance before uncertainty inclusion, hardcoded English-language wording, emitted filenames/line references and extra placeholders, and automatically replaced edits when review choices changed. Replace this handoff in src/shared/clarification-email.ts and src/components/ClarificationEmail.tsx; preserve the existing Gemini comparison adapter, backend buildReport evidence checks and degree gates.

### Input/output contracts

EmailContext contains the current Report, per-finding Review choices, the complete report-bound Source registry, currentRevision, outdated and includeUncertain (default false). prepareEmailInput derives EmailInput with reportId/revision; applicant programme, intake and category; include_uncertain; and findings carrying id, topic, type (contradiction | missing_information | unclear_exception), status (accepted | uncertain), verifiedSummary, exact quotations with sourceId/passageId provenance, existingClarificationQuestion and supported applicability. Existing model explanations/questions are retained as context where appropriate, but free model prose is not treated as verified email claims. Questions use deterministic topic-specific wording to avoid importing unsupported conditions. Applicant holdings, approvals and shared document scope are never asserted.

Output is strictly { subject: string, body: string }, validated by emailDraftSchema (Zod, nonempty fields, subject at most 240 characters). Single subjects use a topic-specific short question; unusually long topics use a concise admission-requirement question. Missing programme/intake/category are omitted without substitutes. No new endpoint, storage, provider request, dependency or model contract is needed.

### Provenance and independent validation

Eligibility requires explicit Accepted review, or Uncertain plus opt-in, and a clarification-worthy mapped category. Exclude other-degree/non-applicable rules, blocked gates and stale revisions. Different Applicable Conditions requires both a documented permissive exception and explicit unresolved conditions/question; compatible differences do not become email issues. Every quotation must have sourceVerified, match its rule/source, and resolve to the same ID/text/page/line span in the current backend-issued registry. Exact source words are used; leading standalone preparation headers, including a non-operative preparation scope heading, can be omitted only as a contiguous prefix, retaining operative scope/conditions/negations. Unsafe quotations are omitted; a contradiction still requires both source positions, and every included finding requires at least one safe quotation. A missing-information finding may use one source with no fabricated second block.

validateClarificationEmail runs on every normal/fallback generated draft. It independently reconstructs eligibility and input from the current report/reviews/registry, parses output sections, checks problem-before-evidence ordering, one allowed question, exact per-finding/source quotation association, subject counts, numbering, introduction, uncertainty wording, closing and strict output schema. Source-derived problem statements and a closed set of conservative templates prevent arbitrary unsupported model assertions; patterns alone do not certify semantics. The final structure must match a permitted normal or fallback assembly with no extra claims. exactQuotation supports exact substrings and ordered explicit omission markers; the production builder uses contiguous quotations without generated ellipses. Literal source ellipses remain literal. Reordered or rewritten words are rejected.

Content checks reject institution/tool/fixture wording, source filenames, known institution names from source preparation headers, internal source references, page/line identifiers, unsafe URLs, Markdown markers and unapproved placeholders. Do not alter a programme abbreviation merely because it contains AI. Required evidence containing unsafe wording cannot be rewritten; fail closed if no compliant evidence remains. Exact provenance does not prove semantic entailment, complete extraction, policy currency or authentic authorship. Arbitrary unmarked proper names cannot be universally identified from the current source contract; user review remains necessary, and this limitation must be disclosed in the development report rather than claiming a general named-entity verifier.

### Safe fallback, diagnostics and draft state

On normal validation failure, render a shorter deterministic explanation/question using the same exact verified evidence, then run the identical validator. If source preparation itself is invalid, no source-backed fallback can be assembled; fail closed. Never weaken required provenance, category, content or revision checks. Failure returns no draft and a recoverable message. Fixed diagnostics are EMAIL_STALE, EMAIL_INPUT, EMAIL_CONTENT, EMAIL_STRUCTURE and EMAIL_EVIDENCE. Only these constant codes may be logged; never applicant fields, document bodies, quotes, exception messages or credentials.

Generation runs on the explicit button event. Bind a draft to a signature of current report, source snapshot, reviews, revision and uncertainty opt-in. Changed inputs hide the editor and disable copy/mailto; a prior draft is labeled outdated and read-only. Retain manually edited state until explicit replacement, with an inline Replace edited draft / Keep previous draft choice. Never automatically regenerate on review edits. Manual user-authored edits are not claimed to retain generated-draft provenance and are clearly presented for review. Render text through React escaping; only four exact label lines use strong elements in the optional preview. Textareas, clipboard and mailto contain plain text. Session memory only; no new persisted content or recipient lookup.

### Local release note and verification boundary

Approved October 26: professional evidence-backed clarification drafting replaces the previous email template behavior. New source/input/output validation and regression coverage are part of this local change. Exact final counts, example outputs and limitations are recorded in email-upgrade-report.md and checklist.md after verification. No separate changelog is introduced because this repository keeps release history in the specification/checklist. No Devpost submission write-up currently exists. Gemini cumulative usage remains 40; no new requests, publishing or deployment are authorized. Local visual/functional review is distinct from release approval.


## Approved Degree-Aware Revision — 2026-10-20

Approved controlled extension of the previously completed 5-build: support international Bachelor's / Undergraduate and Master's / Postgraduate applicants. This explicitly supersedes the Master's-only boundary and fixed degree selection; unrelated approved requirements remain unchanged. Local implementation and offline tests are authorized. No additional Gemini requests, billing changes, public deployment, repository publication, Devpost submission or 6-ship are authorized. Cumulative Gemini usage remains 40.

Select the degree explicitly before uploading two readable PDF/TXT documents; neither degree is preselected. Retain program, intake and applicant category. Examine the complete supported extracted content of both documents, not filenames, titles or isolated keywords. Display a separate preliminary applicability assessment for each source, with backend-reconstructed quotations and PDF page / TXT line references: applicable to selected degree, explicitly another degree, multiple degrees, general policy applicable to selected degree, or uncertain.

A clear, exclusively other-degree document with supporting references blocks comparison and requires replacement; acknowledgment cannot override it. Weak, ambiguous or conflicting mismatch evidence is uncertain. Mixed-degree documents are accepted only where the selected branch is supported; compare selected-degree rules and applicable general rules, conditions and exceptions only. Inventory other-degree rules for coverage, but do not include them in comparison findings. A genuinely general policy needs no degree-specific title. Never inherit rules across degrees or assume every postgraduate statement applies to every Master's program.

For uncertainty, show **Degree applicability could not be confirmed**, available evidence and missing information before revealing findings. Require an explicit acknowledgment and Continue action. Reuse the same validated response in session memory, without another AI call; mark the resulting preliminary report **Degree applicability unverified**. Scope, condition satisfaction and contradiction remain separate concepts. Unknown rule-degree scope yields Insufficient Evidence. Human review and acknowledgment do not certify correctness, completeness, official status, authenticity or publication currency.

Every degree or document edit invalidates the applicability decision, acknowledgment, previous comparison and related review decisions. Full extracted sources remain inspectable, without a guarantee of extraction fidelity. Preserve original quotes, four finding categories, dashboard totals for AI-identified findings only, Accept/Reject/Uncertain controls, clarification drafts, privacy/session handling, all upload limits, backend-only credentials and free-tier global quotas. Existing Master's-only samples remain labeled Master's; provide separately labeled Bachelor's samples rather than relabeling them.

Acceptance checks cover both matching degrees; opposite-only mismatches in either direction; mixed sections; general policy; uncertainty and explicit continuation; non-overridable mismatch; invalid/cross-source applicability references; stale degree edits; degree-specific conditions/exceptions; and retained Master's behavior. Offline tests verify implementation and guards, not live Gemini degree reasoning. The revised feature is not release-ready solely because offline tests pass; local UI review and separately authorized live validation remain outstanding.

### Degree Assessment Contract and Gate

Extend the existing single combined generation response, not the request count. Required `documentAssessments` contains exactly one entry per current source: `sourceId`, `status` (`selected`, `other_degree`, `multiple`, `general`, `uncertain`), `explanation`, cited `evidence` clauses, `missingInformation`, `exclusivelyOtherDegree`, and `conflictingEvidence`. Evidence clauses use existing passage IDs, never generated quotations or page numbers. Non-uncertain conclusions require evidence. Each rule adds `degreeMatch` (`selected`, `general`, `other`, `unknown`) and a same-source cited `degreeEvidence` clause. Conditions and exceptions must belong to the rule's selected-degree/general branch; do not merge exceptions across branches.

Validate the entire response and existing passage coverage before creating any current outcome. Reject missing/duplicate source assessments, malformed fields, invented/stale/cross-source applicability references and findings referencing other-degree rules. Downgrade internally inconsistent assessment claims, declared conflicts or missing decisive information to uncertain; a supported exclusive mismatch has priority over uncertainty. These structural checks cannot independently establish semantic entailment or detect every omission. Preserve raw proposed assessment status separately from the guarded status.

The backend returns an `applicability` terminal event containing assessments and `gate: blocked` for a clear mismatch, with no findings/report payload. Otherwise the existing `result` carries validated assessments and report with `degreeVerification: supported | unverified`. The client holds that report privately in active session state, displays assessments first and reveals it only after an explicit View comparison action (plus uncertainty acknowledgment where needed). There is no extra endpoint, persistent storage or model call. Input revision binding invalidates held results and acknowledgment. An outdated historical report remains visibly outdated on input edits; old review choices are invalidated.

Gemini remains `gemini-3.1-flash-lite` in its constrained preliminary role. Normal live operation still reserves a token-count utility request and one combined generation separately, with existing limits and no automatic retry. Live access remains disabled. Original model benchmarks and the earlier S01 response predate this required contract and are not evidence that the revised response passes. Do not alter retained raw responses or frozen benchmark expectations.


The project owner explicitly approved the final 4-spec on 2026-10-20, including the documented Vercel Hobby eligibility uncertainty, and authorized 5-build. Markdown is canonical; spec.html is its offline companion. The approved architecture is now the build baseline. Historical planning/benchmark records below retain their dates and failed outcomes. Any earlier DRAFT/handoff prohibition is superseded only for application implementation by this approval. No additional live Gemini request or public deployment is authorized; each requires separate permission. The Hobby terms question remains disclosed, not resolved by approval.

## How This Works, In Plain Language

An applicant first explicitly selects Bachelor's or Master's, then supplies two public university documents or degree-labeled synthetic samples and nonsensitive applicant context. One Next.js application provides both the React interface and backend. The backend reads each document page by page and gives every passage an identifier.

For the initial benchmark, one combined Gemini call examines the complete supported text: requirements, conditions, exceptions, applicability, comparisons, and clarification questions. The AI selects passage identifiers rather than writing its own quotations or page numbers. Backend checks reject invalid references and retrieve the actual evidence from the source text.

A matching citation proves where text came from, not that the reasoning is correct. Where evidence or applicability is uncertain, an identified topic becomes Insufficient Evidence. Unreadable documents, capacity failures, and incomplete analysis remain distinct errors.

Uploads, applicant context, and reports stay in the open application's memory. In-app navigation and retries retain them; refresh or closing the page clears them. The backend does not save uploaded documents or extracted text. Google's separate handling is disclosed before analysis.

The public judge URL will use backend-owned credentials. Gemini 3.5 Flash Lite was the first evaluation candidate; the final planned evaluation of Gemini 3.1 Flash Lite failed critical reasoning/coverage checks. The approved human-review direction retains genuine Gemini-powered comparison as preliminary suggestions, with Gemini 3.1 Flash Lite retained only for that constrained role in this approved architecture. Vercel Hobby and Upstash Redis Free are the selected hosting/quota architecture in this approved specification. Personal Free-account access is project-owner-verified; Hobby eligibility for the prize-bearing demo still needs clarification and production feasibility remains untested. No more Gemini requests are authorized.

Successful processing produces preliminary AI suggestions requiring human review, not a complete inventory of requirements. Users inspect citations and complete extracted sources, then accept, reject or mark suggestions uncertain. Human acceptance cannot establish accuracy, eligibility or completeness; a matching citation proves source identity, not sound reasoning. All actual extracted text is available, but extraction completeness or accuracy is not guaranteed.

## Approved Decisions and Boundaries

- Evidence-supported admissions requirements for Bachelor's and Master's applicants; exactly two readable PDF/TXT documents. MOI versus IELTS/TOEFL is evidence-led, not hardcoded.
- Next.js, React, TypeScript; one application containing frontend and backend. The stack choice includes learning these technologies rather than staying fully within familiar C#/.NET.
- Single combined AI call as the initial benchmark design. A three-call pipeline is considered only if benchmark evidence shows meaningful quality improvement. Preserve the same pipeline interface so changing the implementation does not require rewriting the UI or evidence system.
- Application-controlled citations, independently tested from AI reasoning.
- Each file at most 2,000,000 bytes (2 MB); each PDF at most 15 pages. Frontend and backend both check; backend is authoritative.
- No silent page/text truncation, omission of conditions, or partial output presented as success. Dense inputs can fail an explicit text/token budget despite fitting file/page limits.
- Public/synthetic inputs and nonsensitive context only; no confidential, personal, or sensitive application documents. Clear privacy and unofficial-service notices before analysis.
- Memory-only active session; visible notice that refresh/close clears work. No permanent uploaded-document, applicant, or report storage in backend files, a database, or browser storage.
- Genuine AI for every new comparison, including sample inputs. No canned report fallback.
- Public URL without judge installation, registration, or keys. Public GitHub repository with installation/testing instructions and short demo video remain required deliverables.
- Target 20 completed comparisons/day plus retry/testing reserve; not guaranteed capacity. No paid services without explicit project owner approval.
- Waikato pair approved as primary real-world benchmark candidate; synthetic cases retained; Trinity secondary robustness and KAIST extraction stress candidates.
- Premium responsive editorial light UI (October 21 visual amendment) and all approved PRD behavior remain in force.

## The Core Journey Through the System

Implements `prd.md > The Core Journey`.

1. Open the first screen: brand, purpose, explicit degree selector before upload, public/synthetic-only privacy notice, session-loss notice, two upload cards, applicant context, and Compare Requirements.
2. Explicitly select Bachelor's / Undergraduate or Master's / Postgraduate (no preselection), then select documents and supply intended program (required), intake/category (or Not sure). Browser checks metadata and parsed PDF page count, with local inline errors.
3. Explicitly start comparison. Send the raw files, bounded context, input revision and privacy acknowledgment to the backend. Disable duplicate submission. Do not auto-run after edits.
4. Backend independently validates request/file/page/text budgets, reads text, retains page mappings, creates passage IDs, and reserves available API capacity.
5. After complete extraction/capacity validation, send both canonical source snapshots in a revision-bound sources event for browser-memory inspection. The selected pipeline performs one combined structured Gemini call for preliminary suggestions. Source documents are untrusted data, never instructions to execute. This describes future runtime behavior; no call is authorized now.
6. Backend validates response structure, references, known applicability/evidence guards, and classification/count consistency; rebuilds evidence from source text.
7. Only complete processing success (including a valid empty outcome), followed by the document applicability gate and explicit continuation, opens the dedicated results dashboard of preliminary suggestions. It does not establish complete requirement coverage. Show the report notice, AI-suggested totals, full-source access and independent review controls; render explanations as text and eligible preliminary clarification actions without sending messages.
8. Return to inputs through in-app navigation with data intact. Any edit immediately marks the old report Outdated — Reanalysis Required.
9. Reanalysis requires an explicit click. Retain an old report as outdated during processing/failure. Only a complete new outcome replaces it: a blocked outcome removes current findings, while an allowed/uncertain report is held behind the applicability gate until explicit continuation. Ignore results arriving for a superseded input revision.
10. Refresh or closing the page clears active work; no document recovery or report history is promised.

## Stack and Runtime

### Approved Application Stack

Next.js App Router with React and TypeScript. Node.js backend route handlers share the project with the interface. Use ordinary CSS modules and CSS custom properties as a proposed low-dependency styling default; no component framework is necessary for the approved design.

References: [Next.js installation](https://nextjs.org/docs/app/getting-started/installation), [route handlers](https://nextjs.org/docs/app/getting-started/route-handlers), [React](https://react.dev/learn), [TypeScript](https://www.typescriptlang.org/docs/), [Next.js CSS](https://nextjs.org/docs/app/getting-started/css).

### Proposed Runtime and Dependencies

These remain application implementation recommendations. PDF.js 6.4.299 has now been installed and tested only in the isolated evaluation harness; application dependencies have not been installed as an application:

- Node.js 24 LTS for local/server parity, with a supported current patch pinned when implementation is authorized. Official Node release documentation lists the 24 branch as LTS. [Node releases](https://nodejs.org/en/about/previous-releases)
- Current stable Next.js/compatible React/TypeScript releases, pinned in package-lock.json after compatibility and security checks. Do not use floating production versions.
- Mozilla PDF.js via pdfjs-dist for page-wise PDF extraction in Node and frontend page-count checks. The official Node example uses getDocument, getPage, and getTextContent. Check worker/font/CMap assets, ESM support, and deployed bundling. No separate Python production service. [PDF.js](https://mozilla.github.io/pdf.js/getting_started/), [official Node example](https://github.com/mozilla/pdf.js/blob/master/examples/node/getinfo.mjs)
- Google GenAI JavaScript SDK, @google/genai, for the Gemini candidate. Configure retries/continuations explicitly; a library must not silently multiply the assumed generation-call count. [SDKs](https://ai.google.dev/gemini-api/docs/libraries)
- Zod as a proposed runtime response validator. TypeScript alone does not validate AI/network payloads. [Zod](https://zod.dev/)
- Vitest for pure validation/classification/count tests and Playwright for browser flows/responsive checks. These are development dependencies. [Vitest](https://vitest.dev/guide/), [Playwright](https://playwright.dev/docs/intro)

Use the Node runtime rather than Edge for PDF processing. API-level compatibility is documented; faithful extraction, production packaging, memory and runtime are unproven. [Next.js runtimes](https://nextjs.org/docs/app/api-reference/edge), [server dependency packaging](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverExternalPackages).

### Development Machine

Windows VM: Intel Xeon Cascade Lake, four virtual processors, 16 GB RAM with about 12.1 GB used, no visible GPU, HDD/SAS storage. This supersedes the earlier physical-laptop specifications. About 3.9 GB unused RAM was calculated from the project owner's report, not measured by the agent. Free memory by closing unnecessary applications when developing; do not depend on local model inference for the public demo. A small local quantized model remains an alternative experiment, not a selected fallback.

## Where It Runs and How Someone Tries It

### Public Delivery and Availability

Deploy before the submission deadline supplied by the project owner and prioritize genuine AI availability throughout judging:

- Submission: October 26, 2026, 5:00 PM US Eastern (EDT), equivalent to October 27, 2:00 AM Pakistan time.
- Judging starts: October 27, 10:00 AM EDT, equivalent to October 27, 7:00 PM PKT.
- Judging ends: October 30, 5:00 PM EDT, equivalent to October 31, 2:00 AM PKT.
- Winners: approximately November 4, as reported by the project owner.
- Secondary buffer: remain available through November 5 if feasible. Conservatively planning through the end of that date in US Eastern extends into November 6 PKT; that exact buffer cutoff is an assumption, not a new agreed deadline.
- Dates were supplied by the project owner as official-rule dates; an official rules URL has not yet been independently checked.

Production must be accessible in a signed-out browser without a hosting-provider login. Judges choose samples or upload eligible files and use the same genuine pipeline. Sample source distribution/provenance must be checked before publishing the bundle.

### Selected Hosting — Access Confirmed; Eligibility Clarification Outstanding

On 2026-10-20, following provisional approval, the project owner confirmed active Vercel Hobby dashboard access and successful creation of an owned Upstash Redis Free database, finalizing those services for the DRAFT architecture. Hobby terms eligibility remains a separate unresolved qualification; deployment validation is still required. Only Free plans are permitted: no card/billing activation, Pro/paid trials, automatic upgrades or paid features. Current researched allowances: 4 active CPU-hours, 360 GB-hours provisioned memory, 1 million function invocations and 100 GB data transfer. Node functions with Fluid Compute have a 300-second Hobby maximum; request/response body ceiling is 4.5 MB. Configure an application timeout lower than the host limit, and test the actual deployment configuration. Limits can pause service; this is not an uptime guarantee.

[Vercel Hobby](https://vercel.com/docs/plans/hobby), [function limits](https://vercel.com/docs/functions/limitations), [duration](https://vercel.com/docs/functions/configuring-functions/duration), [environment variables](https://vercel.com/docs/environment-variables), [public access controls](https://vercel.com/docs/deployment-protection).

Render Free is an alternative for a conventional server deployment. It sleeps after 15 idle minutes, with about a minute to wake, and shares 750 free instance-hours/workspace/month. Its cold start conflicts with immediate judge access; ephemeral files do not provide document persistence. Quota/traffic exhaustion can suspend service. [Render Free](https://render.com/docs/free)

Account access verified by the project owner on 2026-10-20: Vercel plan **Hobby**, status **Active**, dashboard access **Confirmed**; Upstash Redis database **created successfully**, plan **Free**, **TLS/SSL enabled**, no payment method required and no paid trial used. This is direct project-owner evidence, not an agent-authenticated inspection or a deployed application test. It supersedes the earlier sign-in-only access check and closes the personal-account access blocker. No credentials were requested or disclosed.

During explicitly authorized development, configure backend secrets privately in the gitignored local environment file and later the hosting environment-variable settings. Do not paste credentials into chat, client code, source control or documentation. Account access does not authorize deployment, resource modification, billing changes or Gemini requests.

Vercel's Hobby/fair-use documents allow personal, noncommercial projects, but define commercial use broadly around financial gain. RuleGuard AI has no payment/advertising feature; that alone does not resolve whether a prize-bearing hackathon fits the terms. No explicit hackathon-prize exemption was found. Record eligibility as UNVERIFIED pending provider clarification for this demo, rather than declaring it eligible or ineligible. No support message was sent. [Fair-use guidelines](https://vercel.com/docs/limits/fair-use-guidelines), [terms](https://vercel.com/legal/terms).

Use the project-owner-confirmed owned Upstash Free database, with TLS/SSL, no billing activation or upgrade. Its published anonymous instant database expires after three days unless claimed; it cannot be relied upon unattended through judging. Public Free limits remain 500K commands/month, 250 MB and 10 GB bandwidth; effective command accounting and production connectivity remain to be validated; the Free account/database selection is confirmed by the project owner. [Upstash Free-plan FAQ](https://upstash.com/pricing/redis). Free services do not guarantee uptime or judge capacity.

### Planned Local Startup Contract

These are commands the eventual README/build must implement; they do not work yet because application code and package.json do not exist:

1. Install the chosen Node.js LTS and clone the public repository.
2. Run `npm ci`.
3. Copy the supplied .env.example to .env.local and set GEMINI_API_KEY privately; add any approved quota-service secrets. The existing .gitignore excludes .env files and must retain that protection.
4. Run `npm run dev`; open http://localhost:3000.
5. Run `npm run lint`, `npm run typecheck`, and `npm test` for local checks.
6. Install the documented Playwright browser dependency, then run `npm run test:e2e`.
7. Run `npm run build` and `npm start`; repeat the journey at http://localhost:3000 in production mode.

The judge URL needs no keys; a person running the repository backup locally needs their own valid free credentials. The short demo video remains necessary even with a public URL.

## Look and Feel

### Approved Visual Revision — 2026-10-21

The project owner approved a substantial local visual redesign after reviewing the previous interface. This supersedes the dark navy/violet/cyan presentation only: use a premium light editorial product design, with warm ivory #F8F7F4, white surfaces, charcoal #202925, deep emerald #176B5B and restrained terracotta #C87855. Refine semantic status colors for accessible contrast; never rely on color alone. Remove the oversized sidebar, orbit graphics, purple gradients, glows and excessive badges. Use compact horizontal Compare/Findings navigation, a visible session-loss notice, deliberate serif/sans-serif typography, a consistent spacing system, readable text and comfortable controls. Use local system fonts without a font-service dependency.

Keep the hero compact: “Compare the policies. See the evidence.” Explain Bachelor's/Master's support and preliminary AI review clearly. Make explicit, unselected degree options prominent; adapt the intended-program example to the selected degree. Style uploads, context, privacy, progress, errors and applicability gates consistently. Prioritize exact source quotations in the findings layout, visually distinguish AI interpretation from extracted evidence, retain side-by-side evidence where space permits, and keep review choices and clarification/email actions easy to understand. All conditions, disclaimers, full-source access and review safeguards remain available.

This is presentation and related UX/copy only. Model/single-call behavior, degree validation and blocking, uncertainty acknowledgment, backend evidence verification, review state, privacy, session lifetime, quota guards and upload limits are unchanged. No new AI feature, service, live request, publication, billing or deployment is authorized; cumulative Gemini usage remains 40. Test the existing workflows and responsive states at 320, 375, 768, 1366 and 1920 px using offline report fixtures. Visible focus, reduced motion, readable text, contrast and touch targets are acceptance criteria. Revised live degree reasoning and hosted release checks remain outstanding.


Implements `prd.md > Look and Feel`, `Screens and Layout`, and `Responsive Layout and Accessibility`.

Implement the approved October 21 light editorial design: warm ivory #F8F7F4, white #FFFFFF surfaces, charcoal #202925 text, deep emerald #176B5B primary actions, muted terracotta #C87855 accents and subtle warm gray borders. Use darker text variants where required for contrast. Compact horizontal navigation replaces the sidebar; no purple gradients, orbit graphics, glass effects or excessive shadows. Prioritize source quotations, clearly separated AI interpretations, semantic warnings and readable review/email controls. Verify contrast in actual combinations.

Use a system font stack initially to avoid a font service or network dependency. Desktop upload/evidence panels can sit side by side; stack when available width is insufficient. Give every category a text label/icon in addition to color. Use visible focus, semantic form labels, comfortable touch controls, reduced-motion support, and live status announcements.

Check all screens and states at 375, 768, 1366, and 1920 px: first screen, navigation, inputs, progress, dashboard, finding/evidence expansion, clarification, errors, outdated reports and empty results. No clipping, tiny type, overlap, or horizontal page scrolling. The three first-screen journey labels are Select Degree → Upload and Context → Applicability and Comparison; the document assessments gate findings after the same combined AI call.

## Components

### Active Session and Input Form

Implements `prd.md > Document Input and Applicant Context`, `Revise and Compare Again`, and `Outdated Reports and Reanalysis`.

A React session provider above the input/results views owns files, context, request state, input revision, and the last completed report. Keep it mounted across in-app navigation. No document/applicant/report content in localStorage, sessionStorage, IndexedDB, a service worker cache, URL query strings, or cookies. A refresh creates a fresh session.

Degree selection is explicit (Bachelor's or Master's), with no preselection; intended program is required; intake/category allow Not sure. Any relevant edit increments the input revision and marks the retained report outdated immediately. Disable repeated submission and abort or ignore superseded responses. Abort is best effort and does not establish that Google stopped processing or quota was refunded.

Display: “Your work stays in this open session. Refreshing or closing this page clears uploads and results.”

### Privacy and Input Eligibility Gate

Implements `prd.md > Document Privacy Explanation`.

Before analysis, show a clear notice and require acknowledgment that uploads are public university material or synthetic fixtures and contain no confidential, personal, or sensitive information. Backend rejects an absent acknowledgment; this does not prove the content is safe. Do not advertise automatic sensitive-data detection. Request only nonsensitive program/intake/category context.

Explain the backend/Google text transfer, no permanent application document storage, Google's separate Free Tier data-use/retention and potential human review, and that RuleGuard AI is not an official university admissions service. Link the actual provider terms. Do not claim local-only processing or provider deletion. No uploads to Google occur merely to screen content before acknowledgment.

### Document Reader and Passage Registry

Implements `prd.md > Document Input and Applicant Context` and `Evidence Verification and Unsupported Output`.

Validate extension plus actual readable content. Frontend checks bytes and parsed page counts; backend independently enforces them before analysis. Reject unreadable, scanned/textless, corrupt, encrypted/unopenable, or empty files with a useful file-specific reason where known. No OCR, DOCX, images or URL ingestion.

Read PDFs page by page, retaining actual one-based PDF page indexes. Printed page labels, if available, are optional supplemental information and must not replace the actual page index. Preserve text items/position information for passage ordering and context. Do not assume column order or logical connectives are intact just because a PDF has text.

Create a document hash, stable source ID, page-local passage IDs, canonical text and optional bounded span offsets. Keep backend mappings only within the active request; transmit complete canonical snapshots and their mappings to active browser memory through the revision-bound sources event for full-source inspection. Re-extraction versions affect IDs; never reuse a mapping from a different input snapshot. A typical identifier may encode source/page/span, but backend registry membership is authoritative.

TXT: initially propose UTF-8, optional BOM, explicit decoding failure for invalid bytes. Preserve a declared canonical newline representation and original source identity; use line/excerpt references, never PDF pages. Encoding is a routine implementation default for review, not a new user requirement.

Known extraction loss of decisive wording blocks a supported conclusion. Identified topics with unreliable evidence are Insufficient Evidence; a source that cannot be meaningfully analyzed fails reading. No universal omission detector is claimed. KAIST is an explicit extraction stress gate.

### Limits and Complete-Input Gate

Implements `prd.md > Error Recovery and Incomplete Analysis` and the approved technical limits.

Approved: 2,000,000 bytes/file and 15 pages/PDF, validated on frontend and backend. Reject whole over-limit files; do not analyze only the first 15 pages. Keep the unaffected file/context.

Initial transport ceiling: 4,100,000 bytes for the entire multipart body if Vercel's researched 4.5 MB ceiling applies, with bounded context/filenames/metadata and 4,000,000 bytes maximum file content. Validate actual bytes/overhead against the deployed provider limit before release; do not increase the ceiling automatically. Reject early; stream-count body bytes rather than trusting Content-Length. No base64 JSON uploads.

Proposed first benchmark budget: at most 60,000 extracted Unicode characters across the pair and 20,000 input tokens for the complete constructed model request, including instructions, context, passage IDs and all supported source text. These conservative operating limits are NOT the model's advertised context limit and are NOT approved/measured capacity. Derive final limits from accuracy/token/latency results; require explicit changes for consequential reductions.

Use the provider's token-count endpoint when needed, treating it as an external text transfer with its own failures/quotas. It is a utility request, not a second reasoning call. Alternatively a validated conservative local estimator can reject safely; it cannot assert exact token counts. Do not confuse 250K input TPM with a daily token allowance. Reserve model context for output/thinking as applicable.

If the full constructed input cannot fit, show a clear capacity limitation. Do not silently select away exceptions or reinterpret failure as an empty/complete result. Centralize all limits in backend configuration and mirror nonsecret values for client checks.

### Pipeline Interface and Single Combined AI Call

Implements `prd.md > Context-Aware Comparison`, `Finding Classification and Dashboard Counts`, and `Evidence and Next Steps`.

APPROVED INITIAL DESIGN: one combined reasoning call. Input: complete bounded passage registry for both sources, nonsensitive applicant context, fixed task instructions, and a response schema. Output: requirement topics, source conditions/exceptions, applicability/missing context, classifications, explanations, passage references, and clarification questions where appropriate.

Proposed conceptual response contract:
- analysisStatus: complete or incomplete; empty outcomes require complete processing.
- coverage: both source IDs acknowledged and explicit limitations; self-reported coverage is not proof of completeness.
- findings: topic key/name, requirements/conditions/exceptions with passage IDs, per-source applicability (applies / does not apply / unknown), missing details, one proposed classification, explanation, evidence references, and optional clarification question.
- Evidence references contain IDs and optional exact offsets, not generated quotation text, source titles or page numbers.
- No model-provided confidence percentages, similarity score, dashboard arithmetic, waiver approval, or automatic authority selection.

Runtime-validate structure and enums. Treat documents as untrusted quoted data; instruct the model not to obey embedded commands and never enable browsing, code execution, email, or external tools for this task. Escape all displayed text.

Keep one analysis interface accepting sources/context and returning candidate findings. A future three-call implementation must return the same contract, preserve reference integrity, and justify quality improvement with measured results. Do not route to a paid model or another provider silently.

### Evidence and Finding Validator

Implements `prd.md > Evidence Verification and Unsupported Output` and `Finding Classification and Dashboard Counts`.

Validate each source/passage ID and any offsets against the current request's registry. Construct displayed quotations and page references directly from the registry. Reject cross-source, wrong-page, unknown-ID, out-of-bounds, or stale references. If auxiliary model quotation text is ever accepted, exact-match it to the declared span; no fuzzy substitution.

Inspect condition and exception references as well as the main requirement. Missing decisive support for an identified topic yields Insufficient Evidence, retaining available valid evidence and explaining limitations. Never display a fabricated quotation as supporting evidence even with an unsupported badge.

Category rules:
- Consistent: supported compatibility for the relevant context, not an absence of evidence.
- Potential Contradiction: both irreconcilable statements clearly share the relevant applicant context, with no supported reconciling exception.
- Different Applicable Conditions: supported differences in applicable conditions; explain the applicant branch only where known.
- Insufficient Evidence: unknown applicability, missing required applicant detail, uncertain equivalence, or insufficient reliable source support.

Backend can check structural requirements, missing fields/evidence and exact IDs, but cannot certify semantic entailment or discover all model omissions. “Verified evidence” means traceable source matching; reasoning accuracy has a separate benchmark. Duplicate topic keys or incoherent output must not create double-counted findings; do not silently merge semantically distinct rules based only on similar text.

One primary classification per distinct topic. Backend derives compared = consistent + potential contradictions + different conditions; unresolved = insufficient; assessed = compared + unresolved. Empty complete analysis has no findings and all counts zero. Incomplete/failed analysis is never empty success.

Human review never overrides invalid references, missing support, category guards or malformed/truncated/incoherent-output rejection. If no usable report can be produced, show the existing analysis error and recovery guidance; do not manufacture findings. Backend safeguards do not repair saved raw AI reasoning failures.

### Honest Five-Stage Progress

Implements `prd.md > Analysis Progress`. No timed stage simulation.

The single AI call performs extraction, context reasoning and comparison together. During that call, show the active analysis state with the helper text “One AI request is examining requirements, conditions and comparisons together.” Do not claim any of those internal reasoning steps independently completed.

Preserve the five labels and map visible transitions to real work:
1. Reading uploaded documents: backend byte/page/text extraction and passage creation.
2. Extracting requirements: combined model request is running; explain its shared scope.
3. Checking applicant-specific conditions: after a response, backend checks structured applicability, condition references and missing-context guards. This validates the response, not a claim to independently repeat AI reasoning.
4. Comparing requirements: backend checks proposed comparison categories, evidence prerequisites, topic uniqueness and metric consistency.
5. Preparing the evidence-based report: reconstruct quotations/references, sanitize output and build the complete report.

Mark a phase complete only when its operation ends. Stages 3–5 may be brief; never add artificial delays. A generic activity indicator is sufficient; no fabricated completion percentage. Transport can deliver actual progress events without making additional AI calls.

### Dashboard, Evidence and Clarification

Email generation, eligibility, rendering and stale-state behavior are governed by the October 26 upgrade above; earlier direct-mailto/reference wording in this section is superseded for generated emails only.

Implements `prd.md > Screens and Layout > Results Dashboard`, `Evidence and Next Steps`, and `Empty Results`.

Dedicated results view with applicant profile, three explained totals, four categories, prominent potential contradictions, expandable finding cards and View Evidence. Evidence panels identify actual filenames and PDF page indexes (TXT excerpts/lines); highlight only validated spans. Stack on narrow screens, explanations below both, expandable long excerpts. An absent supporting source stays explicitly absent.

Potential Contradiction and Insufficient Evidence offer a professional clarification question, brief issue explanation and valid references. Copy Question copies visible text. Draft Email uses a properly encoded mailto subject/body without a recipient; no email API or automatic sending. Provide copyable email text if a mail client/clipboard is unavailable. Build email references from verified source metadata, not invented AI citations.

Display the persistent report notice and preliminary label on every finding: “AI suggestions — human review required. Findings may be incorrect or incomplete. Check conditions and exceptions in the full extracted sources. Accepting a finding does not confirm accuracy or admissions eligibility.”

Each displayed suggestion starts **Pending review** and has **Accept**, **Reject**, **Mark uncertain**, and a way to return to Pending review. These are user review choices, independent of the four system classifications; accepting Insufficient Evidence cannot change it to Consistent, waive missing evidence, alter quotations/page references or override validation. Rejected suggestions remain visible and clearly labeled rather than deleted. Acceptance never establishes accuracy, eligibility or complete coverage.

Use the metric labels **AI-suggested requirements compared**, **AI-suggested unresolved findings**, and **AI-suggested topics assessed** for the unchanged compared/unresolved/assessed equations. The three totals count all displayed, validated AI suggestions, including rejected suggestions; they do not measure complete source coverage or human agreement. Review choices do not change category totals. Show a compact Pending / Accepted / Uncertain / Rejected review summary whose counts sum to all displayed suggestions, separate from category counts and without accuracy or completeness scores.

Extend **View Evidence** with **View full extracted source** for either document, including passages the AI did not cite. Display all extracted text in canonical page order with filenames, PDF page indexes or TXT line spans and passage identifiers; cited passages link to their locations. Long text may scroll or expand but must not be omitted. This view does not guarantee original PDF layout, complete extraction or extraction accuracy; known unreliable extraction still triggers the existing error/Insufficient Evidence rules.

Clarification/email assertions remain preliminary and editable; advise review before use. Disable finding-specific copy/draft actions while Rejected and restore only the original eligible actions when the review choice changes. No automatic send, new category or extra AI call is introduced.

A complete processing response with no AI-identified topics shows **AI suggested no relevant requirement topics. Review the full extracted sources; relevant requirements may have been missed.** with explained zero metrics, retained inputs/sources and manual rerun. It does not certify absence or agreement; failure/incomplete output remains an error.

### Request Control, Errors and Recovery

Implements `prd.md > Error Recovery and Incomplete Analysis` and `Outdated Reports and Reanalysis`.

No automatic model retry/repair initially. A malformed/truncated response, upstream timeout, safety block or provider failure produces an incomplete/error state with retained inputs and Retry Analysis. An explicit retry is a new genuine run and consumes quota; reflect this in limits. No fabricated interim report.

Before starting, prevent duplicates, check global capacity, and reserve a generation attempt atomically. During processing keep the input snapshot immutable. After errors keep any previous report visibly outdated. A fresh complete empty outcome replaces current results with explained zero findings, never revives old findings for new inputs.

Use clear error codes internally with nontechnical messages and optional sanitized details: FILE_TOO_LARGE, PDF_PAGE_LIMIT, UNREADABLE_DOCUMENT, TEXT_CAPACITY, TEMPORARY_RATE_LIMIT, DAILY_CAPACITY, PROVIDER_UNAVAILABLE, INCOMPLETE_ANALYSIS. Public details must not expose secrets, document bodies, or raw provider payloads.

When Retry-After/reset information is known, display it accurately. Daily exhaustion is not solved by “try again in a few seconds.” If capacity tracking is unavailable, fail closed rather than make unbounded calls. No automatic paid upgrade.

## Data Model and Lifetime

- ActiveSession: files A/B, context, inputRevision, activeRequestId, request status, lastReport, reportRevision, complete source snapshots and client-only review choices. Lives in browser memory; changes through form/actions; cleared on reload/close.
- Review choices: map keyed by report identity and finding ID, bound to input revision; Pending / Accepted / Rejected / Uncertain. Review actions make no requests. Review choices stay with their report in active-session memory across navigation, errors and retries. Input changes mark both report and review choices **Outdated — Reanalysis Required**. Failed reanalysis retains that outdated work; a successful new analysis starts new suggestions at Pending review without transferring old acceptance. Refresh/close clears files, context, extracted sources, results and review choices.
- SourceDocument: sourceId, SHA-256 hash, filename, kind, bytes, extractionVersion, pages/passages. Backend original bytes and full registry exist only within the active analysis request, then backend references are released. Complete canonical snapshots and their hashes/page-line/passage mappings are transmitted to active browser memory for full-source inspection, subject to the same no-store/privacy lifetime.
- Passage: passageId, sourceId, PDF page index or TXT line span, canonical source text and optional offsets/position. Identifiers cannot override registry metadata.
- CandidateAnalysis: transient structured AI response, never directly rendered as trusted evidence.
- VerifiedReport: input revision, applicant snapshot, backend-constructed preliminary findings/evidence, counts, processing completeness/empty state and nonsecret pipeline/model version. “Verified” denotes application-controlled source matching, not verified reasoning, coverage or human agreement. Stored only in browser memory; backend releases it after transmission.
- Extraction diagnostics and benchmark measurements: source fixture IDs, hashes, versions, aggregate token/call/time/error results only. Do not log arbitrary user document text or applicant data.
- Quota metadata: only bounded counters, minute/day buckets, expiry, and short-lived request reservations; no files, extracted text, applicant fields or reports. This metadata-only service is selected in the approved architecture with Free database access confirmed by the project owner; no content storage is permitted.

Use private/no-store responses; no document-bearing CDN/cache entries, analytics payloads, URL parameters, or persistent client caches. Do not write uploads to backend files or an application database. Application reference release is not a claim of immediate physical memory erasure or Google deletion. Host access/security telemetry is separate and must be accurately disclosed.

## API and External Service Contracts

### Application Endpoint

Proposed `POST /api/compare`, multipart/form-data: documentA, documentB, context JSON, inputRevision, requestId and privacyAcknowledged. Server validates lengths, content, context, acknowledgment and capacity; ignores client page counts as proof.

Use a streamed NDJSON response for actual stage events followed by exactly one complete result or sanitized error. Events contain a request ID/revision; the browser discards superseded results. Validate errors before headers where possible; after streaming starts send an error event, not a current-looking partial report. Client handles abrupt connection loss as incomplete. This is a proposed transport detail to test on the selected host.

Do not create server-side document sessions, job queues, disk upload folders, or persistent analysis records. Backend calls the model during this bounded request; no background job survives as a promised application feature.

Add a **sources** event after complete extraction and capacity validation, before the combined model call, carrying both canonical document snapshots, hashes, page/line mappings and passage IDs. Bind it to request ID and input revision; discard stale or mismatched events. Retain the complete snapshots in active browser memory so sources remain inspectable if the later AI request fails. An interrupted transfer must not be labeled a complete source view. Reading/capacity failures keep their existing errors; partial text is not promoted to complete analysis. This extends the existing stream without a new endpoint, server session or extra AI request.

No review endpoint or persistent review record is added. Sources remain accessible after a later model error; failed/incomplete analysis is never relabeled successful merely because extraction succeeded. Escape source-view text, use private/no-store responses, and never log or cache document-bearing events.

### Gemini Candidate

Model initially evaluated: `gemini-3.5-flash-lite`. Standard generation API contract: `POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`, authenticated server-side using the supported API-key mechanism (SDK configured with the private key). Text payload includes fixed instructions, complete source passages/context, and JSON response schema/output settings. Parse returned content, finish status, safety/error fields and usage metadata. No external tools or search grounding.

Optional token-count utility: `POST https://generativelanguage.googleapis.com/v1beta/models/{model}:countTokens` with the constructed contents as required by the official API. Verify exact SDK/API fields and model settings when implementing. Count utility/continuation/retry requests separately from reasoning calls.

[Generation API](https://ai.google.dev/api/generate-content), [token counting](https://ai.google.dev/gemini-api/docs/tokens), [structured outputs](https://ai.google.dev/gemini-api/docs/structured-output), [model](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite), [data terms](https://ai.google.dev/gemini-api/terms).

The project owner verified AI Studio access without restrictions, Default Gemini Project billing tier Free, and no paid billing enabled. Quotas observed by the project owner:
- 3.5 Flash Lite: 15 RPM / 250,000 input TPM / 500 RPD.
- 3.1 Flash Lite: 15 RPM / 250,000 input TPM / 500 RPD.
- 3.5 Flash: 5 RPM / 250,000 input TPM / 20 RPD.
- Earlier 2.5 Flash observation: 5 RPM / 250,000 input TPM / 20 RPD; not part of the latest reconfirmed shortlist.

These are UI observations verified by the project owner, not an agent-inspected account or proof of successful API requests. Quotas are per project; extra keys do not increase them. Gemini documents midnight Pacific RPD resets and variable actual capacity. Model availability, remaining quota, exact token accounting and usable runtime settings need live verification. [Quotas](https://ai.google.dev/gemini-api/docs/rate-limits), [billing](https://ai.google.dev/gemini-api/docs/billing), [Pakistan eligibility](https://ai.google.dev/gemini-api/docs/available-regions).

At one generation per success, 20 successes nominally consume 20 requests. This leaves theoretical headroom in a 500-RPD Lite allowance, but a 20-RPD Flash candidate leaves no reserve. Input TPM, bursts, failures and real timing still matter. Sample API token/latency results now exist; production capacity and remaining quota remain unverified.

Groq remains a researched alternative, not an active fallback: published GPT-OSS 120B free limits include 30 RPM, 1,000 RPD, 8,000 TPM, 200,000 TPD; the token ceiling can be tighter than request count. Local CPU inference on the VM remains unbenchmarked. No model/provider switch without an evaluated quality/privacy basis and project owner agreement. [Groq quotas](https://console.groq.com/docs/rate-limits), [Groq data controls](https://console.groq.com/docs/your-data), [Ollama Windows](https://docs.ollama.com/windows).

Approved human-review amendment: the role of `gemini-3.1-flash-lite` in this approved architecture is limited to preliminary suggestion generation, subject to final 4-spec approval. It is not accepted for autonomous complete-comparison analysis, and the revised application has not been validated. Preserve the frozen benchmark and all failed outcomes. Model-selection benchmarks are closed; no further Gemini request, including utilities, retries or live release smoke tests, is authorized without separate approval. Cumulative usage remains **37 requests**; unused prior allowance does not authorize continuation.

### Selected Public Quota Guard — Upstash Redis Free

A public endpoint can exhaust a private key's allowance even when the key is never exposed. A counter in one Node/serverless process is not global and may reset on restarts.

Selected on 2026-10-20 following project-owner Free-access verification: Upstash Redis Free as a shared atomic quota store, not a document database. Backend-only REST URL/token credentials; no browser Redis access. Store only expiring numeric counters, time buckets, token-budget reservations and short-lived random request/lease identifiers. Never store uploaded bytes, extracted text, filenames/source hashes, applicant fields, reports, review choices, API keys or raw IP addresses. [Pricing](https://upstash.com/pricing/redis), [REST API](https://upstash.com/docs/redis/features/restapi).

Adopted initial application ceilings, subject to deployment validation: **100 Gemini generation attempts per provider day**, **10 generation starts in any rolling 60 seconds**, and **2 concurrent analyses globally** across all serverless instances. These are ceilings, not a promise of 20 successful comparisons/day. The earlier 20-success/20-retry/60-headroom split explains the planning reserve, not separate guaranteed pools. Provider day follows midnight Pacific with `America/Los_Angeles` daylight-saving rules, not Pakistan or fixed UTC midnight. [Gemini quota/reset rules](https://ai.google.dev/gemini-api/docs/rate-limits).

Use short atomic Redis scripts for check-and-reserve/release operations on one authoritative database; separate GET/check/INCR calls or a non-atomic REST pipeline are insufficient. Acquire a two-slot analysis lease before expensive extraction and hold it through model processing/report preparation. Once complete input is validated, atomically reserve its day/start/token budgets immediately before dispatch, tied to that lease. No partial reservation or third analysis may slip through a concurrent race; deny immediately with retry/reset guidance rather than add a background queue. [Upstash EVAL](https://upstash.com/docs/redis/sdks/ts/commands/scripts/eval), [atomic script behavior](https://upstash.com/docs/redis/features/key-locking).

Count each dispatched generation attempt, including HTTP errors, safety blocks, timeouts and malformed output; no automatic SDK retry. An ambiguous dispatch remains counted. Refund only a provably unused pre-dispatch reservation, atomically and idempotently; never refund a failed upstream attempt. Release leases idempotently after confirmed completion. Expiry must exceed the bounded processing lifetime plus cleanup margin, so a crashed request recovers without prematurely admitting overlapping work; if upstream completion is uncertain after timeout, retain its lease conservatively until safe expiry. All metadata expires; day counters survive until after that provider-day boundary. If Redis is unavailable, times out, returns malformed state or exhausts Free quota, fail closed with a safe service/capacity message and **do not call Gemini**. No process-local fallback or paid upgrade.

Effective admission also respects the actual project's model input/output/context and request/token quotas, with stricter limits taking precedence. The observed 15 RPM / 250K input TPM / 500 RPD remain owner observations, not a newly inspected account. Validate complete constructed input against the existing text/input-token gates; never truncate. Reserve input-token budget globally before generation; lower start capacity if actual TPM requires it. Count any authorized remote token-count utility separately from generation attempts and include utilities in overall provider-request/day headroom; 100 generation attempts must not be mistaken for 100 total upstream requests. Missing/uncertain effective quota information must not silently allow unbounded dispatch. An upstream 429 still produces honest retry/reset guidance. All such runtime calls remain prohibited until separately authorized.

Vercel WAF is defense in depth only, never the global guard. Public documentation lists Hobby fixed-window IP/JA4 rate counting, one rate-limit rule/project, 10-second–10-minute windows and 1M included allowed requests; counters are per-region. Use only included protections confirmed free in the actual Hobby project, otherwise omit the optional rule and retain Redis enforcement. Do not depend on Enterprise token buckets, arbitrary-header counting, paid rules, paid request overages or trials; do not publish a billable rule. [WAF limits and pricing](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting).

Validate the owned Free database and script behavior during authorized implementation/release work, including races, expiry, cancellation, failed dispatch accounting, token limits and fail-closed behavior. Measure actual Redis command use, including script-internal commands, denied requests and utilities; free command headroom is unmeasured and an abusive public endpoint can still exhaust it. No polling or permanent analysis records. Production availability and the 20/day target remain unproven. A conventional single-server alternative remains historical background, not an automatic fallback or a new selected architecture.

## Benchmark and Validation Plan

Isolated benchmark authorization (2026-10-15): use the approved Waikato PDFs and existing labeled synthetic cases; verify PDF.js extraction before model analysis. Hard limit: 30 external Gemini API requests across the entire benchmark, including model discovery, token counts, failures, and retries. Planned allocation: 1 model-list request, 2 complete-real-input token-count requests, 20 baseline generations (9 synthetic cases plus the Waikato pair for each of 2 models), and 6 repeat generations (2 additional runs each of contradiction, exception, and uncertain cases for the provisional leading candidate): 29 planned requests and 1 reserve. Count attempts before dispatch in a persistent local ledger; disable automatic retries and stop at the cap. Reserve use or failures may leave checks incomplete; do not exceed the cap or imply unrun checks passed. Use only free services, keep credentials in a gitignored local environment file, and do not enable billing. This limited run does not replace unexecuted expanded-suite, deployment, or release checks. Model selection and 4-spec approval remain pending.

### Approved Test Inputs and Provenance

Primary: Waikato complete official PDFs, approved by the project owner. See `devpost/testing/real-source-candidates.json` for URLs, measured sizes, SHA-256 hashes, dates, and page mappings:
- Postgraduate requirements: 9 pages, 334,878 bytes, updated April 30, 2026; key PDF pages 3, 5, 6, 8.
- College Prospectus 2026: 8 pages, 943,341 bytes; Academic English on PDF/printed page 4; exact publication date not established.
- Combined 1,278,219 bytes; all pages yielded text in earlier research with pypdf/pdfplumber and key pages were visually checked. This does NOT establish PDF.js extraction quality.

Distinguish standard tests from conditional Academic English pathways. Do not equate different certificate names or claim that any English course grants exemption. Missing qualification identity/applicant evidence remains explicit.

Secondary: Trinity policy/prospectus, larger-file/column/page-spread robustness. KAIST early/regular guides: decisive AND/OR wording was lost by two extractors; stress-test extraction and reject unsupported conclusions. Do not silently truncate these sources to fit public limits.

Synthetic pack: eight TXT pairs and nine expected cases in `devpost/testing/synthetic/expected-outcomes.json`: contradiction; separate program/intake/category differences; missing support; ambiguous applicability; reconciling exception; empty outcome; and unknown applicant category. Each source labels itself synthetic and uses a fictional institution. TXT references are excerpts/lines, not PDF pages. Gold answers are proposed for project owner review, not model results. Retain the public/synthetic-only boundary.

### Benchmark Procedure and Decision Gate

Historical autonomous-model benchmark plan, retained to preserve its original criteria and failures. The approved human-review amendment supersedes its autonomous pre-build gate only for the constrained suggestion workflow; it does not make that gate pass or change any expected outcome. These numbered instructions do not authorize further benchmarks, model switches or API requests. Existing production/evidence/privacy checks remain release gates; live release calls require separate approval.

1. Review expected topic-level answers and evidence locations before model runs. Add a consistent score case, a second contradiction wording, and a longer noisy/distant-exception case to reach the proposed 12-case core suite. Keep a small held-out set separate from prompt tuning.
2. First evaluate 3.5 Flash Lite using the complete supported inputs and one combined structured call. Compare the same hard cases with 3.1 Flash Lite and limited-quota 3.5 Flash if needed; a finalist must run the full suite. Do not claim generic superiority from marketing or model size.
3. Measure topic/exception coverage, applicability, classification, false contradictions, unjustified agreement/equivalence, explanations and clarification usefulness. Over-abstaining on every case does not pass.
4. Independently verify citation integrity and extraction against originals. Inject altered quotes, wrong-source/page/unknown IDs, invalid offsets and stale-input IDs into verifier tests. No fabricated or misattributed evidence may reach verified output.
5. Repeat the contradiction, exception and uncertain cases independently at least three times each to reveal instability. Record prompt/model/schema/extractor/settings versions, fixtures/hashes, request counts, input/output/total and thinking tokens when reported, truncations, retries and end-to-end elapsed time. Do not double-count thinking tokens or interpret missing usage as zero.
6. Check short/long supported files, complete-source coverage and dense-text rejection. Measure median and slowest observed latency, actual prompt tokens, production memory/duration, simultaneous requests and retry behavior. Model self-reported coverage is not an independent coverage check.
7. Proposed target for review: ordinarily complete supported samples within 120 seconds, abort the full request by 240 seconds when a 300-second host ceiling applies. These are candidate operating targets, not an SLA approved by the project owner or a measured result.
8. **Pre-build approval gate:** An explicitly authorized isolated API/extraction benchmark must demonstrate correct approved cases on final/repeat runs, no surviving known critical context/evidence errors, and measured call/token/latency budgets consistent with the 20/day target plus reserve. Review and choose the host/global quota design using those results and actual free-account limits. This can support approval of the technical plan and candidate model without building the application. A small suite is PoC evidence, not a general accuracy or availability guarantee.

   **Post-build release gate:** Once application development is explicitly authorized, validate the production bundle, deployed parser assets, actual host memory/duration, signed-out public access, concurrent requests, quota enforcement, and end-to-end recovery. These checks decide whether the chosen configuration is suitable to release, not whether the current planning stage may be approved. Failed release checks require fixes or a reviewed change; do not silently switch models/hosts or publish unsupported claims.
9. Only investigate a three-call pipeline if failures suggest a meaningful quality benefit. Compare the same held-out cases and full call/token/time costs before switching. Keep the shared interface and UI.
10. If free capacity/quality fails: evaluate the other free candidate, reduce supported workload explicitly without silently dropping content, or discuss a lower target/recording+repository fallback. Do not lower evidence standards or enable paid services without approval.

An isolated API/PDF.js benchmark completed on 2026-10-15 using 29 of 30 authorized external Gemini requests. Both models failed critical accuracy checks; no model was finalized. No deployment test has run. Full application development and 5-build remain prohibited. Manual AI Studio trials can explore reasoning, but do not validate backend extraction, API accounting, or deployment. Do not approve final model/architecture on manual chat results alone.

### Isolated Benchmark Results - 2026-10-15

Completed isolated evaluation: 29 external Gemini requests (1 discovery, 2 token counts, 20 baseline generations, 6 repeats), all HTTP 200; no retries or timeout/truncated generations. One reserve was unused and further calls are disabled in the completed harness. The credential remained in the gitignored local environment file. Both exact model IDs were account-visible and generated successfully; Free billing tier remains project-owner-reported, not independently inspectable with the API key. No billing was enabled.

PDF.js 6.4.299 extracted all 17 pinned Waikato pages; 25 decisive wording/page checks passed after visual review. Native item order preserved relevant table/column context; coordinate-only row sorting was unsuitable for the College columns. Full canonical extraction was supplied without truncation: 27,304 characters and 8,517 counted/actual prompt tokens per real comparison. Font warnings were retained as diagnostics; this is fixture-specific evidence, not a universal extraction guarantee.

Both models matched 7/9 synthetic expected categories. Including applicability and structural checks, baseline synthetic passes were 6/9 for 3.5 Flash Lite and 7/9 for 3.1 Flash Lite. Both failed the ambiguous-applicability and unknown-category cases and omitted decisive Waikato pathway conditions. Baseline median API latency was 5.589 seconds (3.5) versus 2.829 seconds (3.1); slowest responses were 15.454 and 25.668 seconds. All 58 returned passage-reference occurrences mapped to current source registries, while reasoning and semantic support still failed. Fifteen independent local verifier/guard tests passed.

For 3.1, three-trial repeat results were: contradiction category 3/3 but context/structure 2/3; reconciling exception 3/3; ambiguous applicability 0/3. The prompt/schema stayed fixed. A local validator correction distinguished missing certificate possession from unknown rule scope; original and rechecked verdicts are preserved. Neither model passes the selection gate. 3.1 is recommended only as a next-iteration evaluation candidate, not a selected model. The 20/day target appears plausible under reported quotas and measured sample token/latency use, but accuracy, remaining quotas, full-size inputs, held-out cases, hosting, concurrency and judging-period availability remain unresolved. No architecture, provider or input-limit decision is finalized by these results.

Full measured results, case failures, provenance and reproduction: [benchmark report](../evaluation/report.md), [offline visual report](../evaluation/report.html), [request ledger](../evaluation/results/request-ledger.jsonl), [machine-readable summary](../evaluation/results/summary.json). Expected answers remain proposed; 4-spec remains draft.

### Revised Single-Call Benchmark Plan - Authorized Evaluation Only 2026-10-19

The project owner approved the revised isolated evaluation on October 19, 2026 with a maximum of 30 additional Gemini requests and 59 cumulative, Gemini 3.1 Flash Lite only, and a mandatory eight-request failure checkpoint. It completed that checkpoint and stopped with critical errors at 8 additional / 37 cumulative requests. No further calls, model switch or billing change occurred. The original 29-request benchmark records and all pre-run frozen criteria remain unchanged.

Proposed improvements for evaluation only: distinguish rule scope from condition satisfaction; return a compact source-rule inventory with condition/exception-level passage references and auditable passage dispositions; apply uncertainty before classification and keep raw model outcomes separate from backend safeguards. No university-specific rule, canned result, additional AI call per comparison or product requirement change is proposed. The existing single-call interface, evidence registry, privacy, memory-only application design and file/page limits remain in force.

The authorized phase evaluated Gemini 3.1 Flash Lite only. Its planned 28 requests plus 2 reserves were not spent beyond the failed checkpoint. Five fresh hold-outs, revised prompt/schema, full suite and test-only gold were frozen before live requests; no expected outcome was changed after results. Only 5 of 15 planned baseline generations ran; all fresh generations and 10 repeat generations were deliberately unrun. The 22 unused additional requests do not authorize continuation after failure. No model was finalized for the approved autonomous MVP.

The proposed October 19-20 preparation/evaluation window leaves limited time for the saved October 26 Eastern submission deadline. Hosting/quota selection, explicit 4-spec approval and separate build authorization remain required; the compressed build/release schedule is an estimate, not a guarantee. Failure or delay requires a reviewed feasibility decision rather than silently reducing accuracy, evidence, scope or public-access requirements. 4-spec remains draft and 5-build remains prohibited.

Review the [revised plan](../evaluation/revised-single-call-plan.md), [offline visual companion](../evaluation/revised-single-call-plan.html), and [exact failed-output review](../evaluation/revised-failure-review.json) before deciding whether to approve this additional evaluation.

### Final Planned Evaluation - Failed Checkpoint 2026-10-19

Final planned evaluation completed October 19, 2026, before the requested October 20 target: 8 additional / 37 cumulative Gemini API requests, consisting of 1 model metadata request, 2 token counts and 5 single-call generations. All were HTTP 200, all generations schema-valid with STOP finish, with no retries or truncation. The checkpoint failed and both runtime closure and checkpoint guards block further calls. No application development, deployment or 5-build occurred.

Raw model results: S01 genuine contradiction and S07 reconciling exception passed one trial each; S06 ambiguous scope still returned Potential Contradiction despite an explicit comparison blocker; S09 unknown applicant category still returned Different Applicable Conditions without a known branch; Waikato returned only 4 postgraduate-policy rules and one unsupported one-source Consistent finding. The Academic English B/Level 8 route and waiver inventory remained omitted, and the relevant College pathway was wrongly excluded. Two-/five-year prior-study timing was recovered but case-by-case assessment was missing. Backend rejection did not count as raw reasoning success.

All 34 returned clause-reference occurrences resolved to their source registries, but semantic support and requirement completeness failed. All 35 Waikato passage IDs were accounted for while decisive passages were dismissed as background; model coverage declarations are not proof. The full revised Waikato input used 9,074 prompt tokens and 3,493 candidate tokens, below the existing test ceilings. Median generation API latency was 7.800 seconds and the slowest 9.746 seconds. Thirty-two local verifier/control tests passed before execution; frozen gold and source data were not changed.

At the failed checkpoint, Gemini 3.1 Flash Lite was not accepted for the then-approved autonomous complete-comparison MVP in this configuration; it remains unsuitable for that autonomous role. No further model-selection benchmark is automatically scheduled. At the failed-checkpoint report, the proposed next decision was a human-reviewed, evidence-first comparison draft assistant, with unreviewed AI suggestions, backend-built excerpts, explicit non-exhaustive coverage, no automatic eligibility conclusions and human confirmation before a finding is treated as reviewed. The project owner subsequently approved the human-review amendment on 2026-10-19; its scope/PRD changes are now applied. This reduces autonomy and adds review effort; it is not a validated replacement or a finalized architecture. Existing approved privacy, stack, source integrity, memory lifetime and file/page boundaries remain in force. At that stage free hosting/global quota choices remained open; on 2026-10-20 they were provisionally approved and subsequently selected after project-owner Free-access confirmation, with Hobby eligibility still unresolved. Explicit 4-spec/build approvals remain open.

Measured results and proposed constrained scope: [final evaluation report](../evaluation/phase2/report.md), [offline visual report](../evaluation/phase2/report.html), [raw/dimension/criterion scores](../evaluation/phase2/results/summary.json), [phase ledger](../evaluation/phase2/results/request-ledger.jsonl). 4-spec remains draft. The benchmark record itself did not approve a scope change; the subsequent human-review amendment approval is recorded separately below.

### Application Acceptance Checks

- Both validation layers reject oversized/over-page/invalid inputs; valid Waikato pair fits; no silent truncation.
- Required explicit degree/program/two files validated; Not sure accepted and uncertainty preserved.
- Actual progress and duplicate prevention; structured combined call; privacy acknowledgment before transfer.
- Four categories, one topic/primary classification, correct three count equations; no similarity/confidence percentages.
- Correct PDF page/filename and TXT excerpt references, exact evidence, explicit source gaps and accessible expansion.
- Copy actions and editable mailto draft without automatic sending or invented references.
- Navigation/retries/errors retain work; edits mark outdated; stale responses ignored; only successful reanalysis replaces old results.
- Empty complete processing has zero metrics/no fabricated findings; failures/partial output never masquerade as empty success.
- Responsive, focus/contrast/touch/keyboard checks at all four approved widths.
- Refresh/close clears work; no browser/disk/database content persistence or content logging; production authentication disabled for judges.
- Host/limiter/provider failures have nontechnical recovery, no secret leakage, no paid fallback.

Additional approved human-review checks: preliminary labels; independent review controls with no requests or guard bypass; all extracted source passages/pages accessible without a fidelity guarantee; stable category equations and separate review counts; rejected-finding action restrictions; review retention/outdated/reset rules; no false completeness/accuracy badges. Reuse recorded failed outputs for no-network safeguard tests, separately from raw semantic scores. Test doubles must never become runtime judge answers. Local tests cannot prove genuine deployed AI operation: a small live end-to-end release check needs separate API authorization and is not another model-selection benchmark.

## Annotated File Structure

Planned application files; application development has not started. The isolated evaluation/ harness now exists separately; its actual filenames are documented in evaluation/README.md and differ from the illustrative planned evaluation filenames below. Existing devpost/testing fixtures and planning documents are preserved.

```
RuleGuard-AI/
  package.json                  # Documented scripts and pinned dependencies
  package-lock.json             # Reproducible installation
  next.config.ts                # Node/PDF asset packaging; security/cache settings
  tsconfig.json                 # TypeScript configuration
  .env.example                  # Variable names only; no secrets
  .gitignore                    # Exclude local credentials, build and research artifacts
  README.md                     # Setup, free-service limits, tests, demo and provenance
  public/samples/               # Only approved-to-distribute static samples/manifest
  src/
    app/
      layout.tsx                # Theme and mounted session provider
      page.tsx                  # First screen/input journey
      results/page.tsx          # Results from active session; redirect if absent
      api/compare/route.ts      # Node multipart validation + progress/result response
      globals.css               # Ivory/emerald editorial tokens and accessible base styles
    components/
      DocumentUpload.tsx        # Both file cards, client checks and inline errors
      ApplicantForm.tsx         # Explicit degree, program, optional context
      PrivacyNotice.tsx         # Public/synthetic acknowledgment and disclosure
      SessionNotice.tsx         # Refresh/close loss warning
      AnalysisProgress.tsx      # Honest five-label progress with shared AI helper
      ResultsDashboard.tsx      # Applicant snapshot, counts, categories
      FindingCard.tsx           # Preliminary topic, explanation and independent review controls
      EvidencePanel.tsx         # Exact excerpts/page links, responsive pairing; full-source entry
      FullSourceView.tsx        # All extracted pages/passages, including uncited text; no fidelity claim
      ClarificationActions.tsx  # Copy and mailto
      RecoveryMessage.tsx       # Retry/replace/outdated/empty states
      *.module.css              # Component layout and responsive styling
    state/session.tsx           # Memory-only files/context/sources/report/revisions/review choices
    shared/
      contracts.ts              # Request/sources-event/preliminary-report/review types
      schemas.ts                # Runtime validation schemas
      limits.ts                 # Nonsecret centrally defined limit values
    server/
      config.ts                 # Validated backend env; secrets never exported
      analysis-service.ts       # Orchestrates bounded request
      pipeline.ts               # Stable pipeline interface
      pipelines/single-call.ts  # Initial combined reasoning implementation
      providers/gemini.ts       # SDK/API, timeout, finish and usage handling
      documents/pdf.ts          # Page-wise extraction and diagnostics
      documents/txt.ts          # Declared encoding + line/excerpt mapping
      documents/passages.ts     # Hashes, canonical text, immutable IDs
      documents/input-limits.ts # Bytes/pages/aggregate/text-token gates
      evidence/validate.ts      # Registry/offset/source identity checks
      evidence/report.ts        # Build quotations, findings and counts
      quota/guard.ts            # Swappable global reservation interface
      quota/redis.ts            # Atomic metadata-only Upstash Free reservations; fail closed
      progress.ts               # Actual operation events
      errors.ts                 # Safe error mapping, no content logging
    lib/
      clipboard.ts              # Copy helper/fallback
      email.ts                  # Encoded editable mailto and plain email text
  tests/
    unit/                       # IDs, offsets, counts, bounds and safe error behavior
    integration/                # Pipeline/finish/limiter/stale-input failure contracts
    e2e/                        # Real browser journey and four viewport widths
  evaluation/
    README.md                   # Only after isolated evaluation is authorized
    runner.ts                   # Planned real benchmark, not a canned result system
    results/                    # Public/synthetic aggregate measurements, no secrets
  devpost/
    learner-profile.md          # Existing experience and review preference
    scope.md                    # Approved boundary
    prd.md / prd.html           # Approved behavior and visual review
    spec.md / spec.html         # This canonical draft and offline companion
    testing/                    # Existing source manifest + labeled TXT fixtures
```

## Important Failure Modes and Recovery

- Extraction omits decisive conditions: known bad extraction blocks supported conclusions; identified unsupported topics are unresolved. Entirely unreadable sources fail reading with replacement guidance.
- Model returns wrong references or malformed/truncated output: invalid evidence rejected; semantic errors remain benchmark failures; incomplete processing never produces a current complete report.
- Provider/host/counter service unavailable or quota exhausted: bounded request ends with safe error, retained browser inputs, accurate retry/reset guidance and unchanged outdated report. No paid or canned fallback.
- Input revision changes before response: discard stale response; never attach old evidence to revised input.
- Refresh/close: intentionally clears work with visible prior notice, without promising cross-refresh recovery.

## What Was Simplified and Why

- One narrow requirement domain and two readable formats; no OCR, URLs, Word, extra admissions domains or automatic authority selection.
- One application and one combined reasoning call initially; no multi-agent analysis, vector database, retrieval service, background jobs or unnecessary verification AI call.
- Full supported source text rather than retrieval that can omit a decisive exception; reject inputs exceeding declared budget.
- Memory-only documents/reports; no accounts, report history or permanent storage.
- Clipboard/mailto rather than Gmail/Outlook integrations.
- Upstash Redis Free is selected only for temporary global quota metadata; it is not a document database. Free database creation and TLS/SSL were confirmed by the project owner; production connectivity and command use remain untested.
- Premium responsive presentation supports the evidence journey; no generic chat interface, similarity score or simulated demo.

## Decisions and Essential Open Issues

### Confirmed Project Decisions

The approved sections above capture stack, single-call benchmark, evidence registry, memory-only lifetime, privacy boundary, file/page limits, public judge experience, genuine analysis, 20/day planning target, dates, Waikato selection, synthetic retention, visual direction and no paid services without approval. Do not reopen onboarding, account setup, stack choice, storage choice or pipeline preference.

### Genuine Uncertainty and What Clarified It

Local inference feasibility was a genuine uncertainty. Correcting the environment to a CPU-only VM and distinguishing model-file size from total runtime memory clarified why hosted evaluation is more practical. No local speed/accuracy result was invented.

Evidence reliability was another substantive issue: visual inspection of KAIST showed logical connectives missing from two text extractors. Therefore traceable passages do not themselves prove faithful extraction or correct reasoning. Preserve separate extraction/citation/reasoning validation gates.

### Only Essential Remaining Decisions

The project owner explicitly approved 4-spec and accepted the documented Hobby eligibility uncertainty on 2026-10-20. Personal Free-account access is project-owner-verified; hosting, metadata-only quota controls and the constrained Gemini role are selected. No further architecture approval or model-selection benchmark is required to implement the application. The uncertainty remains disclosed rather than certified resolved by Vercel.

5-build and local implementation/testing are authorized. Separate permission is still required before any additional live Gemini request (including token utilities and retries) and before public deployment. Configure credentials privately during development. Production validation and the final hands-on review remain release gates, not reasons to reopen the approved architecture.

Routine details (module filenames, CSS tokens, schema implementation and readable error wording) can follow this draft without another interview round. The 100/day, 10/minute and 2-concurrent ceilings are adopted initial limits subject to deployment validation. Existing text/token/time defaults remain as recorded and cannot override actual provider limits; no capacity or uptime guarantee is implied.

### Approval and Handoff Status

This specification is **APPROVED** on 2026-10-20, including the documented Hobby eligibility uncertainty. 5-build/local implementation is explicitly authorized. Follow devpost/checklist.md; no paid services or extra scope. Live Gemini requests and public deployment remain blocked pending separate authorization. Benchmark failures, privacy safeguards, human-review limitations and later production checks remain in force.

Human-review amendment approved on 2026-10-19: [approved amendment](human-review-amendment.md). This records approval of the amendment separately from the original document approval. At that amendment handoff, the technical specification remained DRAFT and implementation was not yet authorized. Final 4-spec approval and local 5-build authorization followed on October 20; additional Gemini calls and public deployment still require separate approval.


### Final 4-spec Readiness — 2026-10-20

Architecture is documented for review: one Next.js/React/TypeScript application, PDF.js/TXT reader and immutable evidence registry, genuine single-call Gemini 3.1 Flash Lite preliminary findings, backend-controlled citations, complete extracted-source inspection, independent human-review choices, dashboard and editable clarification drafts. No original accuracy-benchmark pass is claimed. All approved privacy, memory-only content lifetime, 2,000,000-byte/file, 15-page/PDF, complete-input and human-review requirements remain intact. Initial multipart ceiling remains 4,100,000 bytes with measured-overhead/host validation required.

Hosting architecture is finalized in this approved specification; the personal Free-account access blocker is closed by the explicit project-owner report. No further architecture or account-setup interview is needed. The remaining qualification is Hobby eligibility for this prize-bearing personal demo: it remains UNVERIFIED pending clarification, separate from the confirmed account access. Do not represent account activation as provider permission. The project owner explicitly accepted that documented uncertainty when approving 4-spec and authorizing local implementation; this is not provider certification. If Hobby proves unsuitable, discuss a free alternative rather than enable billing.

Post-build release gates remain PDF.js production packaging, complete-source/event transmission, body limits, shared quota races/failures/token headroom, signed-out judge access, privacy/cache checks, responsive review workflow and separately authorized genuine end-to-end AI smoke checks. These are not completed tests. Keep a tested public URL target of October 25 before the October 26 Eastern deadline; the remaining time is tight, and no delivery/uptime guarantee is made.

No Gemini requests, benchmark rerun, application code, resource creation, billing change, deployment or 5-build occurred during this finalization. Cumulative benchmark usage remains 37 requests. Scope/PRD now record the approved Waikato selection and established privacy handling; their HTML companions are synchronized. 4-spec remains **DRAFT** pending explicit approval.


### Final Approval and Build Authorization — 2026-10-20

4-spec is **APPROVED** by the project owner, including the documented Vercel Hobby eligibility uncertainty. Starting 5-build and local application implementation/testing is explicitly authorized. No new features, paid services, additional live Gemini calls or public deployment are authorized. Credentials stay private in ignored environment files and later secure host settings. Earlier planning status statements are historical, not a renewed approval gate. Follow devpost/checklist.md for implementation progress; live-call permission and public-deployment permission remain separate.

## Degree-Aware Local Verification — 2026-10-20

Approved degree-aware extension implemented locally without changing the single combined generation, model, quotas, file limits, privacy, free hosting architecture or human-review role. Explicit degree selection has no default. The same supported complete source content is sent with the selected degree; filenames are omitted from model input to avoid filename cues, while display names and exact source references remain backend-owned. No university-specific classifier, answer table or runtime fixture fallback was added.

Validated assessments appear separately for both documents before findings. An exclusive supported mismatch returns the blocked applicability event without a report; acknowledgment cannot override it. Mixed/general documents compare selected/general rule branches only; findings referencing other-degree rules are rejected. Unknown rule scope is guarded to Insufficient Evidence. Declared conflicting/missing degree evidence makes document scope uncertain. The same validated response is held in memory until explicit continuation, with acknowledgment required for uncertainty and an unverified-degree report notice. Edits clear held decisions/acknowledgment/reviews and mark an existing report outdated. A failed retry retains the last complete outcome.

Offline regression found and reproduced a truncated-transfer defect: a terminal result followed by an incomplete frame could leave reveal controls available despite an error. The client now commits a new outcome only after a clean, single-terminal stream; the regression passes. No citation, coverage or security predicate was relaxed.

Mechanical verification on Node 24.19.0: **62 unit/integration tests and 15 browser tests passed**, plus lint, typecheck, production build and PDF function-trace verification (530 files, 56,766,177 bytes on Windows). Browser tests ran against the actual local production server, with genuine local extraction/AI-disabled error handling and explicitly intercepted test-only outputs for gate/dashboard scenarios. Both approved Waikato PDFs remain readable in the local extraction test. Main input, uncertain assessment and expanded results were checked at desktop/mobile widths spanning 320–1920 px; no horizontal page overflow was detected. Canonical content of scope/PRD/spec HTML matches Markdown; existing companion CSS and JavaScript remain unchanged. File-URL browser preview remains unavailable; no browser-rendered companion check is claimed.

Coverage includes matching Bachelor's and Master's, opposite-degree mismatches in both directions, mixed sections and general policy, acknowledgment and non-overridable mismatch, invalid/cross-source applicability citations, stale degree changes before/after continuation, degree-specific conditions/exceptions, retained Master's review/email/quality behavior, legacy-contract rejection, interrupted transport and retry recovery. Outputs used by these regressions are offline fixtures; they are not measured Gemini reasoning results. Original saved S01 response and frozen model-selection fixtures remain unchanged. A historical S01 UI replay explicitly adds an offline uncertain gate rather than attributing new fields to the genuine old response.

**Local review ready; revised release readiness pending.** No new Gemini calls were made; cumulative usage remains **40** and live access is disabled. The new response schema/prompt's provider compatibility, degree reasoning, mixed-branch/exception completeness, token use and latency have not been checked live. Existing model reasoning failures remain disclosed. No offline test proves semantic entailment, complete/accurate extraction or degree identification, document authenticity, official status or publication currency. Separately authorized live validation and project-owner local review remain required before calling this revision release-ready. Hosted Linux packaging, environment setup, anonymous public access, actual request/duration limits, real Upstash concurrency/outage behavior and availability during judging remain hosted-only checks. The accepted development-tooling advisory and Hobby eligibility uncertainty are unchanged.

Timeline: implementation and offline checks are complete on October 20, six calendar days before the October 26 submission date. No new infrastructure or additional model call per comparison is needed. Delivery remains feasible subject to prompt local review, separately approved live validation and the existing hosted release checks; the deadline and judging availability are not guaranteed. 6-ship, public deployment, publishing, Devpost submission, billing and additional Gemini requests remain blocked pending separate approval.

## Editorial UI Verification — 2026-10-21

The approved visual revision is implemented locally: light ivory/white surfaces, charcoal text, deep emerald actions, restrained terracotta accents, editorial serif/sans-serif typography, compact horizontal navigation and a persistent session-loss notice. The oversized sidebar and orbit decoration are removed. Native degree-choice cards retain the same explicit selection and state handler; program placeholders adapt to degree. Upload, context, privacy, progress, error, mismatch, uncertainty, empty-result and email states share the new readable presentation.

Findings show exact source quotations before AI interpretations, open the first finding's evidence by default, and retain readable two-column evidence on wide screens with a single-column mobile layout. Applicability evidence uses native expandable controls; source text and existing missing-information/guard notices remain available. Review choices, full-source jumps, editable drafts, stale-report guards and all disclaimers remain intact. No backend, shared schema, model/prompt, session-state, quota, dependency or service configuration changed. This is not a new reasoning or deployment validation.

Verification on Node 24.19.0: **62 unit/integration tests and 17 browser tests passed**, plus typecheck, lint, production build and the unchanged PDF trace check. Final browser tests ran against the actual local production build with live Gemini explicitly disabled. Real local extraction/AI-disabled handling remains covered. New UI tests use isolated synthetic transport fixtures, test unselected and keyboard-operable degree choices, adaptive placeholders, exact quotation retention and ordering, review/email behavior, loading/error/empty recovery and full-source access. Main input, gate and expanded result layouts were checked at 320, 375, 768, 1366 and 1920 px (existing tests also cover 390). No horizontal document overflow was found. Tested text/background pairs meet a 4.5:1 contrast ratio; key touch targets are at least 44 px and native degree choices show keyboard focus. This is targeted testing, not a claim of complete accessibility certification. No known blocking visual/accessibility issue remains in the tested states; project-owner visual review remains pending.

Production-build screenshots are local, ignored artifacts: `test-results/editorial-home-1366.png`, `editorial-home-375.png`, `editorial-findings-1366.png`, `editorial-findings-375.png`, and their viewport/evidence variants. Dashboard screenshots are explicitly **offline design fixtures**, not new Gemini findings. The application has no fixture fallback. Both PRD/spec HTML companions contain the complete synchronized canonical Markdown; their existing document-viewer CSS/JavaScript is retained. The product's old dark design is superseded by the October 21 amendment, not by a technical architecture revision.

No Gemini requests were made; cumulative usage remains **40** and access is disabled. No billing, public deployment, repository publication, Devpost submission or 6-ship occurred. Existing live degree-reasoning/provider-contract and hosted-only checks remain pending, along with the accepted tooling advisory and Hobby eligibility uncertainty. Local implementation and offline design review are complete on October 21; this adds no infrastructure or new API calls to the approved comparison workflow. The October 26 release target remains subject to the existing approval and verification gates.
