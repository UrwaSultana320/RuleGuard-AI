# RuleGuard AI

An actual Next.js application for preliminary English-language admissions requirement comparison. Genuine Gemini integration, source-bound evidence, applicant context, human review and clarification drafts. Not an official admissions service; findings and extraction can be wrong or incomplete.

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

Production dependency audit: no known vulnerabilities at the initial build. Development lint dependencies include unpatched `braces` advisory GHSA-vfj7-8cjw-p6xm (five transitive audit entries). User document text is never passed to glob/pattern tooling. Do not downgrade Next.js or apply `npm audit fix --force` to conceal it; recheck before release.


## Third-party licenses

Installation preserves PDF.js's worker header and generates full browser-distribution license texts at `/licenses/pdfjs-LICENSE.txt` and `/licenses/third-party-notices.txt` from the installed pinned packages. They are regenerated by postinstall alongside the worker; do not remove them from the deployed public assets. Core packages use MIT/Apache-2.0 licenses. Optional native Sharp/libvips packages also contain LGPL-3.0-or-later components; retain their supplied licenses and obligations when redistributing native binaries. The application does not serve those binaries to browsers. Other transitive packages include BSD/ISC/0BSD and CC-BY-4.0 notices. This inventory is not a legal certification or a license choice for the project's own code.


## Release preflight

Node 24.19.0 passed a clean cached `npm ci --offline --no-audit --no-fund` with engine-strict enabled, unit tests, lint, typecheck, production build and browser tests against the actual Node 24 production server. The isolated checkout contained no real credentials. After building, run `node scripts/verify-release-trace.mjs` to check that the comparison function includes PDF parser assets and native polyfills and traces no parent checkout or environment files. The Windows result does not certify Vercel's Linux native packaging.

An offline `npm audit` is **not a vulnerability check**: the installed npm implementation skips advisory lookup in offline mode. A fresh registry advisory review and current provider-documentation/project-settings review remain pending permission for read-only external lookups. The historical production audit and development `braces` finding are not a current security certification. Do not use an offline zero as a release sign-off.
