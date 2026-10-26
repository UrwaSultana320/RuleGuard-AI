# Deploy RuleGuard AI to Vercel Hobby

No external resources or public deployment were created during this preparation.
Feature freeze is in force. Do not perform the publishing/deployment steps below
until the owner separately authorizes them. Do not enable billing or a Pro trial.
No new Gemini requests are authorized; cumulative usage remains **40**.
Hobby is for personal/non-commercial use: confirm that your use qualifies before
deploying. See [Hobby terms](https://vercel.com/docs/plans/hobby).

## 1. Check the project locally

1. Install Node.js 24 and open a terminal in the project folder.
2. Run `npm ci`. Postinstall copies the PDF.js worker and license notices.
3. Run `npm run typecheck`, `npm run lint`, and `npm test`.
4. Run `npm run build`, then `node scripts/verify-release-trace.mjs` and
   `node scripts/verify-client-secrets.mjs`.
5. Stop the dev server if it uses port 3000. Run `npm run start`, then open
   `http://127.0.0.1:3000`. Both the home page and `/results` should load.
6. In another terminal, run `npm run test:e2e`. These tests mock Gemini and do not
   spend provider quota. Windows Chrome is the default; local-only
   `PLAYWRIGHT_CHROME_PATH` can select another installed Chromium executable and
   `PLAYWRIGHT_BASE_URL` can select a different local port.

## 2. Save the source in Git

Push the project source and lockfile to your own supported Git repository.
Do not commit `.env.local`, `.next`, `node_modules`, research PDFs, `tmp`, or test
artifacts. Keep `public/samples` and the postinstall script. Hobby restricts some
organization-owned repositories; use a supported personal repository when importing.

## 3. Prepare Google and Upstash

1. Obtain a Gemini API key with access to `gemini-3.1-flash-lite` and structured output.
   Check your account's current quota and data-use terms. A build cannot prove model access.
2. Create an Upstash Redis database, using a free offering if suitable. You can connect
   it through Vercel Marketplace or use an existing database; no paid upgrade is required
   by this app. Choose a region near your Function region.
3. Find the database's HTTPS REST endpoint and read/write REST token. A read-only token
   cannot execute the atomic quota scripts or save examples. Check Upstash usage limits
   separately from your Vercel allowance.

## 4. Import into Vercel

1. Sign in to Vercel, select Add New Project and import the repository.
2. Set the root directory to the folder containing `package.json`.
3. Keep the Next.js preset, `npm ci` installation, `npm run build` build command and
   default Next.js output directory. Do not use static export.
4. Select Node.js 24.x, also requested by `package.json`.
5. Keep Fluid Compute enabled. `vercel.json` explicitly enables it. This app needs the
   Node.js runtime for PDF parsing and the API; do not switch it to Edge.

## 5. Set private environment variables

For the first authorized deployment and extraction checks, omit all credentials.
Do not configure a working Gemini key until separate request-budget approval:
the presence of that key enables live calls immediately, including from the
“Try a live example” action. The old enable flag is not a safety control. Keep
Preview credentials absent so automatic previews cannot spend production quota.

In project environment-variable settings, add these names for Production and any
Preview environment that should support live AI:

- `GEMINI_API_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Optional:

- `GEMINI_FALLBACK_MODEL`

Paste credentials privately from each provider into Vercel's Secret/private fields.
Never add `NEXT_PUBLIC_`, put credentials in source/Git, or share them in chat or logs.
Leave fallback unset unless you have selected a model available to your own account.
No other application variables are required. Redeploy after changing variables.

The variable names above are the production contract; values must stay private.
`GEMINI_FALLBACK_MODEL` should remain unset for the initial approved smoke test.
Retries still occur without fallback, so an exact two-request approval needs a
temporary dispatch cap rather than just an instruction to click once.

Without Gemini, extraction alone works. With Gemini but without working Redis quota
protection, AI comparisons fail closed. The cache's memory fallback does not bypass
this requirement. Test-only Playwright variables do not belong in Vercel.

## 6. Deploy and check the hosted app

1. Select Deploy and check that the build succeeds.
2. Confirm `/api/compare` runs on Node.js with Fluid Compute and a 300-second maximum.
   The route's static `maxDuration` export sets that value.
3. Open Developer Tools, Network, and inspect a comparison request. Its response is
   `application/x-ndjson`; stage events should arrive before the final report.
   Do not add a buffering proxy. Streaming does not extend the execution limit.
4. With Gemini configured, using the example button makes real provider calls and
   consumes quota. Perform that check only when intended. Confirm text-PDF extraction
   on the hosted Linux runtime as well as TXT extraction, degree gating and citations.
5. Check review choices, Copy email and edited mail-app drafts. No email sends automatically.
6. Inspect runtime logs: only static error codes and provider-status metadata should
   appear. Do not add request-body logging or analytics that capture uploads, applicant
   context, NDJSON responses or email textareas. PDF parser diagnostics are disabled.

## Budgets and cache behavior

Official docs checked October 23, 2026 describe Hobby Fluid Functions with a 300-second
maximum, 4.5 MB request cap and standard 250 MB uncompressed Function bundle.
See [Function limits](https://vercel.com/docs/functions/limitations),
[duration](https://vercel.com/docs/functions/configuring-functions/duration), and
[streaming](https://vercel.com/docs/functions/streaming-functions).

The complete multipart request is capped at 4,100,000 bytes, including overhead.
Each file is limited to 2,000,000 bytes and each PDF to 15 pages. Reduce larger inputs;
streaming cannot bypass the upload limit. Supported full text is never silently truncated.

The route operation deadline is 240 seconds. Token counting, generation, up to three
primary retries per method, optional fallback and all waits share at most 210 seconds,
ending at least 15 seconds before an earlier route deadline. A retry/fallback is skipped
unless its wait plus 15 seconds of useful work fits. Retry-After is never shortened and
fallback never gets a fresh budget. A slow request can exhaust the budget before fallback.
Redis commands each time out after 5 seconds. Remaining time is reserved for verification,
cache access, lease release and stream closure. CPU-bound PDF extraction/verification
cannot be interrupted mid-instruction; limits bound normal work, with Vercel's hard
ceiling as the final stop. An incomplete result is never a verified success.

Only the explicit built-in synthetic action and exact bundled-file SHA-256 hashes
qualify for caching. Keys also hash every applicant field and prompt version. A verified
live analysis is stored in Redis under `ruleguard:v2:synthetic:` using `EX 86400` (24 hours)
and reused only after a later transient provider failure. It is reverified against current
sources and labeled as saved. Ordinary user uploads never populate or read the cache.
See [Upstash REST API](https://upstash.com/docs/redis/features/restapi).

If Redis is absent or the optional cache fails, bounded memory retains up to 32 entries
with the same expiry. Memory is instance-local and disappears on cold starts. Quota
protection still requires functioning Redis. The global limits are 2 concurrent analyses,
100 generation attempts per provider Pacific day, 10 starts per rolling minute, plus
provider request/token ceilings. Retries and fallback consume quota too. Unrelated
deployments should use separate databases if their allowances should not be shared.

## Remaining release checks

Follow [the hosted-test plan](devpost/release/hosted-test-plan.md) in two phases:
credential-free extraction first, separately approved genuine AI checks second.
Check Linux packaging and anonymous access before enabling Gemini.

## Free-tier protection and shutdown

The app's atomic quotas protect Gemini dispatch, not the entire Upstash monthly
command allowance. Even denied anonymous requests reach Redis, and Lua scripts
perform multiple commands. The 100-generation daily cap is not a guarantee of
staying under Redis/Vercel quotas or of resisting sustained abuse. There is no
per-user/IP allowance, CAPTCHA or monthly Redis-command limiter in this frozen MVP.

Official [Upstash pricing](https://upstash.com/pricing/redis), checked October 26,
lists 500K monthly commands, 250 MB storage and 10 GB bandwidth for Free. Confirm
the existing account's actual plan and remaining usage privately. Do not add a
payment method: [Upstash's upgrade guide](https://upstash.com/docs/redis/howto/upgrade-database)
states that doing so converts free resources to paid usage. A pay-as-you-go budget
is not a Free-tier control and must not be enabled for this release.

Before approved public AI access, inspect usage in provider consoles, retain the
existing concurrency/rate/token reservations, keep fallback unset, and use only
available free platform abuse controls. Check remaining capacity before and after
the approved smoke and during judging. No monitoring automation has been enabled.
To halt new requests, remove GEMINI_API_KEY from the production environment and
redeploy; revoke the provider key if an immediate hard stop is needed. Redis
outages/exhaustion must fail closed. Never reset counters or switch to in-memory
quota admission to make a demo succeed. Do not upgrade services to bypass a limit.

The configuration retains Node 24.x, Next.js auto-detection, `npm ci`, `npm run build`,
Fluid Compute and route `maxDuration = 300`; internal route/provider budgets remain
240/210 seconds. The source-upload exclusions in `.vercelignore` keep private
local material out of CLI deployments; Git ignores protect the repository path.
No Vercel project, integration, billing change or deployment was created here.

Use only public/synthetic documents and nonsensitive context; Google receives the
supported extracted input under its own retention/data-use terms. Citations do not
certify reasoning, complete extraction, authenticity, currency or admissions eligibility.

Local production tests do not prove Hobby eligibility, hosted settings, Linux native
PDF packaging, model access or live Upstash connectivity. Confirm those in your own
account after deployment. Preparing the repository does not publish the site, create
external services or automatically authorize provider calls.
