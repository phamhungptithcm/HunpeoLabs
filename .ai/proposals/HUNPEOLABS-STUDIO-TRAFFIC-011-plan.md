# HUNPEOLABS-STUDIO-TRAFFIC-011-v1
Approval status: APPROVED
Approver: User in current conversation
Approval evidence: 2026-10-07 apporved
Date: 2026-10-07
Repository intelligence: DEGRADED; stale CodeGraph/CocoIndex, source verified with bounded reads.

## Observed implementation
- lib/blog/views.ts uses validated postId/session UUID, same-origin API, network rate limits and Firestore transaction. blogPostStats.views counts one visible article open per post/session per 24 hours; it does not prove reading.
- components/blog-views.tsx uses sessionStorage; unavailable storage falls back to GET without recording. Timeout/network failures do not affect article reading.
- app/admin/blog/page.tsx calls requireStaff; dashboard table has no view column. No first-party site traffic aggregation is currently wired into Studio.
- Firebase Analytics is optional and consent controlled. Existing provider/ingress prerequisites can produce 503; no production configuration/readback performed for this task.

## Proposed UX and definitions
Studio /admin/blog: compact traffic panel above article table. Four cards: Visits (30 minute idle session), Website page views, Blog opens, Engaged reads. Filters: Today, 7 days, 30 days; daily trend, timezone label, last update and collection start date. A visitors-per-day measure may be displayed only as anonymous browsers with allowed identifiers, never as exact people or a sum presented as cross-day unique visitors.
Table: Lượt xem and Đã đọc columns, right-aligned formatted numbers, sortable within current loaded page only unless server-backed ordering is implemented and verified. Mobile uses compact row metrics without horizontal overflow.
Unknown/error/loading states use — or retry rather than fake zero. A real initialized zero shows 0. Include a concise metric explanation.
Blog opens retain existing 24-hour post/session dedup semantics and legacy total. Engaged reads are a new metric: visible active reading >=10 seconds AND article progress >=25 percent (short articles use visible article end); one per post/session per24h, with clear start date. This is a proxy, not proof of comprehension.

## Capture and privacy
Capture eligible public route transitions, including anonymous readers without login; exclude /admin, Studio preview, API, assets, health probes and authenticated staff traffic from new analytics. Keep existing legacy views semantics labeled separately if staff exclusion changes them.
Honor current optional analytics consent. Consent-denied visitors do not receive persistent tracking identifiers. Offer non-identifying aggregate server request counts separately only after privacy/policy review, explicitly labeled requests including possible bots; do not call these visitors or readers. Do not bypass consent, use fingerprinting or store raw IP, email, full referrer/query strings.
No claim of 100 percent capture: blockers, offline clients, bots, device changes and denied consent constrain measurement. Retry bounded failed requests while page alive; idempotent nonce means duplicate retries cannot inflate counts. No unbounded offline outbox or third-party provider change.

## Backend and database
Add first-party POST /api/traffic route with strict bounded schema, route allowlist, same-origin, trusted-ingress rate limiting, server timestamps, verified published post and authenticated staff exclusion. Client activity evidence cannot be treated as trusted security evidence; enforce sensible caps, bot filtering and abuse limits.
Use new trafficDaily/{day}/shards/{shard}, trafficReceipts/{hashed-receipt}, and blogPostStats additive fields (merge, preserve existing views/shares). Bounded shard count prevents a single hot global counter. Transaction receipt+counter atomicity handles concurrent retries. TTL receipts enforce dedup retention; do not rely on TTL deletion timing for dedup validity. No raw visitor event archive by default.
Studio server read aggregates daily shards for bounded date ranges; batch post stats for the loaded page to avoid per-row API calls. Reports restricted to verified admin/analytics permission, not every author; authors see authorized post stats only. Firestore rules deny direct public stats/receipts writes and sensitive reads; API uses existing server credentials.
Historical site visitors/engaged reads are unavailable before start date; do not backfill fabricated totals. Existing blog views preserved. Future report sorting/export or third-party GA integration deferred.

## Impact and files
- New lib/traffic/{schema,aggregation,repository,session}.ts, app/api/traffic/route.ts and components/site-traffic.tsx for bounded collection and aggregation.
- components/blog-views.tsx / lib/blog/views.ts: retain existing public view behavior; integrate separate engaged-read event and preserve counters.
- app/layout.tsx: scoped public collector; preserve consent and Google One Tap.
- app/admin/blog/page.tsx, components/blog-admin/dashboard.tsx, associated Studio styles and lib/blog/repository.ts: authorized aggregates + batch row stats.
- firestore.rules and firestore.indexes.json: server-only collections/TTL config, no public permissions widened.
- app/privacy/page.tsx and docs/operations/studio-traffic.md: definitions, retention, known limitations and collection start.
- Focused tests under tests/unit and emulator/API + browser coverage for the affected flows.
Architecture: TypeScript/Next16.3.8/Firebase existing stack, no dependency/provider additions. Risk medium: telemetry, authorization, concurrency, spend. Preserve unrelated dirty work.

## Validation and delivery
Validate dedup/concurrency, repeated refresh, route transitions, hidden tabs, eligible read threshold, short articles, denial/revocation, blocked storage, bot/staff exclusion, invalid paths/post IDs, replay/rate-limit, overflow, storage/API failures and cleanup.
Verify admin permission boundaries, no false zero on stats failure, batch reads and mobile/keyboard UX. Run lint/typecheck/focused tests/build and source security review; final-implementation-review with task report. Emulator/browser evidence is distinct from production readback.
Cost control: bounded date ranges, batched reads, aggregated sharded counters, TTL, no realtime listener per row; document request/write estimates and configurable caps. Deployment and new production TTL/IAM configuration require separate release scope; do not promise a dollar ceiling before workload evidence.

### Approved chart refinement (user Oct 8)
Four metric cards with small SVG trends, plus daily comparison with zero baseline, legend, day selector and accessible table. React owns SVG; bounded 30 points per series; no new dependency, smooth decorative interpolation or inferred historical data. Mobile uses two columns. Visitors remain labeled sessions, not unique people.

### Navigation refinement approved by direct user request
Move TrafficPanel from article dashboard to /admin/blog/analytics, labeled Phân tích in desktop/mobile navigation and breadcrumb. Admin-only page and navigation; preserve post-stat columns, collector, API and database. Exclude analytics route from editor shell detection. Validate typecheck, scoped lint, route authorization and navigation/source regression.

### Approved deep tracking hardening (direct user request)
Audit every current public route, visible entry, article read threshold, consent, retry/timeout and aggregate integrity. Fix request timeout isolation, out-of-order page/read visit counting, stable article collector placement, corrupt/overflow counters; add executable coverage. Document disabled production prerequisites without enabling live configuration or deploying.

### Production release approved Oct 8
User explicitly approves commit/push main, production deployment and missing configuration. Isolated clean main checkout preserves shared WIP. Enable first-party consent tracking at build/runtime, deploy non-destructive TTL configuration, preserve One Tap/GA/contact settings. Use existing shared rate-limit service with global 1200 events/10min and per-session 120 events/10min; do not trust spoofable IP headers. Global cap can undercount during abuse or heavy traffic; not a guaranteed monthly billing ceiling. No dependency or IAM expansion. Verify candidate tests/build, deployed revision, live capture and login controls. Rollback previous App Hosting revision, preserve additive counters.

### Approved release-gate fixes under user authorization
CI identified one real Services no-JavaScript regression: static content streamed inside a hidden Suspense container. Remove the unnecessary Services loading boundary; existing global action progress handles client transitions. Preserve all six service links/content. Correct three stale E2E selectors: select the canonical scope paragraph for advisory boundaries, assert real 404 heading on removed company/about route, and check live toast outcomes for contact clipboard/email. No auth/database/config changes. Validate fresh build and rerun full CI; deploy patch only after source verification.

Cross-browser CI found an additional stale CSP assertion: token ordering changed when Firebase Google sign-in allowed apis.google.com. Parse script-src and require each previously expected source plus Google's auth source, preserving no-ads and security header assertions. No application CSP change, skip, threshold reduction or new permission.
