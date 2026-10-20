# RuleGuard AI

An actual Next.js application for preliminary English-language admissions requirement comparison. Genuine Gemini integration, source-bound evidence, applicant context, human review and clarification drafts. Not an official admissions service; findings and extraction can be wrong or incomplete.

## Run locally

Use Node 24 LTS (local development is currently also checked on Node 26.6.0) and VS Code/PowerShell:

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

Run the local dev server before browser tests. Playwright uses installed Windows Chrome by default; set `PLAYWRIGHT_CHROME_PATH` for another installed Chromium executable, or adapt the test configuration for your platform. Unit/integration tests prohibit real upstream requests; browser report tests explicitly intercept test-only outputs. Those fixtures are never available through the application. The Waikato extraction tests use the locally retained research PDFs; synthetic samples work without them. Production: `npm run build`, then stop the dev server and `npm start`.

## Boundaries and operation

Two readable PDF/TXT files, 2,000,000 bytes/file, 15 pages/PDF, 4,100,000 bytes for the entire upload. Complete supported input only; no silent truncation. Current conservative operating gates are 60,000 extracted characters and 20,000 full input tokens; oversized/dense input produces an explicit limitation. PDF extraction preserves page indexes and full canonical text but cannot guarantee layout fidelity or missing-word detection.

AI suggestions require human review. Accept/Reject/Uncertain are independent review choices and cannot override evidence safeguards. Counts include rejected suggestions and are not exhaustive source coverage. Clarification email drafts are editable; nothing sends automatically. Inputs, sources, reports and reviews are browser-memory only; refresh/close clears them. Backend processing is temporary; no content logging, document database, permanent files or content in Redis. Google Free Tier data handling is separate and disclosed before acknowledgment.

Atomic Upstash guards: 100 generation attempts/provider Pacific day, 10 generation starts/rolling minute, 2 concurrent analyses, plus provider request/token limits. Failed/ambiguous upstream attempts count; uncertain completion conservatively retains a lease until expiry. Guard failure blocks Google calls. WAF is optional included-Free defense only. Actual hosted concurrency, lease behavior and judging-period availability remain release checks.

Use the clearly labeled synthetic sample button or download the official Waikato sources linked in `public/samples/README.txt`. The same pipeline processes samples and uploads; no university-specific answers are hardcoded. PDF.js worker is copied from the pinned dependency during installation; its license remains in the package. Model-selection benchmark files remain unchanged and the known Gemini 3.1 Flash Lite applicability/omission failures still apply.

Only local implementation is authorized. Public deployment remains prohibited until separately approved; Vercel Hobby eligibility uncertainty was disclosed and accepted for planning, not certified by Vercel.

## Dependency audit

Production dependency audit: no known vulnerabilities at the initial build. Development lint dependencies include unpatched `braces` advisory GHSA-vfj7-8cjw-p6xm (five transitive audit entries). User document text is never passed to glob/pattern tooling. Do not downgrade Next.js or apply `npm audit fix --force` to conceal it; recheck before release.
