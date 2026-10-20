---
doc: checklist
status: approved
---

# RuleGuard AI Build Checklist

Build mode: fast implementation with an early local hands-on checkpoint and final review. Execution is explicitly authorized on October 20, 2026; the following order is derived from the approved scope/PRD/spec. The instruction to start implementation takes precedence over a further planning interview. This is not an authorization for Gemini calls or public deployment.

Current checkpoint: slice one is implemented and mechanically verified; awaiting the project owner’s first local hands-on review. The single authorized synthetic comparison has now run and failed the evidence-validation gate. Exactly two additional Gemini requests were consumed (39 cumulative); live access is disabled. Diagnose the rejected output offline before requesting any new live-call permission. Do not rebuild completed functionality on resume; resolve this checkpoint first.

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


## Authorized Local Smoke Check — Configuration Blocked

On October 20, 2026, the project owner authorized exactly one synthetic comparison, at most two additional Gemini API requests: one token-count utility and one genuine generation, no retries. Cumulative ceiling: 39 including the prior 37. Public deployment remains blocked.

Preflight observed only credential-presence flags, never displayed values: `.env.local` exists, is Git-ignored and untracked; GEMINI_API_KEY is populated; UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are missing; GEMINI_REQUESTS_ENABLED is false. Stopped immediately as instructed. No Upstash requests, Gemini utilities, generation requests or retries were sent.

Exact additional Gemini requests used: **0**. Cumulative used: **37 of 39**. Outcome: **BLOCKED BEFORE EXECUTION**, not an AI pass/fail. The intended S01 synthetic outcome remains Potential Contradiction with shared scope and both source statements cited; classification, condition coverage, citations, quota execution and genuine dashboard rendering were not tested by this attempt. Do not claim that either the AI or quota integration passed.

Next prerequisite: the project owner privately configures the Upstash REST URL/token in the ignored `.env.local` without sharing credentials in chat, then confirms readiness to resume. Existing authorization for one comparison remains unspent; do not retry this blocked attempt or make additional calls before configuration is confirmed. No application code, prompt, gold outcomes or billing settings changed.


## Single Authorized Synthetic Smoke Check — Executed, End-to-End Failed

Executed October 20, 2026, following the project owner's confirmation that private Upstash configuration was added. The .env.local file was verified present, ignored and untracked; all three required values were populated and the Redis URL had the expected HTTPS format. No credential value was printed or committed. The server was restarted with live access enabled only in the smoke process; the private file's disabled live setting was not changed.

The actual browser application loaded its S01 synthetic samples, used the supplied synthetic context, acknowledged privacy and submitted one comparison. No HTTP interception, canned model output or answer substitution was used. A temporary Git-ignored fetch guard required exact synthetic inputs and enforced one countTokens followed by one generateContent, no retries, with metadata recorded before dispatch. Its ledger is closed, and the local app was restarted with live Gemini access disabled after this attempt. This restarted development preview reloaded the browser and cleared active memory as expected; the error and retained sources were observed before restart.

Exact Gemini accounting: **2 additional / 39 cumulative**, exhausting the current authorization. countTokens returned HTTP 200, 1,442 input tokens, 1,110 ms. generateContent returned HTTP 200 with STOP, 1,442 prompt tokens + 938 candidate tokens = 2,380 reported total, 14,069 ms. The token-count result is not added again to generation token usage; no separate thinking count was reported. The application POST took about 18.7 seconds including extraction, quota operations and validation. No retries, discovery calls, extra token utilities, model switch or paid feature was used.

Quota execution: four actual Upstash operations from the application (analysis lease, utility reservation, generation reservation, lease release) returned HTTP 200 without Redis errors; the three admission decisions were allow. One additional read-only Redis metadata check found **1 generation attempt, 2 total provider requests and 0 unexpired analysis leases** for the day. Thus the observed attempt was reserved/counted and its lease released. This is not a load/race/expiry or full Free-capacity test. No documents, applicant details, reports or review choices were written to Redis.

Expected S01 outcome: Potential Contradiction for the same applicant scope's incompatible MOI substitution rules, supported by both sources and their conditions, with a clarification question. The genuine raw AI summary reported complete analysis, two rules, two passage coverage entries and one **Potential Contradiction** referencing two rules, plus unknown condition satisfaction marked nonblocking. The category matches the expected outcome; this does not establish complete or correct evidence/condition coverage.

**End-to-end result: FAILED.** The backend returned INVALID_EVIDENCE (unsupported or inconsistent source/rule references or coverage), and the browser showed the safe comparison error rather than rendering a current dashboard or unsupported quotations. The original full source text was inspectable after the error. No genuine finding was accepted, rejected or mailed, and no successful live dashboard rendering is claimed. The rejection safeguard worked, but a usable AI comparison did not.

Diagnostic limitation: this first runtime verifier returns one generic INVALID_EVIDENCE code for several predicates. The temporary metadata summary did not retain raw model output or returned IDs, consistent with no content logging. Therefore the exact failing reference/coverage predicate and whether it originated in model output or validator logic cannot be established retrospectively from this run. Raw condition arrays were empty and exception arrays had one clause per rule, but decisive wording might be embedded in other clauses; do not declare those conditions missing or correctly preserved without the rejected content. Source traceability and semantic support were not fully demonstrated by this live attempt.

Next fix: add safe, specific rejection diagnostics and no-network regression coverage for each validation predicate, inspect the validator contract against the generic prompt/schema and existing recorded synthetic fixtures, then repair any demonstrated implementation mismatch without relaxing citation requirements or changing expected answers. Any subsequent genuine end-to-end retry needs new explicit API authorization. Do not automatically schedule another model-selection benchmark. Public deployment remains blocked. No application code, gold fixture, prompt, privacy boundary or billing setting changed during this smoke test.


## Offline S01 Validation Investigation — October 20, 2026

Authorization: offline debugging only. **0 additional Gemini requests; cumulative usage remains 39.** No provider/quota cloud requests, billing changes, public deployment, prompt changes, model switch or new benchmark. Live Gemini remains disabled locally.

Historical evidence: the closed smoke ledger and guard implementation retained aggregate metadata only, not the original response, returned identifiers or clause text. The smoke process was subsequently restarted. The actual S01 response is unavailable for offline replay. INVALID_EVIDENCE proves that schema parsing, complete status and the document-source set check had already passed; it does not identify which later rule/clause/coverage/finding check failed. Two rules and two coverage entries alone do not prove reference validity or complete condition coverage. No retrospective attribution to Gemini, a specific validator predicate, or both is justified. The earlier live comparison remains FAILED, not retrospectively passed.

Demonstrated implementation defects: all evidence predicates shared a generic rejection code, losing the information needed to diagnose S01; separately, source acknowledgement compared sets without checking array length and accepted duplicate identifiers such as [A, A, B]. A constructed regression reproduced the duplicate-list acceptance before the fix. This permissive gap cannot explain the historical INVALID_EVIDENCE rejection: it was an earlier check that accepted too much, not one that falsely rejected S01.

Test-first evidence: the initial new offline run produced 23 failed diagnostic/duplicate-source tests and 15 passed tests. Failures were missing diagnostic fields plus duplicate-source acceptance. These fixtures are explicitly constructed contract examples, not a recreation of unavailable Gemini output. No expected benchmark answers or frozen evaluation fixtures changed.

Correction: assign 23 static diagnostic codes to the existing schema/status/source/rule/clause/coverage/finding rejection branches; expose only the code through the existing safe error stream and local error notice. No model text, returned identifiers, hashes, source names, applicant data, credentials or Zod input/issues enter diagnostics. No new logging or content retention was added. Require exactly one acknowledgement per original source. Citation reconstruction, same-source passage matching, full coverage accounting, unknown-applicability guards and rejection of unsupported references remain intact. No fallback report or unvalidated AI finding is emitted.

Contract audit: the prompt and request payload supply passageId values, response clause/coverage fields reference those values, and the validator resolves them against server-owned passage IDs. Rule IDs are model-assigned and resolved separately. No demonstrated field-name mismatch or false rejection of a valid constructed contract was found. This does not establish semantic correctness of any missing original model response. The validator proves reference identity and reconstructs source text; it does not independently prove every paraphrase is entailed or every condition was identified. Human review remains required.

Offline protections: unit tests default to a throwing fake fetch, with explicit test-only responses for adapter tests. The route regression substitutes the model and quota modules, checks that an invented passage ID returns CLAUSE_PASSAGE_UNKNOWN, emits sources but no report or rejected model text, and releases the mocked lease. Browser tests block nonlocal network destinations; real local extraction uses AI-disabled mode, while dashboard/error transport tests are explicitly intercepted fixtures. They do not certify a successful live AI dashboard.

Remaining live uncertainty: another separately approved, bounded S01 application smoke would be justified to verify genuine generation, validation and dashboard integration with the new diagnostics. It is not authorized or executed by this investigation. No automatic retry or additional model-selection benchmark is scheduled; public deployment remains blocked.

Verification completed: npm test **39/39**, npm run test:e2e **5/5**, npm run typecheck, npm run lint and npm run build all passed. Existing non-fatal Vite configuration guidance appeared during unit tests. No live comparison was performed. The error UI and route tests verify diagnostics without exposing rejected findings. Scope, PRD, approved specification, credentials and original benchmark fixtures were not changed.


## One-Generation S01 Smoke — October 20, 2026 — Integration PASS

Explicit authorization: one additional generateContent only; no countTokens, retries or further AI utilities. **Exactly 1 Gemini request consumed, cumulative 40.** No billing change or public deployment. This is an application smoke test, not another model-selection benchmark; the original accuracy-benchmark failures and first S01 rejection remain historical failures.

Readiness PASS: privately verified the ignored/untracked .env.local contained Gemini and Upstash settings without printing them; persistent live flag remained disabled. An actual TLS Upstash PING succeeded without Gemini. The input/extraction/prompt/model adapter and sample files were unchanged from the previously measured 1,442-token S01 input. An offline manifest froze exact complete source text, applicant context, input fingerprint and generation body. A temporary development-only fingerprint check omitted token counting and reserved the full 20,000 input-token capacity through the unchanged atomic quota guard. This local-only deviation is disclosed: the smoke exercises one-generation operation, not the normal two-request count-plus-generation sequence. It was removed immediately after use; production source code is unchanged.

Request protection PASS: process-only live flag plus a local fetch guard enforced the exact model, synthetic generation body, successful real lease and generation reservations, and one dispatch at most. Every countTokens call, other model/payload and repeat generation was blocked locally. The ledger was closed before dispatch so a failure could not permit another request. The app was submitted once through its actual browser form; no HTTP response interception or canned AI substitution was used. Generation returned HTTP 200 / STOP in 3,891 ms, with 1,442 prompt + 975 candidate = 2,417 reported total tokens. No separate thinking-token count was supplied. The generation time is not a complete browser-to-dashboard latency measurement.

Quota PASS for this attempt: real lease admission, full-capacity generation reservation and release returned HTTP 200 without Redis errors. A read-only pipeline subsequently found 2 generation attempts and 3 provider requests for the day, compared with 1 and 2 before this smoke, and zero unexpired leases. Readiness PING and read-only metadata inspection are Redis operations, not Gemini requests. These observations do not establish load/race/expiry behavior or free-tier capacity guarantees.

Validation PASS: the genuine response passed the unchanged backend validator with no rejection diagnostic. There were two source-specific rules, two unique coverage entries linked to those rules, one Potential Contradiction finding and no applicability guard downgrade. All clause passage IDs resolved to the correct immutable source registry. Both exact TXT quotations were reconstructed from the source and displayed with lines 1–8; no PDF page numbers were invented. Complete extracted source text remained inspectable. Conditions and source meaning were reviewed separately from reference identity.

Dashboard/review/clarification PASS: genuine findings rendered at /results with preliminary/human-review notices, one compared topic and zero unresolved topics. Both rules matched the supplied program, intake and international-applicant context; condition satisfaction remained unknown rather than asserting certificate possession or eligibility. Accept, Reject and Uncertain each updated the independent review state; Reject disabled clarification actions and Uncertain restored them. Review was returned to Pending afterward. The question copied successfully, Draft Email contained both source references, editing changed the generated mailto body, and no email was sent. External mail-client launch/delivery was not tested.

S01 semantic result: expected Potential Contradiction and the decisive MOI substitution conflict were correctly identified. Source A's official certificate, completed bachelor's degree, taught AND assessed entirely in English, and supplied-certificate conditions were retained in its requirement/exception text. Source B's mandatory tests, explicit non-substitution and no-waiver wording were retained. No decisive source condition was found omitted from this output. However, **structured condition/exception organization is imperfect**: both conditions arrays are empty, Source A's conditional alternative is represented under exceptions, and Source B's prohibition of exceptions is itself placed in exceptions. The unknown entry is labeled condition_satisfaction but describes the policy conflict instead of explicitly stating that certificate possession/achievement was not supplied. These model-quality defects remain; reference validation does not prove semantic correctness. Thus the main S01 classification/applicability/evidence check passes, structured organization and uncertainty wording are PARTIAL, and no general accuracy or completeness claim is justified.

Retention/reproduction PASS: this entirely synthetic response was preserved by explicit authorization only in Git-ignored local files. tmp/smoke40-model-response.json contains returned non-thought model text and usage, without headers/credentials; tmp/smoke40-input.json contains the synthetic registry and frozen request, and tmp/smoke40-ledger.json contains request/quota metadata. tmp/smoke40-replay.test.ts and its ignored configuration reproduce the genuine output through the actual validator offline. Command: node node_modules/vitest/vitest.mjs run --config tmp/smoke40-vitest.config.mjs — **2/2 passed**, with fetch blocked. The replay also confirms that the restored normal adapter still produces the frozen input fingerprint. tmp/smoke40-validated-report.json and tmp/smoke40-dashboard.png preserve synthetic test evidence. No raw response or document contents were committed, added to application logs or stored in Redis; runtime retention/privacy behavior is unchanged.

Shutdown PASS: the authorized server process was stopped, original Gemini adapter restored byte-for-byte, the temporary preflight test removed, and the local server restarted with GEMINI_REQUESTS_ENABLED=false and no fetch preloader or smoke fingerprint environment variable. Persistent .env.local was not modified. The one-request ledger remains closed. No further live requests or public deployment are authorized. The normal app still requires its regular token-count preflight, so a future live comparison would require separate explicit request authorization. The successful smoke does not diagnose the unavailable original S01 response or retroactively repair its failed outcome.
