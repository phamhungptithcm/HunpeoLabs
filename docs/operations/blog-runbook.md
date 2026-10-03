# Blog CMS operational contract

This runbook describes approved local implementation. It is not permission to provision/deploy a production database, change IAM, incur spend or publish a real article.

## Architecture

Next.js server routes use Firebase Admin SDK; all client Firestore/Storage rules deny access. Every staff mutation verifies the server session and current membership. Public routes return published projections only. Private drafts, membership, reports, owner UIDs and emails must never be serialized into public data. Reader registration does not create membership.

`blogPosts` holds drafts and revision snapshots. `blogPublished` holds immutable-at-publication snapshots. `blogSlugs` reserves slugs. Authorship/category/member administration is separate. Comments require moderation; public queries only expose approved content and empty tombstones. Private media is served through an authorization route, resized/re-encoded on upload, never exposed through permanent Storage download tokens.

Requests and discovery are dynamic; no shared content cache. Revisions use optimistic concurrency; publication uses a transaction and an operation receipt. Structured content is validated and rendered as React, without executable HTML/MDX. Rate limits use Firestore transactions with a 24-hour TTL field. No raw network addresses are stored.

## Configuration and production blockers

Use `.env.example` and `node scripts/validate-blog-env.mjs`. `BLOG_ENABLED` defaults off. Keep server and browser project IDs identical. Production uses runtime ADC, not committed service account keys. Confirm least-privilege service-account Firestore/Auth/Storage permissions, project/database location, bucket, Auth Google provider, exact authorized domains and Google OAuth consent configuration, indexes/rules, verified first owner, retention/backup and budget/alerts before launch.

`BLOG_RATE_LIMIT_SECRET` is an operator-managed secret with at least 32 characters. Set `BLOG_RATE_LIMIT_MODE=identity-global` explicitly in production. Each action consumes UID and shared action budgets atomically in one Firestore transaction: comment creation/editing 5/10 minutes per UID and 30/hour site-wide; sessions and reports 30/10 minutes per UID and 100/hour site-wide for each action. Exhausting either budget consumes neither. These are fixed windows; boundary bursts remain possible. Changing request headers does not affect keys. Authorized deletion and logout retain their existing behavior without this limiter. Global exhaustion temporarily denies legitimate users; the owner accepted this availability trade-off under HUNPEOLABS-CMS-008-v1. Missing/unknown mode, invalid secret, corrupt counters and provider errors fail closed with 503; exhausted budgets return 429. Counters expire after 24 hours, although provider TTL deletion is asynchronous. `trusted-ingress` mode is available only with an explicitly verified overwritten `BLOG_TRUSTED_IP_HEADER`; never infer trust from forwarded headers. No verified production header contract exists, so production uses identity-global. Firebase Auth's direct registration/login endpoints also require provider abuse protection, email-enumeration protection and quotas reviewed in the console; application throttling is not a substitute.

Auth cookies are HttpOnly/Secure/SameSite=strict, valid for one day and checked for revocation. Logout revokes refresh tokens. Session creation requires recent authentication. Production CSP allows only the required Google Auth origins; development may allow an explicit localhost emulator origin. Only `/admin/blog/login` and `/blog-account` use `same-origin-allow-popups`; other routes keep `same-origin`. Their CSP allows the exact configured Firebase auth domain and Google API loader.

## Local environment

Run Firebase Auth, Firestore and Storage emulators using a `demo-*` project. Configure all three hosts, the demo Storage bucket, server project and browser project/API key, and `NEXT_PUBLIC_BLOG_AUTH_EMULATOR_URL`. Never mix a real project with emulator settings. Use dedicated ports if another task is running.

Historical BLOG-003 validation used `/tmp/hunpeolabs-blog-003` as a source snapshot, origin `http://localhost:3107`, Auth `127.0.0.1:19099`, Firestore `127.0.0.1:18080`, Storage `127.0.0.1:19199`, project `demo-hunpeolabs-blog-001`. These addresses are local evidence, not staging or production.

Google sign-in initializes exactly `hunpeo@gmail.com` and `phamhung.pitit@gmail.com` once. `blogAccess` keyed by normalized-email SHA-256 is authoritative; legacy `blogMembers` does not grant rights. Other Google users remain readers. For operator-assisted binding of an initial Google identity only, run:

```sh
node scripts/blog-bootstrap-owner.mjs demo-PROJECT VERIFIED_UID
```

The script refuses unverified/disabled/non-Google identities, non-initial email addresses, and revoked grants. For real projects it additionally requires an exact `BLOG_CONFIRM_PROJECT` value and separate operator authorization. Never expose the bootstrap as an HTTP endpoint.

## Checks

Run lint/typecheck/unit/build, then Playwright. `tests/e2e/blog-cms.spec.ts` only runs with `BLOG_E2E=true` and explicit emulator hosts. It creates synthetic verified demo accounts and synthetic articles, tests login/editor/upload/publication/comment moderation/unpublish/privacy, and saves screenshots outside the repository. It must never target a real project.

The checkout contains pre-existing generated copies in `output/`; global ESLint and TypeScript can traverse them. Use an exact source snapshot without generated outputs to distinguish source failures from that baseline issue. Do not delete other tasks' artifacts or terminate their servers to get green.

## Backup, retention and restore

Admin content export is capped at 1,000 documents per collection and returns a media manifest, not image bytes or private community data. Use the operator archive script for local restore evidence:

```sh
node scripts/blog-backup.mjs export demo-PROJECT /tmp/blog-archive
node scripts/blog-backup.mjs restore demo-EMPTY-PROJECT /tmp/blog-archive
```

The script is emulator-only and refuses nonempty restore targets. Production backup must cover Firestore subcollections, Storage objects and Auth/membership under an operator-approved policy; the UI export is not a disaster recovery backup. Verify restoration before launch.

Owner-approved retention targets (CMS-008, 2026-10-02): revisions 90 days, moderation audit 180 days, orphan private media 30 days, rate-limit identifiers at most 24 hours. No destructive scheduled cleanup is activated. User comment deletion immediately removes public text/name; resolving an account erasure request also requires bounded private-record and backup-retention procedures. Do not promise completed production erasure from a UI tombstone.

## Operations and rollback

Monitor safe error codes/correlation IDs, publish/save failures, permission denials, conflicts, DB latency, storage failures, quota and costs. Never log manuscripts, comment bodies, session cookies or tokens. Treat provider outage separately from a valid empty blog.

Pause mutations if needed and keep the last readable published snapshots available. Restore an earlier revision as a draft, review, then publish. Do not roll back to the legacy empty array after real publication. Do not delete collections, media or original worktrees during rollback.

External share dialogs and platform-cached OG cards need separate manual verification; automated link tests do not prove that a social post was made. Live email/Auth/IAM/cost/deployment remain NOT TESTED until specifically verified.

## Approved Journal and Studio integration

`styles/blog-design.css` scopes the approved warm-paper/cobalt editorial design to `.blog-surface`. The public navigation uses `.journal-nav` to avoid the marketing menu's mobile rules. Editorial sections remain visible instead of inheriting marketing reveal effects. Shared marketing and Services chrome remains intact.

Earlier design previews were ephemeral. The current local verification origin is `http://localhost:3107/resources/blog`, using synthetic emulator data. It is not a deployed publication.

Author profiles include a biography and private uploaded portrait. Publishing copies these into the public snapshot; profile edits require republishing to affect a live article. Author portrait objects use `blog/authors/{authorId}/{mediaId}.webp`. Content backup/restore supports this path alongside post images. A portrait is public only while referenced by a published snapshot.

An earlier BLOG-001 report recorded a local restore comparison of the content manifest and 23 media object hashes. That run was not repeated for BLOG-003 and its temporary runtime evidence is no longer available. Treat current-candidate restore, production disaster recovery, Auth export and private community retention as NOT TESTED.

## Google-only access rollout

All identities are verified server-side from Firebase Google claims, not client-supplied email or role. Initial grants are seeded in a single transaction with `blogPolicy/editorial-access-v1`; never delete this marker to restore rights. A removed initial account stays removed. Existing non-Google sessions must sign in again. Grants are checked on every request, so revocation affects existing sessions immediately on the next request. An admin cannot change their own role; cross-admin changes serialize through the policy document. Pending members can be added before first Google login, then bind to their Firebase UID. Account deletion/recreation requires operator identity review, because a bound UID mismatch fails closed.

This is an intentional access-policy change: inventory any legacy membership before rollout. The requested initial set contains only two email addresses; do not migrate old roles automatically. Rollback must preserve this new authorization boundary rather than redeploy old membership-based authorization. Access/audit data contains private account information and stays server-only. The UI lists at most 100 editorial members; the current two-owner use case is within that limit.

In Firebase Console, enable Google only for this application and add the actual HTTPS HunpeoLabs domain. Set `NEXT_PUBLIC_BLOG_FIREBASE_AUTH_DOMAIN` to the configured Firebase auth handler domain (normally PROJECT.firebaseapp.com). Public Firebase web configuration is build-time configuration; changing it requires rebuilding. Server project, bucket, rate-limit secret and trusted ingress header are runtime configuration. Existing `apphosting.yaml` does not enable the blog: supply these values through an approved deployment configuration after project/IAM/provider checks. Never commit a service account key or a rate-limit secret. Confirm ingress header overwrite behavior before selecting `BLOG_TRUSTED_IP_HEADER`.

`node scripts/validate-firebase-production.mjs` performs read-only preflight. A CLI authentication failure is a live readiness blocker, not evidence of missing resources. Validate real Google login on desktop/mobile, both initial admins, outsider denial, draft/media privacy, session revocation, Firestore indexes, Storage IAM, rate limits, backup restore and alerts before enabling production traffic. Emulator success does not prove these live behaviors.

## Reproducible packaging

Run `python3 scripts/package-blog-release.py`. The deterministic source archive and per-file SHA-256 manifest are written to `output/blog-release/`; environment secrets, runtime sessions, emulator databases and build caches are excluded. Generated `next-env.d.ts` is also excluded and recreated by Next.js. The archive contains the current integrated website source, so unrelated existing website work remains included in the candidate and must pass its normal release checks. It is not a standalone deployed service and is not a production approval.

Extract into an empty directory, verify file hashes from the manifest, install with the pinned pnpm lockfile, run `pnpm release:build v0.2.0` with approved production configuration, then use the existing App Hosting release path. `build-release.sh` now checks blog environment shape when BLOG_ENABLED=true. Disabling the feature flag is the immediate application rollback; preserve content and access policy for investigation. No deployment or production mutation is performed by the packaging script.

## Security maintenance and repeatable QA

The release candidate pins Next.js and eslint-config-next to 16.3.8, following the official September 2026 security release (https://nextjs.org/blog). Targeted uuid/grpc/nanoid overrides remove advisory-affected transitive versions. The gaxios integration uses uuid.v4; verify Auth/Firestore/Storage workflows whenever these overrides change. Firebase util postinstall auto-configuration is disabled because the app explicitly supplies its Firebase config; protobufjs version-warning postinstall is also disabled. Native sharp builds retain their existing allow entry. Recheck `pnpm audit --prod` at release time. An audit with zero known advisories is not a proof of no vulnerabilities.

After starting isolated Auth/Firestore/Storage emulators and the local dev app with the environment above, run `FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:19099 FIRESTORE_EMULATOR_HOST=127.0.0.1:18080 pnpm test:e2e:blog`. This serial suite resets synthetic access grants in the guarded demo project; do not share that demo project with manual authoring. `BLOG_TEST_ORIGIN` can override the localhost origin. Production-mode emulator tests additionally require explicit `BLOG_ALLOW_EMULATORS=true`; real projects are still rejected. Google popup emulator verification uses development mode because production CSP deliberately excludes emulator origins. Production-mode checks inject emulator Google ID tokens through the actual server session route and must not be described as real Google OAuth.

The Google popup E2E routes only the real public `apis.google.com/js/api.js` script through Playwright HTTP transport because Chromium iframe fetches stalled in this environment. Authentication requests, popup UI, provider claims and server sessions remain real Firebase Emulator operations. This makes no claim about live Google OAuth. General website tests use a saved analytics-declined state; the dedicated analytics suite independently tests first visit, opt-in, single initialization and revocation. Localhost remains noindex even with published demo posts; production HTTPS indexing policy is unit-tested separately.

## Google One Tap (BLOG-007)

One Tap defaults to enabled when the flag is omitted. Production and example configuration explicitly set it to true. Do not disable it without an explicit owner request. A valid OAuth Web client ID is still required before a prompt can load. Use the Google OAuth **Web client ID** associated with this Firebase project's Google provider, not an API key and never a client secret. Set `NEXT_PUBLIC_BLOG_ONE_TAP_ENABLED=true` and `NEXT_PUBLIC_BLOG_GOOGLE_CLIENT_ID=<web-client-id>.apps.googleusercontent.com`, with the existing matching Firebase configuration, then rebuild. Register the exact website origin in that OAuth client's Authorized JavaScript origins; for local testing use `http://localhost` and `http://localhost:3120`. Register the actual production HTTPS origin only after verifying it. Firebase Google provider and Firebase authorized domains must also match. No additional Google data scopes are needed beyond identity.

The official GIS prompt uses FedCM with automatic account selection disabled. Browser/account policy and cooldown can suppress prompts, so the normal Google login remains available. Existing authenticated sessions do not trigger a prompt. A signed-out tab suppresses prompts until a deliberate manual login clears that marker. Website sessions and current server-side roles control Studio visibility; a Chrome profile does not grant access. Firebase credentials use memory persistence, are exchanged through the existing session API, and are cleared from the SDK afterward. CSP adds only Google GIS URLs when the feature flag is enabled.

Current local verification uses a stub Google GIS callback and real Firebase Emulator credential/session exchange; it does not verify a real Google account or client configuration. Live provider acceptance remains a separate gate. Setup readback on 2026-10-02 found Google Auth Platform not configured; CLI authentication also needs renewal. Do not infer an empty client list from a failed OAuth clients request.

Official setup: https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid . Firebase exchange: https://firebase.google.com/docs/auth/web/google-signin .

## Approved operations policy (2026-10-02)

Owner approved revisions 90 days, moderation audit 180 days, orphan private media 30 days, and rate-limit TTL 24 hours. No destructive cleanup job is activated. A production Firestore daily backup schedule now retains backups for 14 days. Target RPO/RTO is 24 hours; these are targets, not measured recovery guarantees. Firestore backups exclude Storage and Firebase Auth. A successful protected restore covering these dependencies remains required before full CMS production readiness. Never restore into the live database or download production identity/session data for testing.

Production monitoring checks `https://hunpeolabs.com/api/health` every 300 seconds from Iowa, Europe and Asia Pacific, with 10-second timeout, valid TLS, HTTP 200 and JSON status `ok`. An enabled alert policy routes two-region failures lasting 300 seconds to `hunpeo97@gmail.com`. Configuration readback is not proof of email receipt or alert delivery. Monitoring health does not assert CMS/Firestore/Auth readiness. Provider format follows [Google's uptime alert policy example](https://docs.cloud.google.com/monitoring/alerts/policies-in-json).

Direct anonymous Cloud Run health returned 403 during preflight; ingress `all` alone does not prove public bypass. Recheck after rollout. The currently served revision predates this source change.

CMS-008 validation used a separate worktree, localhost3109, Auth29099, Firestore28080 and Storage29199, all in the guarded demo project. Twelve desktop/mobile CMS workflows and a dedicated concurrent limiter/TTL test passed on this candidate; these do not replace the live provider or recovery gates.
