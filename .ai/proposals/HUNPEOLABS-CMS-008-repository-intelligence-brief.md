# Repository intelligence brief — CMS-008

Gate: DEGRADED. CodeGraph/CocoIndex tools installed but indexes missing/unhealthy. Native source/Git/compiler/provider/test evidence used, as explicitly permitted by repository AGENTS. Base cd2efa912b2f9be46d3e4d046270078bd53039bb.

Observed path: verified Google ID token → session limiter → secure session cookie; verified session → comment/report limiter → mutation. Atomic limiter consumes UID and per-action shared budget in one Firestore transaction, all reads before writes; HMAC IDs and TTL prevent storing raw UID/IP. Existing direct Cloud Run anonymous health was 403, so ingress=all alone is not a bypass finding.

Profiles: universal, TypeScript/JavaScript, web-app, API, database, concurrency, infrastructure/observability. Runtime Node25.9 local; package requires Node>=24, pnpm11.9; CI uses Node24. No dependency/schema/auth contract changes.

Affected source: lib/blog/rate-limit.ts; configuration and validators; guarded emulator fixtures; runbooks. Meaningful tests exercise budget limits, denial atomicity, headers, windows, malformed/config/provider failure, and actual emulator transaction contention. Current Next16.3.8 data-security/environment guides reviewed against unchanged server-only boundaries.

Operational evidence: daily Firestore schedule14d, three-region health300s/TLS/200/JSONok, enabled two-region300s email alert. No backup yet; recovery coverage and live identity acceptance remain NOT_TESTED. No production cleanup, export, restore or rollout.

Approval validator limitation: its generated implementation checker unconditionally requires READY, inconsistent with repository instructions permitting DEGRADED. Actual owner approval and bounded fallback evidence are recorded without relabeling the index status. Do not change this generated checker or claim its check passed.
