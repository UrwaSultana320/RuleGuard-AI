---
doc: human-review-amendment
status: proposed
updated: 2026-10-19
stage: 4-spec-draft
---

# RuleGuard AI — Minimal Human-Review Amendment

**For review only.** The human-reviewed direction is conditionally approved; the amendments below are proposed, not applied. The approved scope and PRD remain intact; 4-spec remains DRAFT. Approval of this amendment alone does not authorize 5-build, deployment, or further Gemini requests.

## Why this still demonstrates RuleGuard AI

The core remains a genuine AI comparison of two complete, bounded documents against applicant context: suggested requirements, applicability, conditions, exceptions, classifications and clarification questions, with application-controlled source references. The dashboard remains the main result. Full extracted-text access supports checking the comparison; it does not replace AI analysis with a document viewer. No university-specific rules, fixed answers or simulated judge results are introduced.

The final benchmark failed S06, S09 and the Waikato pathway comparison. Human review does not repair those results or establish model accuracy. It changes the product's claim and adds a way to inspect and respond to fallible suggestions. The model can still omit requirements or misunderstand applicability despite a valid citation. See the unchanged [final evaluation report](../evaluation/phase2/report.md).

## Proposed scope.md changes

Apply only the following targeted amendments, leaving unrelated approved text unchanged.

### The Core Loop

Current: “Findings distinguish confirmed agreements, potential contradictions, different applicable conditions, and requirements that cannot be verified.”

Proposed: “Preliminary AI findings suggest agreements, potential contradictions, different applicable conditions, and requirements that cannot be verified. Users inspect cited evidence and the full extracted source text, then accept, reject, or mark each suggestion as uncertain. These review choices do not establish accuracy, applicant eligibility, or complete requirement coverage.”

### What “Working” Looks Like

Qualify the visual report as preliminary AI suggestions requiring human review. Keep applicant-context analysis, the three demonstration cases, source-supported reasoning and university clarification questions. Add: “A completed processing run does not mean all requirements were found. Human acceptance records a review choice, not proof that a finding is correct.”

The existing correctness expectations remain desired behavior and test criteria. Record the failed model cases as failures; do not rewrite their expected outcomes or claim this amendment makes them pass. The narrower release claim is a functioning, evidence-traceable review workflow with disclosed AI limitations, not autonomous reliable coverage.

### The POC Boundary

Add only: “Include an in-session full extracted-text view and per-finding review choices. Keep the existing narrow English-language Master's comparison scenario, two documents, and all format boundaries. Do not add a manual rules editor, document annotation platform, report history or additional requirement domains.”

## Proposed prd.md changes

### Core Journey; Results Dashboard; Context-Aware Comparison

Keep the dedicated dashboard, applicant profile, four categories, expandable findings and navy/violet/cyan responsive design. Add a persistent report notice and a preliminary label on every finding:

“AI suggestions — human review required. Findings may be incorrect or incomplete. Check conditions and exceptions in the full extracted sources. Accepting a finding does not confirm accuracy or admissions eligibility.”

Each displayed suggestion starts **Pending review**. Add **Accept**, **Reject**, and **Mark uncertain**, plus a way to return to Pending review. The review choice is independent of the system's four-category classification: accepting Insufficient Evidence cannot turn it into Consistent or waive missing evidence. A review choice never changes quotations, page references or validation results. Rejected suggestions remain visible and clearly labeled; they are not silently deleted.

### Finding Classification and Dashboard Counts

Keep all existing category equations and one topic per primary category. Qualify the three existing metric labels as **AI-suggested requirements compared**, **AI-suggested unresolved findings**, and **AI-suggested topics assessed**. Explain that they count all displayed, validated suggestions, including rejected ones, and do not measure source coverage or human agreement. Review choices do not alter these totals. Show a compact review summary for Pending, Accepted, Uncertain and Rejected; those four counts sum to the displayed suggestions. This separates review progress from evidence/classification rather than adding another scoring system.

### Evidence and Next Steps

Extend View Evidence with **View full extracted source** for either document, including pages/passages the AI did not cite. Show all extracted text in canonical page order, with filename, PDF page indexes or TXT line spans and passage identifiers. A cited passage links to its location in this text. Long content may scroll or expand but must not be omitted. Explain that this is extracted text, not a guarantee of original PDF layout or extraction fidelity; known unreliable extraction still triggers the existing error/Insufficient Evidence rules.

Keep clarification questions, editable email drafts, Copy Question, mailto and copy fallback for Potential Contradiction and Insufficient Evidence. Clearly label draft assertions preliminary and advise review before use. Disable these finding-specific actions while a finding is Rejected; changing its review choice restores the original eligible actions. No automatic email sending, extra AI call, new email integration or new draft-generation category is added.

### Empty Results; States and Boundaries

Replace “No relevant requirements found” and its claim that neither document contains relevant requirements with: **“AI suggested no relevant requirement topics. Review the full extracted sources; relevant requirements may have been missed.”** Keep explained zero metrics, retained inputs, manual rerun and no invented findings or agreement. Apply this wording consistently in the journey, states and acceptance criteria. Failed or incomplete processing remains an error, never an empty success.

### Recovery and Report Validity; Acceptance Criteria

Preserve navigation/error/retry behavior. Retain review choices in the active session with their report. Input changes mark that report and its review choices Outdated — Reanalysis Required. Failed reanalysis retains the outdated report; a successful new analysis starts new suggestions at Pending review without transferring old acceptance. Refresh/close clears all work. Add observable checks for these behaviors, full-source access, the preliminary labels, count separation and the inability to bypass evidence safeguards through acceptance.

## Proposed spec.md changes

### How This Works; Pipeline; Evidence and Finding Validator

Describe successful output as a complete processing response containing preliminary suggestions, not a complete inventory of requirements. Keep the single combined AI call, generic reasoning prompt, all source text within the approved limits, four category rules, backend evidence reconstruction and structural/unknown-context guards. Keep malformed, truncated or incoherent-output rejection. Human review cannot expose invalid references as supporting evidence, repair raw reasoning scores, or override a guard to approve a conclusion. If no usable report can be produced, show the existing analysis error and recovery guidance rather than manufacturing findings.

**Proposed model role:** use `gemini-3.1-flash-lite` only as the known-limited preliminary suggestion generator, subject to final 4-spec approval. This is not acceptance for autonomous analysis and not evidence that the revised application works. Preserve the frozen benchmark and all failure records unchanged. Model-selection benchmarks are closed. No more Gemini requests, including utilities, retries or runtime smoke tests, without separate approval. Current cumulative usage remains **37 requests**; unused earlier allowance does not authorize continuation.

### Document Reader; API Contract; Data Model and Lifetime

Reuse the existing reader, immutable passage registry and proposed `POST /api/compare` NDJSON stream. Add one proposed **sources** event after complete extraction and capacity validation, before the model call, carrying both canonical document snapshots, hashes, page/line mappings and passage IDs. This supplies full-source inspection even if the later AI call fails. Bind it to request ID/input revision; reject stale or mismatched events. An incomplete source transfer is not labeled a complete source view. A reading/capacity failure still shows its existing error; no unsupported partial analysis is promoted to success.

Keep these snapshots in browser memory for the active session, alongside files/context/report. Backend retention remains bounded to the active request; no server document session, extra AI call or persistent storage is introduced. Treat all rendered document text as untrusted text. Existing no-store/cache, logging and privacy restrictions apply to the event and source view too.

Add a client-only review map keyed by report identity and finding ID, bound to its input revision, with values Pending, Accepted, Rejected or Uncertain. No review endpoint or database. Reuse session state, FindingCard, EvidencePanel, ResultsDashboard and ClarificationActions; add only a small full-source view component. Extend shared event/report types and existing tests, not the service architecture. The illustrative file tree gains only that view component and annotations for review state/types.

### Verification and Release Claims

Test citation identity separately from semantic support and review behavior. Reuse recorded failed outputs in no-network tests to prove safeguards and limitation messages; test doubles must never serve as runtime judge answers. Check all extracted passages/pages remain accessible, review changes make no requests, invalid citations cannot be accepted into supporting evidence, review counts/category totals remain correct, stale results cannot inherit acceptance, and privacy/error/responsive behavior remains intact. An accepted badge must never become an accuracy, official approval or completeness badge.

The original raw reasoning acceptance failures remain recorded. Local tests cannot prove genuine deployed AI operation. A small, separately authorized live end-to-end release check will be needed before claiming that the public application works; it is not another model-selection benchmark and is not authorized here.

## Explicitly unchanged

Next.js/React/TypeScript in one app; PDF.js and TXT extraction; 2,000,000 bytes per file and 15 pages per PDF; dual-layer validation; no silent truncation; existing proposed aggregate/text/token limits and their pending status; honest five processing stages; backend-only API credentials; exact registry-built quotations and page references; unknown/unsupported evidence rules; no paid fallback; no automatic retries or model switching.

Public/synthetic documents and nonsensitive context only; pre-submit privacy acknowledgment and Google's separate Free Tier data-use disclosure; unofficial admissions status; memory-only storage; refresh/close loss notice; no content logging, database, browser storage or backend files. Review state adds no personal-data collection.

Public browser access without judge registration or API keys; approved Waikato pair plus labeled synthetic samples; genuine AI for every new comparison; public GitHub setup/testing backup and demo video. The target remains 20 completed comparisons/day with retry/testing reserve, not guaranteed capacity. Preserve the submission deadline October 26 at 5 PM Eastern, October 27–30 judging hours, and November 5 availability buffer. Hosting/limiter proposals remain unapproved and production capacity remains unverified.

## Feasibility before October 26

**Plausible, but tight and conditional.** There is no application implementation yet. This amendment adds bounded client review state and source inspection to the existing architecture; it avoids a new model pipeline or platform. The largest uncertainties are hosted PDF.js packaging/streaming, free-account deployment, shared quota protection, and actual end-to-end operation. Human review does not eliminate the model's known applicability and omission failures.

Conditional schedule, not a 5-build checklist: finish amendment/architecture review by October 20; after explicit build authorization, reserve October 20–23 for implementation and local verification, October 24–25 for authorized deployment/release checks, documentation and video, and October 26 for final fixes/submission. Aim for a tested public URL by October 25 rather than the deadline hour. This assumes focused development time, prompt account access and no major hosting blocker; it is an estimate, not a delivery guarantee.

Public documentation rechecked October 19: Vercel Hobby remains free for personal/noncommercial use, with a 300-second function maximum; its published request/response ceiling is 4.5 MB. Free limits can pause service. The existing conservative transport proposal still needs production testing. [Vercel Hobby](https://vercel.com/docs/plans/hobby), [function limits](https://vercel.com/docs/functions/limitations).

Upstash's Free plan lists 500K commands/month and 250 MB; it remains a candidate for metadata-only shared quotas, not a selected or account-tested service. Its anonymous instant database expires after three days unless claimed, so that shortcut cannot cover judging unattended. Use an owned Free account if this candidate is approved; do not add a card or enable upgrades. [Upstash pricing and Free-plan FAQ](https://upstash.com/pricing/redis).

These published plans support investigating a free deployment; they do not prove account eligibility or uptime through judging. Reusing measured Waikato usage, 20 generations would consume about 181,480 input tokens/day and 20 generation requests, before count utilities, failures or retries. This is nominally below the owner-observed 500 RPD; minute limits, shared project traffic and availability still apply. Human review adds no API usage. Do not claim 20 successful comparisons are guaranteed.

Only two consequential planning approvals remain after this amendment: finalize the constrained generator role and free host/global quota guard in the DRAFT spec, then approve the completed 4-spec. No automatic transition to 5-build. If deployment validation fails, disclose that promptly; the public repository/video are submission backups, not substitutes for the requested working public URL. Never hide unavailable AI behind canned answers.

## Review boundary

Approving this proposal authorizes applying these targeted amendments to scope.md, prd.md and spec.md and synchronizing their HTML companions. Preserve unrelated approved requirements and benchmark history; record the amendment approval separately from original approvals. Keep spec.md DRAFT until separately approved. Until then, all six original planning files remain unchanged. No Gemini request, application coding, package installation or deployment was performed for this proposal.
