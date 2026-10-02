# Integrated website and CMS production release

Plan: HUNPEOLABS-RELEASE-004-v1
Date: 2026-10-02 (America/Chicago)
Status: PENDING HUMAN APPROVAL
Risk: HIGH (authentication, editorial authorization, production runtime, IAM).

## Goal and authorization boundary

User requested all remaining work needed for release. Commit/push is currently
paused by the earlier user instruction. Prior BLOG approvals explicitly cover
local/emulator implementation only; RELEASE-003 covers Analytics only and
excludes this integrated dirty-tree candidate. This plan requests a reviewed
extension for the complete intentional website/CMS release and production
configuration. No implementation or production mutation under this plan has
occurred. Read-only checks and this proposal are preparation only.

## Verified evidence

- Repository intelligence: DEGRADED; both indexes stale, health checks pass.
  Current source and native Git/CLI evidence were used; completeness is not claimed.
- Local branch beaus-dev has extensive intentional tracked and untracked WIP.
  Remote main was e28331d79fc27842224192ef9f3397e6be80a8b3 at fetch.
- App Hosting hunpeolabs, project hunpeolabs-prod, us-central1 is accessible.
- Current ready Cloud Run revision: hunpeolabs-build-2026-08-04-001.
- HTTPS /api/health returns 200; /api/blog/session returns 404.
- Runtime has Analytics enabled, canonical https://hunpeolabs.com, no BLOG_*
  configuration. Local apphosting.yaml disables Analytics and omits CMS config.
- Google provider enabled, OAuth client configured, hunpeolabs.com authorized.
  Auth readback succeeds with x-goog-user-project; earlier 403 was not missing Auth.
- Firestore default: us-central1, native, delete protection enabled.
  All 33 required composite indexes match and are READY; blogRateLimits.expiresAt
  TTL ACTIVE. Deployed Firestore and Storage rules verified deny-all for clients.
- Storage hunpeolabs-prod.firebasestorage.app exists in asia-southeast1.
  Runtime service account has project-level storage.objectViewer, no verified
  media-write grant. No public/runtime bindings were present at bucket scope.
- Current account hunpeo97@gmail.com is project Owner; use only this account.
- lint passes with one proposal-file warning; typecheck passes; 81/81 unit tests
  pass; Next.js 16.3.8 production build passes; production audit reports no known
  vulnerabilities. These are source/local results, not live CMS acceptance.
- Production-server E2E: 67 pass, 9 fail, 12 skip. Four Analytics cases used a
  build without enabled Analytics config; rerun the isolated fake-config suite.
  Other failures: Journal brand selector (2), unknown service HTTP status (2),
  mobile About heading (1). Investigate semantics before changing assertions.
  Skipped CMS tests require fresh isolated emulator validation.
- Dedicated Analytics suite could not start because the same checkout has an
  existing Next.js dev server at port 3122 (PID 30610). It was preserved. Run
  this gate in the isolated release candidate; no Analytics PASS is claimed.
- Agent config validator crashes on missing .github/copilot-instructions.md;
  adapter expectations and generation sources need reconciliation.

## Scope and file-level implementation

1. Preserve original dirty checkout; snapshot intentional source and evidence to
   an isolated candidate based on refreshed main. Inventory concurrent changes;
   exclude caches, .pnpm-store, logs, output, secrets, credentials and demo data.
   Do not silently remove files already on main. Record source manifest/hash.
2. apphosting.yaml (or apphosting.prod.yaml if verified environment precedence
   requires it): preserve existing enabled consent-only Analytics configuration;
   add matching blog server/client project, private storage bucket, auth domain,
   public Firebase config, feature flags, and runtime-only Secret Manager reference.
   Keep contact delivery disabled. One Tap remains disabled unless exact OAuth
   origin and real-account acceptance can be verified; popup login remains primary.
3. scripts/validate-blog-env.mjs, scripts/validate-firebase-production.mjs and
   scripts/build-release.sh: validate enabled release config, actual project,
   bucket, flags, environment parity and readiness without reading secret values
   into output. Read-only preflight must not equate backend existence with readiness.
4. lib/blog/rate-limit.ts and focused tests only if needed: verify App Hosting
   ingress header overwrite/append semantics, reject forged client addresses and
   direct-backend bypass. Do not configure raw client-controlled X-Forwarded-For
   as trusted. Stop rollout if a defensible trust boundary cannot be established.
5. lib/firebase-admin.ts/lib/blog/media.ts and relevant Auth/media tests only for
   demonstrated production ADC/IAM compatibility defects. Preserve Google-only
   verified identity, one-time initial two-admin seed, transactional access,
   revocation, private media, conflict handling and client deny-all rules.
6. tests/e2e/site.spec.ts, tests/e2e/services.spec.ts, tests/e2e/analytics.spec.ts,
   playwright.config.ts and affected app/components: repair verified regression
   root causes or stale selectors while retaining navigation, real 404 status,
   no-JS, viewport, consent/revocation, accessibility and privacy semantics.
7. .ai/scripts/validate_agent_config.py and canonical adapter sources: reconcile
   enabled adapters and validation requirements; regenerate using authoritative
   generators. Do not hand-edit generated adapters or weaken required checks.
8. package.json and release metadata/lockfile only as needed for v0.3.0; docs/
   releases/v0.3.0.md, docs/operations/blog-runbook.md, production-readiness.md,
   .ai/proposals/HUNPEOLABS-RELEASE-004-* record current candidate and evidence.
   No unrelated dependency or architecture changes.

## Concrete production changes after approval

- Reuse project/backend/database/bucket and existing Google provider/client.
  Do not recreate resources, enable password auth, migrate data or publish articles.
- Create a new random blog-rate-limit secret without exposing its value, store
  directly in Secret Manager, grant only required App Hosting secret consumers,
  pin/version the reference and verify metadata rather than retrieve values.
  No access to existing secret payloads is authorized by this plan.
- Grant runtime service account storage.objectUser only on the blog bucket,
  subject to verified media operations. Verify datastore transaction and Firebase
  Auth/session permissions; add only explicitly demonstrated missing permissions,
  with exact role/resource delta recorded before mutation. No Owner/Editor grant.
- Preserve deployed deny-all rules, matching indexes and active TTL. No destructive
  cleanup, IAM removal, billing upgrade, retention change, or bucket relocation.
- Verify OAuth web-client exact HTTPS origins and Firebase auth handler redirect;
  add only hunpeolabs.com if missing. Verify provider settings using readback.
- Prepare private-content/Auth/media backup and restore evidence without exporting
  production private data into Git or logs. Existing UI export is not DR proof.
- Verify approved retention, alerts, quota/cost monitoring and Analytics settings;
  absent owner/privacy decisions remain explicit release blockers.
- Build one immutable candidate with enabled CMS config, deploy only after source,
  emulator/browser, security and fresh final-review gates pass. Live acceptance:
  Google login on desktop/mobile, both initial admins, outsider denied Studio,
  private draft/media boundary, revocation, rate limits and ingress spoof rejection.
  Do not publish synthetic articles publicly; authenticated data-mutating acceptance
  must use separately identified test scope and clean up only owned test data.

## Validation and acceptance

Required: frozen install, lint/typecheck/unit/build, production audit,
production env and blog config validators, source/secret/artifact audit, agent
config validation, isolated Auth/Firestore/Storage emulator CMS suite, Analytics
fake-config suite, production desktop/mobile E2E, Firefox/WebKit smoke,
Lighthouse, fresh final-implementation-review JSON and completion report.
No skipped/missing required gate counts as passed. Live provider acceptance is
recorded separately from emulator/local evidence. Runtime build config must match
the deployed source identity. Retain every review/fix/reverify cycle.

## Promotion and rollback

Approval of this plan also explicitly resumes commit/push for the reviewed
candidate: create hunpeolabs/release-v0.3.0 from refreshed main, commit only
manifested intentional changes, open a PR, require green CI before merge to main,
then annotate v0.3.0, publish reviewed release notes and deploy that exact source.
Do not force-push or move public tags. Attach any created PR to this chat.
Stop if another branch/release already owns this version or candidate changes.

Preserve current runtime build as operational rollback evidence, but do not
redeploy an older vulnerable source without a current security check. Prefer
disable BLOG_ENABLED via reviewed release configuration while preserving data,
access policy and media; fix forward from the current patched candidate.
Never delete content/Auth identities or reset the one-time access-policy marker.

## Trade-offs and exclusions

Existing Storage region differs from app/database; measure media latency before
considering any later migration. Reusing resources avoids destructive migration.
No new billing plan, uncontrolled paid provider calls, public synthetic content,
contact-provider activation, Ads/Signals/User-ID/custom events, or unrelated work.
Secret Manager/App Hosting/Firestore/Storage may incur existing Blaze usage costs;
retain current runtime capacity limits and record available cost controls.

## Approval requested

Approve HUNPEOLABS-RELEASE-004-v1 to authorize the above local fixes, tightly
scoped production config/IAM/new-secret work, controlled acceptance checks,
resumption of reviewed Git promotion, v0.3.0 release and exact-source rollout.
Any new critical operation, existing secret access, destructive data change,
billing change or material architecture deviation needs separate reviewed scope.
