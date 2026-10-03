# HUNPEOLABS-PERFORMANCE-042 — Slow-network experience

Status: APPROVED / LOCAL_IMPLEMENTATION_COMPLETE. See approval, benchmark and completion artifacts for current evidence; no deployment.
Date: 2026-10-03. Candidate: b2779cf64f6a3df7a3ac1498ae3b67f267628fb6 plus current worktree WIP.

## Intelligence brief

Gate: DEGRADED after one refresh. CodeGraph current and healthy; CocoIndex still stale / health failed. Structural queries: `codegraph impact getPublished`, `codegraph callers useBlogSession`; relevant edges verified manually. Graph returned some unrelated edges; these are not treated as proven consumers. Native evidence: targeted source reads, rg, package.json, installed Next 16.3.8 fetching/loading guides. Repository map is a placeholder. No linked issue provided.

Scope: public website, blog listing/article, shared account controls. Existing editor/privacy WIP preserved. TypeScript 6, React 19.2.8, Next 16.3.8, Firebase Admin/Firestore/Storage, Vitest and Playwright. Applicable implementation profiles: web frontend, accessibility, security and performance; select exact repository profiles during approved implementation.

## Verified findings

1. Article page awaits getPublished, then awaits listPublished for related posts before returning article JSX. Related data blocks primary content. Metadata separately calls getPublished; repository function has no request memoization.
2. Blog listing metadata makes its own listPublished(limit:1) query. Filtered listing already parallelizes results and overview; preserve this.
3. Root loading.tsx returns PendingNavigation, which returns null; progress starts only in a client effect. No server-rendered content placeholder.
4. NavAccount and StudioNavLink independently mount useBlogSession; BlogAccountLink adds another consumer on listing. Each hook fetches session and registers focus/visibility/session-change handlers. GoogleOneTap has an additional session fetch when enabled. Shared session errors currently become anonymous in the hook.
5. Media API always uses private,no-store. readMedia verifies public reference or draft authorization, then downloads Storage bytes. Existing UI comment explicitly requires access checks on every request. Public CDN caching therefore needs separate lifecycle/security design, not a header substitution.
6. Root layout imports globals.css and blog-design.css on all routes: 261,218 bytes combined raw source, not compressed transfer size. Measure emitted assets before judging impact.
7. Hero animations take 750ms with staggered delays; product hero up to 900ms plus delay. Content reveal can affect perceived speed; no claim that it is the dominant bottleneck. Mermaid already uses dynamic import; do not propose this as a missing optimization.

## Recommended implementation, in order

### Phase 0 — establish comparable baseline

Record production-build measurements for home, products, blog list, article and category navigation. Use current worktree build, not next dev. Fixture/emulator blog dataset only; no production writes or provider-spend operations. Run at least five cold and warm samples per scenario with fixed browser, CPU and network profile. Report median and spread for TTFB, FCP, LCP, layout shifts, transferred JS/CSS/images, session request count and click-to-visible-content latency. Capture delayed API/503/offline cases separately. Field INP requires real-user evidence; scripted interaction latency is a laboratory proxy.

### Phase 1 — remove unnecessary waiting

- app/resources/blog/[slug]/page.tsx: move related posts to an async child under Suspense; article renders as soon as its own data arrives. Keep metadata/structured data and missing-post behavior.
- lib/blog/repository.ts or a focused public-read module: request-scoped React.cache wrapper for getPublished(slug), reused by metadata/page. No cross-request stale publication cache. Avoid object-key memoization pitfalls for listPublished; defer broad listing cache.
- app/resources/blog/loading.tsx and article loading.tsx, minimal scoped CSS: server-rendered layout-stable skeleton with accessible status; retain ActionProgress for actions. Static intro may render outside a data Suspense boundary in listing.
- components/use-blog-session.ts plus focused shared session store: deduplicate in-flight checks and subscriptions; reuse across consumers. Explicit unknown/error state, correct signed-in/out invalidation and focus refresh; session result remains private and is never used as server authorization.
- components/google-one-tap.tsx: integrate shared check only after verifying its verified/anonymous/outage semantics.

### Phase 2 — rendering and delivery after measurements

- app/layout.tsx, route layouts, styles/blog-design.css: move scoped blog/editor styling only if emitted-CSS baseline supports it; verify shared header/footer/account consumers first.
- styles/globals.css and motion-orchestrator: ensure critical copy is visible promptly, retain approved visual composition, reduced-motion behavior and JS-disabled readability. Limit motion changes to measured critical elements.
- components/blog-admin/ui.tsx: verify intrinsic image dimensions, responsive delivery and loading priorities without weakening media access checks.
- Media cache/CDN variants: separate proposal only. Must specify unpublish/revocation behavior, immutable variants, public/private separation and invalidation before implementation. No blanket public cache for current endpoint.

## Acceptance and risks

Primary article must render while related request remains deliberately stalled. Loading layout must be visible before hydration and avoid measurable new shifts. Shared mounted account consumers must produce one concurrent session check, with logout reflected everywhere; aborted/stale responses must not restore previous identity. API failure must not trigger misleading anonymous/login behavior. Preserve filters/cursor pagination, metadata, auth controls, media privacy, consent and reduced motion.

Compare approved implementation against baseline; report actual changes, no promised percent improvement. Suggested field targets: p75 LCP <=2.5s, INP <=200ms, CLS <=0.1; slow-network lab results reported independently, not guaranteed to meet field targets. Security risk highest in caching media and session lifecycle; first phase deliberately avoids persistent public data/media cache.

Validation: focused unit tests for session concurrency/invalidation/error races; Playwright delayed-related/session/media, slow network, direct navigation, keyboard/reduced motion, no-JS reading; relevant existing blog/session tests plus typecheck/build. Full gate and fresh final-implementation-review required after approved implementation. Rollback by reverting scoped changes; no DB migration, dependency, production deployment or credential change proposed.

## Evidence limits and handoff

Research is source-based, not a runtime performance benchmark. Network, cold-start, deployment region, compressed bundle weight and browser hydration contribution are NOT TESTED. No application test suite executed because this turn changes proposal documentation only. No production-readiness claim, deployment, PR or issue update. Memory candidates: None. Token usage/cost: unavailable from tools.

Approval requested for Phase 0 + Phase 1; Phase 2 requires measured findings and any material delta approval.
