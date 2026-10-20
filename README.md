# RuleGuard AI

An actual Next.js application for preliminary English-language admissions requirement comparison. Genuine Gemini integration, source-bound evidence, applicant context, human review and clarification drafts. Not an official admissions service; findings and extraction can be wrong or incomplete.

## Approved Degree-Aware Revision — 2026-10-20

Approved controlled extension of the previously completed 5-build: support international Bachelor's / Undergraduate and Master's / Postgraduate applicants. This explicitly supersedes the Master's-only boundary and fixed degree selection; unrelated approved requirements remain unchanged. Local implementation and offline tests are authorized. No additional Gemini requests, billing changes, public deployment, repository publication, Devpost submission or 6-ship are authorized. Cumulative Gemini usage remains 40.

Select the degree explicitly before uploading two readable PDF/TXT documents; neither degree is preselected. Retain program, intake and applicant category. Examine the complete supported extracted content of both documents, not filenames, titles or isolated keywords. Display a separate preliminary applicability assessment for each source, with backend-reconstructed quotations and PDF page / TXT line references: applicable to selected degree, explicitly another degree, multiple degrees, general policy applicable to selected degree, or uncertain.

A clear, exclusively other-degree document with supporting references blocks comparison and requires replacement; acknowledgment cannot override it. Weak, ambiguous or conflicting mismatch evidence is uncertain. Mixed-degree documents are accepted only where the selected branch is supported; compare selected-degree rules and applicable general rules, conditions and exceptions only. Inventory other-degree rules for coverage, but do not include them in comparison findings. A genuinely general policy needs no degree-specific title. Never inherit rules across degrees or assume every postgraduate statement applies to every Master's program.

For uncertainty, show **Degree applicability could not be confirmed**, available evidence and missing information before revealing findings. Require an explicit acknowledgment and Continue action. Reuse the same validated response in session memory, without another AI call; mark the resulting preliminary report **Degree applicability unverified**. Scope, condition satisfaction and contradiction remain separate concepts. Unknown rule-degree scope yields Insufficient Evidence. Human review and acknowledgment do not certify correctness, completeness, official status, authenticity or publication currency.

Every degree or document edit invalidates the applicability decision, acknowledgment, previous comparison and related review decisions. Full extracted sources remain inspectable, without a guarantee of extraction fidelity. Preserve original quotes, four finding categories, dashboard totals for AI-identified findings only, Accept/Reject/Uncertain controls, clarification drafts, privacy/session handling, all upload limits, backend-only credentials and free-tier global quotas. Existing Master's-only samples remain labeled Master's; provide separately labeled Bachelor's samples rather than relabeling them.

Acceptance checks cover both matching degrees; opposite-only mismatches in either direction; mixed sections; general policy; uncertainty and explicit continuation; non-overridable mismatch; invalid/cross-source applicability references; stale degree edits; degree-specific conditions/exceptions; and retained Master's behavior. Offline tests verify implementation and guards, not live Gemini degree reasoning. The revised feature is not release-ready solely because offline tests pass; local UI review and separately authorized live validation remain outstanding.

## Run locally

Use Node 24 LTS and VS Code/PowerShell. The package engine is pinned to `24.x` to match the approved Vercel runtime:

```
npm ci
npm run dev
```

Open http://127.0.0.1:3000. The root `.env.local` is private and ignored. **Do not replace an existing file.** `.env.example` lists backend credential names. Gemini calls default to disabled and require separate project-owner authorization before `GEMINI_REQUESTS_ENABLED=true` is configured. Never share keys in chat or commit them. Upstash uses its owned Free database with HTTPS/TLS, backend REST credentials and atomic global counters. No billing, trials or automatic upgrades.

The first local preview can read and inspect documents without contacting Google. If AI is disabled it displays a clear error and no generated findings. Runtime contains no canned-report fallback. The real adapter makes one token-count request and one combined generation request per comparison, each reserved separately, with no automatic retry. These **two external requests require authorization** before a live smoke test. A working UI is not evidence of successful deployed or live AI operation.

## Tests

```
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

Run the local dev server before browser tests. To test a separate local production server, set `PLAYWRIGHT_BASE_URL` to its loopback URL. Playwright uses installed Windows Chrome by default; set `PLAYWRIGHT_CHROME_PATH` for another installed Chromium executable, or adapt the test configuration for your platform. Unit/integration tests prohibit real upstream requests; browser report tests explicitly intercept test-only outputs. Those fixtures are never available through the application. The Waikato extraction tests use the locally retained research PDFs; synthetic samples work without them. Optional quality tests replay the privately saved synthetic smoke response from ignored `tmp/smoke40-*.json` files; they skip explicitly when those files are absent. The browser replay intercepts test transport only and is never an application feature. No saved response, credential or private diagnostic file belongs in Git. Production: `npm run build`, then stop the dev server and `npm start`.

## Boundaries and operation

Two readable PDF/TXT files, 2,000,000 bytes/file, 15 pages/PDF, 4,100,000 bytes for the entire upload. Complete supported input only; no silent truncation. Current conservative operating gates are 60,000 extracted characters and 20,000 full input tokens; oversized/dense input produces an explicit limitation. PDF extraction preserves page indexes and full canonical text but cannot guarantee layout fidelity or missing-word detection.

Conditions and exceptions are AI-proposed groupings, not verified facts. Empty structured lists display **not established** rather than implying absence; all groupings require source review. Prohibitions must not be interpreted as exceptions. Unknown condition satisfaction is explained separately from policy applicability and any unverified AI uncertainty note. The generic prompt and schema descriptions reinforce these distinctions without adding inference calls or changing citation validation. These prompt changes have not been tested in a new live generation; offline rendering safeguards are verified independently.

AI suggestions require human review. Accept/Reject/Uncertain are independent review choices and cannot override evidence safeguards. Counts include rejected suggestions and are not exhaustive source coverage. Clarification email drafts are editable; nothing sends automatically. Inputs, sources, reports and reviews are browser-memory only; refresh/close clears them. Backend processing is temporary; no content logging, document database, permanent files or content in Redis. Google Free Tier data handling is separate and disclosed before acknowledgment.

Atomic Upstash guards: 100 generation attempts/provider Pacific day, 10 generation starts/rolling minute, 2 concurrent analyses, plus provider request/token limits. Failed/ambiguous upstream attempts count; uncertain completion conservatively retains a lease until expiry. Guard failure blocks Google calls. WAF is optional included-Free defense only. Actual hosted concurrency, lease behavior and judging-period availability remain release checks.

Use the clearly labeled synthetic sample button or download the official Waikato sources linked in `public/samples/README.txt`. The same pipeline processes samples and uploads; no university-specific answers are hardcoded. PDF.js worker is copied from the pinned dependency during installation; its license remains in the package. Model-selection benchmark files remain unchanged and the known Gemini 3.1 Flash Lite applicability/omission failures still apply.

Only local implementation is authorized. Public deployment remains prohibited until separately approved; Vercel Hobby eligibility uncertainty was disclosed and accepted for planning, not certified by Vercel.

## Dependency audit

Fresh registry audit on October 20, 2026: `npm audit --omit=dev --json` reports **0 known production vulnerabilities**; the full audit reports **five high-severity package entries tracing to one unpatched development-tooling advisory**, [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), affecting `braces` through the Next ESLint/fast-glob/micromatch chain. `npm ls braces --omit=dev` contains no braces dependency. No application path sends uploaded text or applicant facts to glob/pattern tooling. This is a known residual development risk, not a production-runtime finding or a guarantee that every possible flaw is detected. Npm suggests a major downgrade to eslint-config-next 14.2.35; no compatible patched braces version is listed by the advisory. No forced downgrade, suppression or unnecessary upgrade was applied.


## Third-party licenses

Installation preserves PDF.js's worker header and generates full browser-distribution license texts at `/licenses/pdfjs-LICENSE.txt` and `/licenses/third-party-notices.txt` from the installed pinned packages. They are regenerated by postinstall alongside the worker; do not remove them from the deployed public assets. Core packages use MIT/Apache-2.0 licenses. Optional native Sharp/libvips packages also contain LGPL-3.0-or-later components; retain their supplied licenses and obligations when redistributing native binaries. The application does not serve those binaries to browsers. Other transitive packages include BSD/ISC/0BSD and CC-BY-4.0 notices. This inventory is not a legal certification or a license choice for the project's own code.


## Release preflight

Node 24.19.0 passed a clean cached `npm ci --offline --no-audit --no-fund` with engine-strict enabled, unit tests, lint, typecheck, production build and browser tests against the actual Node 24 production server. The isolated checkout contained no real credentials. After building, run `node scripts/verify-release-trace.mjs` to check that the comparison function includes PDF parser assets and native polyfills and traces no parent checkout or environment files. The Windows result does not certify Vercel's Linux native packaging.

An offline `npm audit` is **not a vulnerability check**: the installed npm implementation skips advisory lookup in offline mode. The separately authorized registry review above is complete; its real production result is zero known vulnerabilities, while the development advisory remains. Do not use an offline zero as a release sign-off.

Official Vercel documentation checked October 20, 2026 supports [Node 24.x](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions) and documents [4.5 MB request bodies, 300-second Hobby Fluid duration and 250 MB standard function bundles](https://vercel.com/docs/functions/limitations). The application uses 4,100,000-byte whole uploads, a 240-second operation timeout, a 300-second function declaration and a locally verified Windows trace of about 56.8 MB. These are compatible planning limits, not verification of the eventual project's Fluid settings or Linux bundle.

Configure credentials as backend-only project [Secret environment variables](https://vercel.com/docs/environment-variables/sensitive-environment-variables), never NEXT_PUBLIC values. Keep Gemini disabled until a new live-call budget is explicitly approved. [Hobby WAF](https://vercel.com/docs/vercel-firewall/vercel-waf) documents up to three custom rules and three project IP blocks; the application does not require paid WAF or managed rules. Global quotas remain enforced in Upstash independently. [Hobby terms](https://vercel.com/docs/plans/hobby) restrict use to personal/non-commercial projects; the already accepted hackathon eligibility uncertainty remains unresolved by these docs. No account settings, environments or services were changed.

## Degree-aware revision status — October 20, 2026

Local implementation passed 62 unit/integration and 15 browser tests on Node 24, lint, typecheck, production build and PDF trace checks. Scope/PRD/spec and their HTML companions record the approved extension. See `devpost/spec.md > Degree-Aware Local Verification — 2026-10-20` for limitations and `devpost/checklist.md` for exact changed files. No dependency or service plan changed. The accepted development advisory remains a known risk.

Select a degree first, then use the corresponding sample pair or upload two public/synthetic sources. AI remains disabled; local extraction and full-source inspection work, but no runtime simulated findings are provided. Degree-gate/dashboard browser tests explicitly intercept offline outputs; historical S01 replay adds a clearly test-only uncertain gate because the old genuine output predates the contract. Revised model reasoning and provider schema compatibility require separately authorized live validation. This is ready for local UI review, not final release approval. Additional Gemini requests and public deployment remain blocked; cumulative Gemini usage stays 40.
