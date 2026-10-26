# Focused hosted test plan

Status: prepared, not executed. No deployment or provider request is authorized by
this document. Use public/synthetic inputs and nonsensitive context only. Record
commit, URL, runtime, date, expected/observed outcome and request count for each run;
never retain credentials, private documents, provider bodies or email content in logs.

## Phase A: after deployment approval, without provider credentials

1. **Anonymous access:** open the production URL in a private browser with no
   Vercel/GitHub session. Home and `/results` must load without login or payment;
   empty results must guide the visitor back to inputs. Check phone and desktop,
   keyboard controls, HTTPS, security headers, and license URLs. Check that
   `/.env.local`, `/devpost/learner-profile.md` and `/tmp/smoke40-model-response.json`
   return 404. Confirm no body-capturing analytics or public source maps with secrets.
2. **PDF/TXT processing:** keep all three credentials absent. Submit the labeled
   synthetic TXT pair, then the manually downloaded, official Waikato PDF pair
   documented in `public/samples/README.txt`. Inspect all extracted pages/lines,
   including the last page. Expect an honest missing-AI message and inspectable
   sources, not a comparison report. Verify actual hosted Linux PDF native loading.
   Reject corrupt, encrypted, scanned/unreadable, oversized and >15-page PDFs,
   invalid UTF-8 and combined bodies above 4,100,000 bytes. Do not silently truncate.
3. **Transport/privacy:** inspect actual NDJSON stage delivery without buffering;
   verify `private, no-store` and `no-transform`. Reject a foreign Origin. Refresh
   must clear inputs, findings, reviews and email drafts. Logs must contain safe
   static metadata only. Browser assets must not contain server variable names or
   secret values. Do not print values while checking.

## Phase B: only after separate Gemini request-budget approval

Before configuring Gemini, approve a concrete maximum number of provider requests,
including countTokens, retries and fallback. A normal comparison uses one count
utility and one generation; it is NOT guaranteed to remain at two requests.
Current code allows three primary retries per method and optional fallback within
a shared deadline. Leave fallback unset. For a strictly two-request experiment,
use a temporary dispatch guard as in the historical smoke test; disabling fallback
alone does not disable retries. Stop when the approved budget is exhausted and
record the new cumulative total starting from **40**. Do not reset production counters.

4. **Working comparison/evidence:** run one approved synthetic pair and selected
   context. Inspect reconstructed exact quotations and TXT lines/PDF pages against
   full sources. Review topic, conditions, exceptions, degree, intake, institution
   and submission stage. A genuine report must come from the approved provider
   request, not a fixture. Record wrong/incomplete reasoning honestly. Invalid
   source IDs/quotes and incomplete output must fail closed; inject these only in
   offline tests, not through extra unapproved generations.
5. **Degree applicability:** verify selected-degree and general-policy evidence;
   exclusive other-degree evidence must block without an override. Uncertain
   applicability must require acknowledgment before findings. Changing degree or
   context must invalidate current findings/reviews/drafts. Use existing offline
   fixtures for deterministic edge cases; live variants each need budget approval.
6. **Quota:** first confirm the actual Upstash account remains Free with no billing
   change. With Gemini absent, inspect quota metadata/connectivity using an explicitly
   approved read-only check. Test races, exhaustion, expiry and outages using the
   existing mocked suite or an isolated disposable test database, never by exhausting
   production or provider quotas. Later approved live checks must confirm reserved
   attempts and lease release. Missing/failed Redis must block all Gemini dispatch.
   Verify 2 concurrent analyses, 100 generation attempts/day, 10 starts/minute,
   15 provider requests/minute, 500/day and 250,000 reserved input tokens/minute.
   Counts are deployment-global, not per person. Cached examples still attempt live
   analysis before transient-error fallback, so do not use them as a zero-call test.
7. **Clarification email:** on a current verified report, Accept a clarification
   issue, Reject another and mark a third Uncertain. Draft must include eligible
   accepted issues only until explicit uncertainty opt-in. Inspect exact available
   quotes, precise questions, no invented recipient and no unsupported claims.
   Compatible differences must not become automatic questions. Edit, copy, inspect
   the optional mail-app draft without sending, then change review/context and
   confirm stale export is blocked. Email generation makes zero model requests.

## Acceptance and recovery

Do not mark hosted verification passed from a local browser/mock test. Stop on a
secret exposure, failed quota guard, native-PDF failure, inaccessible judge URL or
invalid evidence shown as verified. Remove the production Gemini key and redeploy
to stop new live requests; revoke exposed keys if necessary. Preserve safe evidence,
fix only release-critical defects, rerun the affected check and require renewed
request authorization for any additional live attempt. Keep a local-demo/repository
submission path if hosting threatens the deadline. No billing upgrade is a remedy.
