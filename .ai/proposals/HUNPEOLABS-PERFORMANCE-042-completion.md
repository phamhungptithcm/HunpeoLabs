# HUNPEOLABS-PERFORMANCE-042 — Completion evidence

Date: 2026-10-03 (America/Chicago). Scope: approved Phase 0 + Phase 1; local implementation only.

## Result and candidate

Shared session checks now use one in-flight request with one browser listener set, bounded 10-second timeout, explicit unknown/authenticated/anonymous/unavailable states, pathname deduplication, and immediate identity invalidation. Disabled One Tap does not subscribe. Existing actor/checked consumers retain compatibility; only 401 confirms anonymous. No browser persistence or server authorization change.

Article metadata and page share a request-scoped React.cache reader. Related posts render under Suspense and their failure leaves the article readable. Blog/article loading shells render on the server with stable blocks and accessible status. Public blog layout supplies a no-JavaScript linear reading fallback for streamed main/article cards; this is necessary wiring for approved readability, not a wider redesign. The fallback uses semantic regions rather than framework IDs; some detached streamed regions lose scoped blog styling when JS is disabled. Normal JS composition is preserved.

Measured candidate: b2779cf64f6a3df7a3ac1498ae3b67f267628fb6 + approved source hashes in HUNPEOLABS-PERFORMANCE-042-candidate.json. Thirteen owned app/test paths. Existing privacy, editor, Mermaid, blog-content and blog-design WIP diffs were compared byte-for-byte against the starting diff and preserved. No dependency, public API, media-cache, database schema or deployment change by this task. Concurrent comment/moderation edits appeared after the benchmark and were preserved. Measurements stay bound to the measured build ID; current source snapshot is recompiled in an isolated copy and unit-tested after that drift, without attributing other changes to this task.

## Laboratory measurements

Same local production build configuration and isolated demo-hunpeolabs-performance-042 Firestore namespace; eight synthetic posts, no uploaded-image samples. Chromium viewport390x844, CDP configured latency150ms/down1.6Mbps/up0.75Mbps/CPU4x. Five fresh-context cold loads and five same-context warm loads per route, plus five category-navigation samples per mode; 50 scenarios per candidate. Full median/min/max and transfer measurements are in HUNPEOLABS-PERFORMANCE-042-benchmark.json; raw samples and runner are in /private/tmp/hunpeolabs-performance-042.

| Route / mode | LCP ms before → after | CLS before → after | Session GETs before → after |
| --- | --- | --- | --- |
| / cold | 992 → 992 | 0.000 → 0.000 | 2 → 1 |
| / warm | 200 → 204 | 0.000 → 0.000 | 2 → 1 |
| /products cold | 956 → 940 | 0.000 → 0.000 | 2 → 1 |
| /products warm | 200 → 200 | 0.000 → 0.000 | 2 → 1 |
| /resources/blog cold | 1284 → 1240 | 0.337 → 0.014 | 3 → 1 |
| /resources/blog warm | 516 → 536 | 0.337 → 0.014 | 3 → 1 |
| /resources/blog/performance-fixture-0 cold | 1312 → 1280 | 0.322 → 0.092 | 2 → 1 |
| /resources/blog/performance-fixture-0 warm | 512 → 520 | 0.322 → 0.092 | 2 → 1 |
| category-navigation cold | click 311 → 328 | N/A | N/A |
| category-navigation warm | click 264 → 284 | N/A | N/A |

The clearest gains are session deduplication and lower fixture layout shift. Cold blog/article LCP improves slightly; warm LCP and category navigation do not improve. This is not a statistically established general speed improvement. Cold total transfer increases by about 3.4KB on home/products and about 13.5KB on listing due to the added shared state/loading HTML; exact per-resource figures and ranges are preserved. Local response-start timings do not represent WAN RTT. No server process cold-start, live CDN/provider latency, representative media weight, field INP or production Core Web Vitals claim.

With an actual 4-second category-query delay through a localhost-only Firestore proxy, primary article became visible at 502ms (390px) / 401ms (1280px); related posts at 4315ms / 4211ms. Two probes only, not a percentile benchmark. No horizontal overflow or browser page errors in those probes. Screenshots of mobile/desktop skeleton and article, and no-JS fallback, were captured and visually inspected in /private/tmp/hunpeolabs-performance-042.

## Validation and quality gates

Detected: TypeScript6.0.3, React19.2.8, Next16.3.8, Node25.9.0 with manifest minimum>=24, pnpm runtime11.19.0 (manifest11.9.0), Vitest4.1.10, Playwright1.62.0. Installed Next fetching/loading guides and React noscript client handling inspected. Profiles selected: universal, typescript-javascript, frontend-html-css, web-app, concurrency, memory, seo-geo, visual-design, animation-motion.

| Gate | Status | Evidence |
| --- | --- | --- |
| Compilation | PASSED | pnpm build; isolated production build after concurrent discovery edits |
| Unit tests | PASSED | pnpm test after concurrent edits: 184 passed, 10 skipped in 3 opt-in suites; measured candidate previously had 171 passed / 4 skipped |
| Integration / browser | PASSED | blog-performance.spec.ts: 16/16 desktop/mobile Chromium scenarios; final isolated copy includes full-body no-JS assertions |
| Static / language-aware analysis | PASSED | pnpm lint, pnpm typecheck, scoped eslint; one existing warning in HUNPEOLABS-NAV-002-playwright.config.ts |
| Architecture | PASSED | bounded native call tracing, current CodeGraph wrapper impact and session callers; no contract/storage layering change |
| Language/version profile | PASSED | manifest, compiler, installed Next docs and selected profiles |
| Platform/domain profile | PASSED | public Next web app and private in-memory client session presentation |
| Public SEO/GEO | PASSED | raw Googlebot local HTML: status200, title/canonical present, Article JSON-LD parses, full fixture text present; no deployed SEO certification |
| Visual design / UI states | PASSED | 390px/1280px skeleton and article screenshots reviewed; no overflow; empty/failed optional content covered |
| Motion | PASSED | nonanimated skeleton; reduced-motion keyboard category flow; existing motion untouched |
| Security | PASSED | scoped source review, outage/401 distinction, invalid payload and stale identity tests; server auth/media access unchanged; no live penetration-test claim |
| Database migration | NOT_APPLICABLE | no migration or persistence change; synthetic fixture seed only in isolated local namespace |
| API compatibility | PASSED | session endpoint and public queries unchanged; actor/checked interface retained |
| Observability impact | PASSED | user-safe optional-content failure and bounded session failure reviewed; no production telemetry introduced |
| Diff self-review | PASSED | git diff --check, 13 path approval validations, exact unrelated-WIP diff comparison |
| Final implementation review | PASSED | three recorded cycles; latest cycle resolves both findings and reviews all seven dimensions |
| Search metadata/crawler/claims | PASSED | current metadata source + raw local crawler probe; lab claims explicitly bounded |
| Responsive/accessibility/lifecycle evidence | PASSED | accessible status, slow query, logout race, 401/503/offline, no-JS reading/listing, reduced motion and keyboard checks |

Existing skipped opt-in suites were not silently counted as passed. Browser mobile evidence is Chromium device emulation, not installed iOS Safari. Auth SDK/provider login is not configured in this fixture build; signed-in/out states in browser tests use synthetic session responses. Actual One Tap provider prompting and media transfer remain NOT TESTED. The optional-related failure path is exercised in a mocked renderer test; real delayed queries use the emulator proxy. Renderer may log destination-stream-closed on deliberate test cancellation; no browser page errors observed in visual probes.

## Review cycles

Cycle 1: BLOCKED. HIGH PERF-042-1: streaming concealed content with JS disabled; a loading-only fallback missed fast responses and independent streamed cards. Fixed by always-present semantic fallback in public blog layout; direct article body, listing and category navigation verified. MEDIUM PERF-042-2: unconditional One Tap subscription would add session GETs to ineligible admin routes. Fixed by disabled subscriptions; admin login has zero public session GETs in desktop/mobile tests. Initial tests also needed accurate selectors for collapsed mobile navigation and the Studio login surface; no production UI was changed to satisfy those assertions. One loading test rerun accidentally used the direct-emulator benchmark server; it failed because no delay was injected, then passed 2/2 against the required proxy entry point.

Cycle 2: PASSED scoped self-review, then marked STALE by unrelated concurrent comment/moderation worktree edits. At that cycle the 13 scoped source hashes remained unchanged. Later concurrent discovery edits changed the article page; the streaming fixture was adapted to its two-query shape and required tags without reverting those edits.

Cycle 3: fresh PASSED scoped self-review after current-build revalidation of requirements, security, code quality, failure paths, error handling, production readiness boundaries and trade-offs. No open actionable scoped findings. Authenticated independent review assurance is unavailable; local review does not certify release readiness.

## Governance and remaining work

All four local acceptance groups verified (equal weight, 100% of approved scope). Phase 2 CSS/bundle/media strategy remains separate and requires measured scope approval. Start gate was DEGRADED (CocoIndex unhealthy after one recovery); source/native fallback used under repository policy. Required post-change refresh later produced genuine READY for both indexes; CodeGraph structural and CocoIndex semantic results verified against source. A final documentation-only refresh then failed because the sandbox could not open /Users/hunpeo97/.cocoindex_code/daemon.log. Native source/hash/test evidence remains authoritative; no repeated indexing attempt. Legacy path validator initially required READY despite the fallback policy; all 13 owned paths passed validation against the genuinely READY post-source snapshot. Literal [slug] paths require fnmatch escaping in the approval record.

Production readiness: NOT_READY. No deployment/live provider acceptance, full release evidence, authenticated independent review or historical universal-gateway transition chain. The runtime ledger is a completion-evidence ledger initialized during this task, not a fabricated approval-transition history. Dirty shared worktree retained. Rollback: revert only the 13 owned source/test paths listed in the candidate manifest; no DB/config migration. No commit, push, PR or external work-item update.

Provider token usage: Unavailable. Actual billed cost: Unavailable. API-equivalent cost: Unavailable. Memory candidates: None.

Runtime report is rendered after recording this candidate's review and quality evidence; output: /private/tmp/hunpeolabs-performance-042/runtime-report.txt.

Latest revalidation: local harness port collision and subsequent shared-emulator shutdown caused setup failures; rerun on task proxy18142 forwarding to available emulator18080 passed all16 browser scenarios. Concurrent discovery changes initially broke incomplete streaming fixtures and briefly failed full-build inference; fixtures were updated, and the other task supplied the repository return annotation. Final source/hash and build evidence explicitly supersedes earlier revalidation. Measured timings retain their original source/build boundary.

Shared .next was concurrently regenerated, causing missing manifest/500 setup errors in a later rerun. Final browser validation uses a separate temporary source copy with its own installed locked dependencies and .next;13 scoped paths were byte-compared with the workspace. No project dependency or config was changed. The initially retried shared build was stopped.
