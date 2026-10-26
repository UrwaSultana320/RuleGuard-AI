# RuleGuard AI

[MIT license](LICENSE) · [Release checklist](devpost/release/release-checklist.md) ·
[Deployment guide](DEPLOY.md) · [Third-party notices](THIRD_PARTY_NOTICES.md)

Compare university admissions requirements in two public or synthetic PDF/TXT
documents for a selected degree, program, intake and applicant category. Review exact
source quotations, Accept/Reject/Uncertain findings, then prepare an editable clarification
email from accepted findings that need clarification. Uncertain findings require explicit opt-in; compatible/consistent findings do not automatically qualify. Nothing sends automatically.

See [DEPLOY.md](DEPLOY.md) for beginner Vercel Hobby deployment instructions.

## Release preparation — October 26, 2026

Feature development is frozen and the comprehensive admissions update is accepted
for release preparation. Public GitHub publication, public deployment and any new
Gemini requests require separate owner approval. Billing and Devpost submission
have not been enabled/performed. Cumulative Gemini requests remain **40**.

The Skill Pack planning documents are [scope.md](devpost/scope.md),
[prd.md](devpost/prd.md) and [spec.md](devpost/spec.md). The
[build checklist](devpost/checklist.md) and [app map](devpost/app-map.html) retain
implementation history. The private learner profile is excluded from Git.

Release materials include the [security/release report](devpost/release/security-release-check.md),
[hosted-test plan](devpost/release/hosted-test-plan.md),
[Devpost copy for owner review](devpost/release/submission-description.md).
The demonstration video is being prepared separately; the project owner maintains
the recording script privately. Hosted tests, video recording and public link
verification remain to be performed. Offline fixtures do not
establish live AI accuracy.

## Devpost Learn Skill Pack

The six stages under `agent/skills/` come from the official
[Devpost Learn Skill Pack](https://github.com/challengepost/learn-ai-basics)
(upstream commit `a0f065781873e8a7ed9a9a705a8dafa6a0810439`):

1. [1-start](agent/skills/1-start/) — introduce the idea and learning context.
   The resulting learner profile remains private and excluded from Git.
2. [2-scope](agent/skills/2-scope/) — define the proof of concept:
   [scope](devpost/scope.md).
3. [3-prd](agent/skills/3-prd/) — define product behavior:
   [product requirements](devpost/prd.md).
4. [4-spec](agent/skills/4-spec/) — agree on the technical plan:
   [technical specification](devpost/spec.md).
5. [5-build](agent/skills/5-build/) — build and verify in steps:
   [build checklist](devpost/checklist.md) and [app map](devpost/app-map.html).
6. [6-ship](agent/skills/6-ship/) — prepare the demo and publication:
   [release checklist](devpost/release/release-checklist.md). The project owner
   maintains the recording script privately while preparing the separate video.

The local `SKILL.md` files retain minor YAML line-wrapping and blank-line
differences from upstream; their metadata meaning and workflow instructions
are unchanged. Templates and references match upstream byte for byte.
The pack is MIT-licensed, Copyright (c) 2026 Devpost; the complete upstream
notice is preserved in [the Skill Pack license](agent/skills/LICENSE).

## Admissions comparison scope

Academic eligibility/GPA/prerequisites, English tests/exemptions, apostille/attestation/notarization/translations, transcripts/certificates, SOP/CV/references, deadlines/submission stages, fees/financial requirements and any other evidence-supported admissions topic are in scope. The topic list is open, not a whitelist. Compare degree, programme, applicant category, intake, exception, stage and institutional scope before suggesting a conflict.

The prompt was broadened locally on October 26. Offline authored fixtures test handling across these categories; they do not verify Gemini reasoning or complete extraction. Existing English benchmark failures remain recorded in devpost/spec.md. No further Gemini calls were made (cumulative usage 40). Exact passage quotations can include neighbouring requirements and make emails long. Dense outputs still fail closed at the existing response limit. See the October 26 expansion in the planning documents and release notes in devpost/spec.md.

## Local setup

Additional synthetic uploads: [admissions-A.txt](public/samples/admissions-A.txt) and
[admissions-B.txt](public/samples/admissions-B.txt), for Master's / Computing /
September 2026 / International applicant. They contain illustrative GPA, apostille,
transcript, deadline, CV/reference, translation and fee requirements. They are separate
from the built-in English example and are not real university guidance. Uploading
them in the live app would request AI analysis; this change was tested offline only.

October 26 local checks: 245 unit/integration tests and 28 Playwright tests passed;
lint, typecheck, production build, PDF trace and client-secret checks passed.

1. Install Node.js 24 and open a terminal in this project folder.
2. Run `npm ci`. Postinstall copies the pinned PDF.js browser worker and license notices.
3. Copy `.env.example` to `.env.local` using your editor; keep it private and out of Git.
4. Configure the server variables below for live AI, or leave Gemini empty for extraction only.
5. Run `npm run dev` and open `http://127.0.0.1:3000`.

For release review without API permission, explicitly leave all credential values
empty. An existing private `.env.local` may already contain working credentials:
do not rely on the historical `GEMINI_REQUESTS_ENABLED` flag. On PowerShell,
start a credential-free process with:

```powershell
$env:GEMINI_API_KEY = ''
$env:UPSTASH_REDIS_REST_URL = ''
$env:UPSTASH_REDIS_REST_TOKEN = ''
$env:GEMINI_FALLBACK_MODEL = ''
npm run dev
```

Without a Gemini key, extraction is available and comparison reports are unavailable.
Normal live comparison requests may retry and consume more than two provider calls.

Required for live analysis:

- `GEMINI_API_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Optional:

- `GEMINI_FALLBACK_MODEL`

Use the HTTPS REST URL and read/write token from Upstash. All variables are server-only;
never add `NEXT_PUBLIC_`. A configured Gemini key enables actual calls, using the primary
model `gemini-3.1-flash-lite`. The optional fallback must be available to your account.
Live AI fails closed without working Redis quota protection. No enable flag is needed.

## Checks and production start

```text
npm run typecheck
npm run lint
npm test
npm run build
node scripts/verify-release-trace.mjs
node scripts/verify-client-secrets.mjs
npm run start
```

Run `npm run test:e2e` in another terminal against the running app. Windows Chrome is
the default; local-only `PLAYWRIGHT_CHROME_PATH` selects another installed Chromium
executable and `PLAYWRIGHT_BASE_URL` selects another local port. Do not set these in
Vercel. Unit tests deny external fetches; browser tests mock Gemini or use the real
extraction handler with AI disabled. No test authorizes real provider calls. Optional
research-PDF and historical-response tests skip when ignored local fixtures are absent.
All source/test files must be UTF-8 without BOM; a unit test checks for encoding damage.

## Deployment and limits

Vercel uses Node.js 24 and Fluid Compute (`vercel.json`). `/api/compare` declares a
300-second maximum. The entire multipart request is limited to 4,100,000 bytes, below
Vercel's 4.5 MB cap. Files are capped at 2,000,000 bytes and PDFs at 15 pages. There is
no OCR. Corrupt, encrypted, unsupported or unreadable inputs are rejected server-side.
Filename extension, PDF signature/parsing, strict UTF-8 text, sizes and page limits are
checked on the server. The full pair is capped at 60,000 extracted characters and
20,000 full input tokens; no content is silently truncated.

NDJSON stages and sources stream before the final report. Counting, generation, retries,
optional fallback and backoff share a 210-second provider budget within the 240-second
route operation budget. Retry-After is honored; retries require enough remaining time
for a useful attempt and cannot reset the deadline. Slow requests may prevent fallback.
Streaming does not extend Vercel's duration or request-size limit. See [DEPLOY.md](DEPLOY.md)
for exact settings, budget details and hosted checks.

## Synthetic cache and quota protection

Only the built-in synthetic-example action with exact server-checked bundled-file
hashes qualifies for caching. The cache key hashes input bytes, every applicant field
and prompt version. Verified synthetic analyses are stored in Upstash Redis with a
24-hour expiry and may be reused after a later transient provider failure. Cached output
is reverified against current sources and labeled as saved. Ordinary user uploads,
including manually uploaded copies of the samples, never populate or read this cache.

The optional cache falls back to bounded, instance-local memory if Redis is absent or
unavailable. Memory disappears on cold starts. This does not bypass fail-closed Redis
quota enforcement: 2 concurrent analyses, 100 generation attempts per provider Pacific
day, 10 generation starts per rolling minute, plus provider request/token ceilings.
Retries/fallback consume quota. Ambiguous provider failures retain leases until bounded
expiry. Unrelated deployments should use separate databases for separate allowances.

## Privacy and limitations

Use public/synthetic documents and nonsensitive context only. Google receives the full
supported extracted input under its own retention/Free Tier data-use terms. Ordinary
user uploads are not persisted by this app. Browser inputs, reports and review choices
are session-memory only; refresh/close clears them. Only synthetic example analyses
are retained in the server cache. Application logs contain static error codes and
provider-status metadata, not document text, applicant details, raw provider bodies or
credentials. PDF parser diagnostics are disabled; do not enable body-capturing analytics.

Citation verification checks source identity, not complete extraction, correct policy
interpretation, authenticity, currency, clause grouping or eligibility. Conditions and
exceptions remain AI proposals. Unknown degree applicability requires acknowledgment;
a supported exclusive mismatch blocks comparison. Human review choices do not override
verification. Test fixtures are never runtime simulated results, and no university
policy is hardcoded.

Hobby is restricted to personal/non-commercial use. Confirm eligibility, provider model
access and Upstash credentials. Local Windows checks cannot certify hosted Linux native
PDF packaging or platform streaming; smoke-test both after deployment. Preparation does
not publish the app or create external services.

## Licenses and research notes

Retain the PDF.js and third-party license notices generated by postinstall under
`/licenses/pdfjs-LICENSE.txt` and `/licenses/third-party-notices.txt`. Native packages
retain their supplied licenses. Official research-source links are in
`public/samples/README.txt`; scope/specifications and known AI quality limitations are
under `devpost/`. An October 20, 2026 audit recorded zero known production advisories
and an unresolved development-tooling advisory; that historical result is not a fresh
audit or guarantee. Offline npm audit does not provide an advisory security check.


## Evidence-backed email drafting — October 26, 2026

Review findings, optionally include uncertain findings, then click **Draft Clarification Email**. One deterministic subject/body covers all eligible current findings with the problem before exact registry-backed quotations and one clarification question per issue. The optional formatted preview bolds only the four section labels; editable text, clipboard and mailto stay plain text. Institution names, filenames, preparation metadata and internal source references are excluded. Missing information never receives invented evidence. No additional model request is made.

Every generated normal/fallback draft passes source, selection, content, structure and revision validation. If no safe draft can be prepared, a recoverable error replaces export. Changed reviews or inputs make prior drafts read-only; edited drafts require deliberate replacement. A user can edit, copy or optionally enter a recipient and open their mail app; no sending integration is added. Long mailto drafts use full copy. Keep applicant and document information nonsensitive and review all wording before sending.

See [the development report](devpost/email-upgrade-report.md) for examples, exact offline verification and limitations. Official requirements are synchronized in scope, PRD and spec with their HTML companions. This local work does not authorize deployment, publishing, billing, Devpost submission or additional Gemini requests; cumulative usage remains **40**. For credential-free local review, start Next with GEMINI_API_KEY, UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN explicitly empty in the process environment. The current runtime does not use the historical enable flag as an API block.
