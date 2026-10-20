---
doc: checklist
status: approved
---

# RuleGuard AI Build Checklist

Build mode: fast implementation with an early local hands-on checkpoint and final review. Execution is explicitly authorized on October 20, 2026; the following order is derived from the approved scope/PRD/spec. The instruction to start implementation takes precedence over a further planning interview. This is not an authorization for Gemini calls or public deployment.

Current checkpoint: slice one is implemented and mechanically verified; awaiting the project owner’s first local hands-on review and separate permission for live API verification. Do not rebuild completed functionality on resume; resolve this checkpoint first.

## Slices

- [ ] **1. Compare two documents through the real application pipeline locally**
  Becomes usable: Polished input journey, PDF/TXT reading and full-source inspection, genuine Gemini adapter with server-controlled live-call permission gate, evidence validation, preliminary dashboard, review choices and clarification drafts. Disabled/unavailable AI produces an honest error, never a simulated report.
  Why now: Puts the comparison kernel and extraction/evidence risks in the first usable version instead of postponing them behind UI scaffolding.
  PRD ref: `prd.md > The Core Journey`, `Evidence and Next Steps`, `Human Review and Full Extracted Sources`
  Spec ref: `spec.md > Components`, `API and External Service Contracts`, `Data Model and Lifetime`
  Build: Bootstrap Next.js; implement memory-only UI, full-source streaming, combined pipeline, quota guard and citation validation; wire review and email actions. Keep live Gemini requests disabled pending separate permission.
  Verify (mechanical): Typecheck, lint, no-network unit/integration tests, production build, browser input/extraction/error journey. Test recorded AI responses only as test fixtures; never expose them as application results.
  Learner check: Open localhost, inspect the design, load two public/synthetic documents and inspect full extracted sources. After separate permission, verify the real AI journey. Report usability problems before expanding the build.
  Commit: `Build local document comparison and human review workflow`

- [ ] **2. Verify the complete local journey and prepare a reproducible judge-ready build**
  Becomes usable: Tested recovery, staleness, responsive evidence/review, sample provenance and documented local startup; readiness evidence for later authorized deployment.
  Why now: Real workflow feedback can guide fixes; the deployable application needs verified boundaries, not more features.
  PRD ref: `prd.md > Key Acceptance Criteria`, `Error Recovery and Incomplete Analysis`, `Outdated Reports and Reanalysis`
  Spec ref: `spec.md > Application Acceptance Checks`, `Selected Public Quota Guard — Upstash Redis Free`, `Final 4-spec Readiness — 2026-10-20`
  Build: Resolve hands-on feedback; complete adversarial request, quota-race, extraction, browser and production checks; document secure environment setup and samples. Run live checks only after separate approval. No public deployment.
  Verify (mechanical): Full local test commands; actual browser checks at 375/768/1366/1920; production startup; separately authorized end-to-end smoke result if permission is given.
  Learner check: Run a comparison, inspect sources, review findings, copy/edit clarification, change context and retry. Confirm the local application is ready before release work.
  Commit: `Verify local comparison workflow and document setup`

## Hands-on Checkpoints

- [ ] Early local version explored after slice one; feedback recorded
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and project owner confirms readiness

## Code Tour and App Map

- [ ] Learning activity complete — trace one comparison through actual code
- [ ] Optional edit and transfer reflection addressed
- [ ] `devpost/app-map.html` generated from finished code, checked and shown

Activity and evidence: Pending actual hands-on feedback.
Route and stops: To be grounded in finished code.
Edit outcome: Not yet offered.
Reflection: Not yet offered; personal answers remain outside Git.
Activity mode: Local app and editor.

## Revisions

- Local environment has Node 26.6.0; the documented deployment target remains Node 24 LTS. Verify compatibility and record actual runtime results rather than claiming parity before testing.

- The user explicitly requested immediate implementation, so execution started without a further order/mode interview. Fast implementation includes the required local hands-on review; no separate approval of unseen implementation details is claimed.
- The generic evaluated prompt is copied into production source without changing frozen evaluation files or adding gold answers. Direct backend HTTP requests are used instead of an SDK so token utilities and generations have explicit accounting and no implicit retries.
- PDF.js 6.4.299 no longer declares `isEvalSupported` in its input type. Removed the obsolete option; the pinned parser is used without enabling external tools or executing document instructions.
- Git checkpoints use the clearly identified Codex agent author locally; no personal author identity was invented and no repository was published.

## Local Verification — October 20, 2026

First local version implemented. Typecheck, lint, production build, 14 no-network unit/integration tests and 4 browser tests pass. Actual local production PDF processing returned all 9 + 8 Waikato pages and 27,304 extracted characters; it ended honestly with AI_NOT_ENABLED and no report. Browser checks cover source inspection, refresh clearing, review/email controls with explicitly intercepted test-only output, staleness, and layout at 375/768/1366/1920. Runtime never returns a canned result.

The real Gemini adapter is implemented but untested against Google during application development: no external Gemini request is authorized or dispatched. Cumulative benchmark usage remains 37. Upstash production connectivity and actual atomic execution remain untested. A live local smoke check needs private Upstash configuration and separate approval for at most two Gemini requests (one token-count utility and one generation), with no retries. Public deployment remains blocked.

The development lint chain has five audit entries for the same unpatched braces issue; production audit reports zero vulnerabilities. No user content reaches glob tooling. Local source files are checkpointed with early hands-on feedback pending; slice one is not ticked complete before that checkpoint.
