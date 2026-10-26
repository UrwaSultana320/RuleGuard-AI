# Final security and release check — October 26, 2026

Outcome: **local release preparation passed, with the limitations below**.
Public publishing, deployment, billing and submission were not performed. Feature
development is frozen. No new Gemini or Upstash service requests were made during
these checks; cumulative Gemini usage remains **40**. Read-only npm advisory and
official documentation lookups and package installation were performed.

## Scope and change made for release

The comprehensive admissions/email update was already present and explicitly
accepted by the owner. This release pass added documentation, licensing and
publication exclusions. The only dependency change was Zod **4.3.6 → 4.6.6**, pinned
in package.json and the lockfile, to address the newly reported high-severity
[GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5)
memory-exhaustion issue. No feature or major refactoring was added. Browser license
notice generation now includes Zod and caniuse-lite in addition to existing notices.

## Git, secrets and publication boundary

- Scanned every unique blob reachable from all local Git refs before the release
  checkpoint: **13 commits, 279 unique file blobs**. Scanned commit messages/author
  metadata and the current tracked plus nonignored untracked publication candidates.
- Checked exact configured Gemini/Upstash credential values privately and patterns
  for Google keys, GitHub tokens, JWTs and private keys. No matched values, snippets
  or credentials were printed. **No secret findings** in this bounded scan.
- No private environment file, learner profile, ignored research directory,
  evaluation folder, node_modules or .next directory appeared in reachable history.
  Local commit author metadata uses the Codex agent identity. Publication makes
  included history and author metadata public; no history was rewritten.
- `.env.local`, `devpost/learner-profile.md`, research PDFs, full saved model
  responses, local ledgers and temporary artifacts remain ignored/untracked.
  The preexisting `human-review-changes.diff` stays local and is now explicitly
  ignored. `.vercel/` is ignored; `.vercelignore` excludes private local material
  from CLI source upload. The personal learner profile is not a submission artifact.
- No Git remote is configured. No GitHub repository was created, pushed or made
  public. All accepted source, tests, lockfile and safe documentation are intended
  for the local release checkpoint only. Verify the exact final commit again if
  any further file changes occur before authorized publication.

Scan limits: exact known values and selected patterns do not detect every possible
secret or personal fact. Only reachable local refs were scanned, not remote refs,
reflogs or unreachable objects. No exhaustive external penetration test is claimed.
Planning narratives were reviewed for private profile content/contact details;
generic project motivation is retained without copying the personal profile.

## Dependencies and licenses

- Fresh network-backed `npm audit --omit=dev`: **0 known advisories** after the fix.
- Fresh network-backed full `npm audit`: **0 known advisories** after the fix.
  Earlier braces/advisory records in the build history are historical results.
- Node **24.22.1** clean `npm ci` succeeded with the existing lockfile. Windows
  initially held the old native SWC binary open; the previous dependency directory
  was preserved under ignored tmp and a clean installation completed in the project.
- npm warns that the current ESLint 9 release is unsupported. No broader tooling
  migration was attempted under feature freeze; a clean advisory result does not
  establish ongoing support or absence of unknown vulnerabilities.
- Root MIT `LICENSE` and matching package/lock metadata are present. The inventory
  covers **480 lockfile dependency entries**, including optional OS variants and
  development tools; it is not a list of 480 shipped runtime modules.
- Direct runtime licenses are MIT and Apache-2.0. Optional Sharp/libvips packages
  include LGPL-3.0-or-later, caniuse-lite data uses CC-BY-4.0, and some development
  tools use MPL-2.0/other licenses. These obligations are disclosed in
  [THIRD_PARTY_NOTICES.md](../../THIRD_PARTY_NOTICES.md), not overwritten by MIT.
  No vendor source is modified. Generated browser notices preserve complete license
  texts and are recreated by postinstall; their HTTP URLs returned 200.
- University PDFs remain research copies outside publication. Official-source links
  do not imply relicensing, authenticity verification or university endorsement.

## Configuration and implementation review

Reviewed upload/origin validation, parser limits, provider dispatch, Redis admission,
evidence validation, client rendering, session state and deterministic email exports.
No `dangerouslySetInnerHTML`, eval-based application rendering or browser persistent
storage was found in application source. React renders untrusted text as text.
Logs use static diagnostics/provider metadata; bodies, documents and credentials
must remain outside analytics and logging.

Server-only credential names: GEMINI_API_KEY, UPSTASH_REDIS_REST_URL,
UPSTASH_REDIS_REST_TOKEN. GEMINI_FALLBACK_MODEL is optional and should initially
remain unset. No NEXT_PUBLIC credential or Next config environment injection was
added. A configured Gemini key immediately enables live requests: the historical
GEMINI_REQUESTS_ENABLED flag is not an authorization gate. The verification server
has empty credentials plus a temporary fetch guard denying nonlocal requests.

Quotas reserve before each dispatch, including retries/fallback; missing/broken
Redis fails closed. Limits remain 2 concurrent analyses, 100 generation attempts
per Pacific day, 10 generation starts/minute, 15 provider requests/minute,
500 requests/day and 250,000 reserved input tokens/minute. Redis failures/limits
were exercised offline, not by cloud traffic. This is not a measured account quota
or a cap on every anonymous visitor's Redis/Vercel resource use.

Vercel preparation retains Node 24, Fluid Compute, a 300-second route maximum,
240-second application deadline and shared 210-second provider budget. Multipart
input is capped at 4,100,000 bytes. Preview credentials should stay absent.
The application is anonymous; global caps do not provide per-user fairness or
comprehensive denial-of-service protection. Origin validation does not block
nonbrowser clients. Built-in cache fallback attempts live analysis first, so it
is not a no-call demo path. Details and free-tier shutdown procedure are in DEPLOY.md.

## Verification performed on the production build

- Node 24 typecheck and lint: passed.
- Unit/integration tests: **245 passed across 17 files**.
- Playwright: **28 passed** against a Node 24 production server; expected model
  responses are explicitly mocked/intercepted. The real research-PDF checks ran.
- Next.js **16.4.2** production build: passed; home/results static pages and the
  dynamic Node `/api/compare` route generated successfully.
- Release trace: **534 files, 56,786,948 bytes**, with PDF native dependencies,
  standard fonts and character maps. This is a local Windows trace, not a Vercel
  Linux bundle-size or native-loading certification.
- Client/static secret scan: **19 artifacts passed**, checking server variable
  names and privately loaded configured values. No credentials were printed.
- Actual loopback production HTTP checks: home/results and license URLs returned
  200; private environment/profile/saved-response URLs returned 404; a foreign
  Origin was rejected with 403; expected security headers were present.
- Actual production POST, labeled admissions TXT pair: two full sources extracted
  (722 + 723 characters), no report, honest AI_CONFIGURATION_MISSING info event.
- Actual production POST, official Waikato research PDFs: **9 + 8 pages**, **16,309
  + 10,995 characters** extracted, no report, same honest missing-AI notice. This
  verifies parsing/streaming with no provider call, not policy reasoning.
- Git whitespace check: passed; local Windows LF/CRLF conversion notices remain.
- Regenerated notices were checked for patched Zod and caniuse-lite attribution.

The temporary smoke harness initially expected the missing-key notice as an error
event; the actual route intentionally emits an info event after successful
extraction. Corrected only the temporary assertion and reran successfully. No
application behavior was changed to make the smoke check pass.

## Remaining limitations and release gates

The current broader admissions/degree prompt has no fresh genuine Gemini evaluation.
Historical English-rule smoke/benchmark results remain partial or failed where
recorded; no failed reasoning result was retroactively passed. Offline fixtures
verify mechanics, not AI completeness or semantic correctness. Citation identity
does not prove eligibility, extraction completeness, current policy or correct
interpretation. No OCR or silent truncation is added.

Hosted Linux PDF execution, Vercel streaming/protection settings, Hobby eligibility,
actual Free account capacity, multi-instance Redis behavior and judge availability
remain unverified. Use the [hosted-test plan](hosted-test-plan.md) after separate
deployment approval; live AI checks additionally need an explicit dispatch budget.
No billing, public upload, email sending, submission or monitoring automation was
performed. A video script and submission draft are prepared, not public assets.

Official references checked October 26:
[Vercel Function limits](https://vercel.com/docs/functions/limitations),
[Upstash pricing](https://upstash.com/pricing/redis),
[Upstash upgrade behavior](https://upstash.com/docs/redis/howto/upgrade-database).
