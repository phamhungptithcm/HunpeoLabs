# v3.2.0 release evidence

Scope: full current approved website work integrated on main with origin/main b077238 and feature commits b2779cf/21f1c5b. Isolated checkout /private/tmp/hunpeolabs-release-v3.2.0; original dirty beaus-dev preserved. Exact46-path WIP inventory captured privately before integration; caches, emulator logs, credentials and build output excluded. Public evidence/runbooks/release notes included. v3.2.0 succeeds v3.1.0; no old tag overwritten.

## Candidate and compatibility

Includes Studio slash/block/focus/image/table/draft recovery/trash/SEO preview, article contents/copy/image/Mermaid controls, public search/recommendations, automatic comment checks and moderator reputation, shared session/streaming/loading and Satsunic privacy content. Preserve main strict server auth, atomic dual-budget limiter, secret references, patched transitive overrides and release tooling. Global is an alias of identity-global quotas, not a weaker limiter. Provider readback says Analytics=false,OneTap=false,rate mode=global,scheduler identity configured; candidate keeps those current flags. No Firestore/Storage rules, billing, IAM or destructive data migration. Server-only optional reputation records are bounded and require account erasure; old comments remain compatible.

Next streamed missing articles may return200 after loading headers. Installed Next docs confirm noindex soft404 semantics. Regression checks verify no private manuscript/noindex; API auth/media404 stays strict. No-JS is a readable linear fallback with reduced styling. Performance figures from PERFORMANCE042 retain their historical measured-source boundary and are not current field guarantees.

## Evidence

- Frozen install, version check v3.2.0, production-env validation, lint and typecheck pass; one existing proposal lint warning.
- Production build passes in isolated checkout. Main security overrides retained; lockfile adds existing table/auth dependencies without replacing patched lodash-es.
- Unit suite199 pass,11 opt-in skips. Separately all11 opt-in tests pass: comment moderation6, scheduled/reliability3,taxonomy1,atomic rate limits1. Demo only; no live data mutation.
- General core80 unique desktop/mobile cases pass across initial77 and serial rerun8;48 opt-in skips disclosed. Initial mobile context startup2 and catalog navigation1 failures resolved by serial revalidation; no app assertion removed. Firefox and WebKit smoke pass; initial WebKit context startup timeout rerun serially.
- Performance16/16 on integrated production build: slow/offline/session/logout/no-JS/related delay.
- CMS11/12 desktop/WebKit cases pass on isolated fresh Auth/Firestore/Storage. The remaining WebKit editor case completes application steps but hangs during context teardown on both runs; the same mobile Chromium workflow passes16.1s. This remains a browser-driver validation limitation. Coverage includes actual synthetic Google popup/session, membership/revocation, publication, media/private boundaries, comment counts, conflicts, offline drafts and natural editor workflow. Production Google OAuth/account credentials are not tested.
- Lighthouse3 URLs pass hard gates: accessibility1,SEO1,best practices0.96; performance home0.90,services/contact1.00. Laboratory only.
- REQUIRE_BLOG_RELEASE=true Firebase preflight passes. Existing backend hunpeolabs/hunpeolabs-prod/us-central1 accessible and runtime ready with Secret Manager reference/no emulator settings. Existing100% production revision hunpeolabs-build-2026-10-03-003 captured as rollback.
- Source/private-key/token/conflict-marker scan clear on explicit inventory; diff whitespace checked. No claim of exhaustive penetration testing or independent authenticated assurance.

## Review cycles and fixes

Cycle1 BLOCKED during integration: main rejected live global mode label; merged privacy copy said all comments required manual review; stale editor/sharing/status test selectors and unrecognized streamed status contract. Fixed by compatible atomic alias/validators, accurate private retention copy, current controls/status scopes and noindex/private-body checks. Unsafe staging on beaus-dev was rejected automatically; replaced with reviewed explicit file inventory and isolated main checkout. No bypass or force push.

Local shared test setup had old orphan media and lost emulator blobs, crashing Storage. Corrected with fresh task-isolated Firestore18082 and dedicated TMPDIR, retaining explicit demo/loopback guards. Popup/debug evidence confirmed real emulator relay; SDK responses not mocked. Browser startup contention corrected with serial replay. Fixtures reset only known synthetic global buckets; production quotas unchanged.

Cycle2 fresh scoped self-review of all seven required dimensions after corrections and verification. No open critical/high scoped findings. Review must be rerecorded against the committed candidate and after live deployment before final handoff.

## Rollout and remaining boundaries

User explicitly authorizes commit/push/main/tag/GitHub release/production. Non-force publication; stable v3.2.0 notes. Deploy only apphosting:hunpeolabs from clean integrated source. Capture source archive/rollout/build/revision and verify live health,canonical/security/privacy/blog/anonymous API. Roll back through immutable prior provider rollout if material smoke fails. Existing reputation/approved comments remain compatible on rollback and are not erased.

This report records preparation; publication/provider receipts are captured separately after execution. Live scheduled publication, spam detection accuracy, live OAuth, actual inbox delivery, field Core Web Vitals and independent assurance remain unverified. Analytics/OneTap remain disabled; no new provider spend or billing activation beyond authorized existing hosting rollout.

Intelligence DEGRADED after one failed refresh: stale CodeGraph/CocoIndex daemon-log permission issue; source/Git/compiler/tests bound conclusions. Selected profiles universal,typescript-javascript,web-app,frontend,concurrency,memory,security,visual,motion,seo. Runtime ledger is a local evidence record, not fabricated prior gateway transitions. Token usage/cost: Unavailable. Memory candidates: None.
