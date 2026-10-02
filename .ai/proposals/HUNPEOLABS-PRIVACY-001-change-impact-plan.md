# Change Impact Plan

Plan ID/version: HUNPEOLABS-PRIVACY-001-v4

## Repository Intelligence Gate

- CodeGraph status: Installed, configured, current, health check passed.
- CocoIndex status: Installed, configured, current, health check passed.
- Repository commit: `3d53e1b8201251cb28e02dbd2052ad36b1d67fec`
- Indexed commit: `3d53e1b8201251cb28e02dbd2052ad36b1d67fec`
- Brief path or summary: `.ai/local/HUNPEOLABS-PRIVACY-001-repository-intelligence-brief.md`

## Indexed Facts

- CodeGraph structural facts: Privacy is a public Next.js server route that conditionally discloses the validated contact provider. The site layout contains no analytics, advertising, consent, or third-party tracking scripts.
- CocoIndex semantic/documentation facts: Firebase App Hosting is the configured production runtime. Contact delivery is intentionally disabled. No analytics or error-monitoring provider is selected.

## Source-Code Verified Facts

- Paths/sections opened: Privacy, Contact, project brief client component, contact API/config, root layout, Firebase App Hosting config, security headers, production readiness, tests, and package manifest.
- Verified behavior: Production serves the old Privacy statement through Firebase while claiming production hosting has not been selected. The deployed form is disabled. Direct email is enabled. Current source has no account, payment, newsletter, analytics, advertising, or tracking integration.

## Problem Statement And Business Outcome

The current Privacy page is operationally worded, repetitive, and visually indistinguishable from generic legal copy. Replace it with a minimal statement and a distinctive, code-native visual story that makes the intended information flow understandable without adding paragraphs.

## Current Behavior And Verified Execution Flow

`GET /privacy` renders static public copy plus one runtime branch from `readContactDeliveryConfig()`. In production, the contact configuration is absent, so the disabled branch renders. Firebase App Hosting and its Google Cloud services serve the page and produce operational logs/metrics. Direct inquiries use `support@hunpeolabs.com`.

## Root Cause Or Capability Gap

The original pre-launch placeholder uses a shared PageHero and long legal-copy column. It exposes internal readiness details and has no page-specific illustration, hierarchy, or motion vocabulary.

## In Scope

- Rewrite the Privacy metadata description, hero, headings, and body copy.
- Explain how Hunpeo Labs uses information a visitor intentionally provides.
- State that Hunpeo Labs does not sell that information or use it for advertising.
- Provide a clear privacy-contact path.
- Keep the provider disclosure available only when project-brief delivery is configured.
- Replace the shared legal layout with the approved “calm signal” composition.
- Add a code-native You Share → We Understand → We Reply diagram with visually blocked Sell and Ads branches.
- Add responsive desktop and mobile compositions.
- Add purposeful one-time path, node, title, and section motion with a static reduced-motion equivalent.
- Preserve server-rendered content, accessibility, SEO, and the existing header/footer.

## Out Of Scope

- Legal advice or jurisdiction-specific compliance claims.
- Hosting, logs, cookies, analytics, monitoring, authentication, payment, newsletter, form-state, or infrastructure explanations.
- Contact-provider activation.
- API, runtime configuration, hosting, logging, retention, or deployment changes.
- New fonts, animation libraries, icon libraries, analytics, third-party scripts, or runtime raster assets.
- Production deployment.

## Change Area Boundary

One public content route, one dedicated illustration component, scoped styles, design evidence, and one focused browser test.

## Impact Boundary

- Direct: Privacy page visible copy, metadata, composition, SVG illustration, responsive behavior, and motion.
- Indirect: Search snippet, visitor expectations, and future contact-provider disclosure.
- No data-processing, storage, API, infrastructure, dependency, or contact-runtime behavior changes.

## Files Explicitly Approved For Change

- `.ai/proposals/HUNPEOLABS-PRIVACY-001-*.md`
- `.ai/local/HUNPEOLABS-PRIVACY-001-*.md`
- `.ai/local/implementation-approval.md`
- `app/privacy/page.tsx`
- `components/privacy-signal.tsx`
- `styles/globals.css`
- `tests/e2e/privacy.spec.ts`
- `docs/design/privacy/**`

## Areas Requiring Developer Review Before Touching

- The existing uncommitted Direct Email addition in `app/privacy/page.tsx`; implementation must replace it intentionally without affecting unrelated dirty files.
- `styles/globals.css` is already modified by another approved scope; implementation must add a namespaced Privacy block without changing existing hunks.
- `tests/e2e/site.spec.ts` is already modified by another approved scope and will not be edited; Privacy receives a separate focused spec.
- Contact delivery, Firebase configuration, email retention, and production deployment remain separately controlled.

## Reason No Other Area Is Changed

The current server route exposes the exact conditional behavior needed. A dedicated visual component and namespaced styles are required to deliver the approved composition without altering shared PageHero behavior or unrelated pages.

## Proposed Solution

Replace the current notice with the following minimal English copy:

### Metadata

- Description: `A simple explanation of how Hunpeo Labs uses the information you choose to share.`

### Hero

- Index: `Privacy`
- Title: `Privacy, without the maze.`
- Description: `Share only what you’re comfortable with. We’ll keep it to the conversation you started.`

### When you reach out

`We use what you share to understand your needs and get back to you.`

### Nothing more

`We don’t sell your information or use it to target ads.`

### Project brief — configured branch only

`Project briefs are delivered through {providerName}.`

The configured `retentionNotice` remains visible as the next sentence. This entire section renders only when delivery is configured; the current disabled state adds no form explanation to Privacy.

### Still curious?

`Talk to us at support@hunpeolabs.com.`

### Visual direction

- Design read: `A calm engineering signal that shows information taking one short, intentional path.`
- Desktop mockup: `docs/design/privacy/privacy-desktop-v2.png`
- Mobile mockup: `docs/design/privacy/privacy-mobile-v2.png`
- Composition:
  - asymmetric hero with headline left and information-flow diagram right;
  - large horizontal editorial statements on desktop;
  - vertical diagram and statement rail on mobile;
  - no generic cards, legal accordions, stock locks, shields, photography, or decorative gradients.
- Diagram:
  - main path: `YOU SHARE → WE UNDERSTAND → WE REPLY`;
  - blocked branches: `SELL`, `ADS`;
  - thin Hunpeo blue paths, square nodes, pulse marks, protected core, pale grid.

### Motion direction

- One-time hero title reveal: opacity plus `translateY(14px)`, maximum 520ms with short line stagger.
- Main path draw: stroke dash animation, maximum 760ms.
- Signal travel: one soft comet pulse moves from `YOU SHARE` to `WE REPLY` once, maximum 860ms.
- Blocked branches: each dashed line approaches its gate, fades, and retracts once, maximum 480ms.
- Core bloom: one low-opacity halo expansion, maximum 360ms.
- Editorial rail and statements: the rail draws once and statements reveal through the existing observer.
- Link hover/focus: underline or arrow translation only.
- No infinite orbit, repeating pulse, parallax, scroll hijacking, large zoom, animated blur, or new runtime animation dependency.
- Reduced motion: every element renders immediately in its final state; meaning does not depend on motion.

### Fidelity acceptance clarification

The user reconfirmed on 2026-07-29 that the implementation must match the approved
desktop and mobile v2 mockups, not only their general direction. Acceptance therefore
includes:

- two-line hero title at the reference proportions;
- desktop horizontal and mobile vertical four-stage signal flow, including separate
  share, understand, protected-core, and reply nodes;
- dashed Sell and Ads branches, stop markers, square gates, technical grid details,
  directional arrows, and restrained core glow;
- desktop horizontal statement rail with large blue numbers and compact regular-weight
  body copy;
- mobile vertical statement rail with large blue numbers and horizontal dividers;
- reference-like section density and spacing at 1536 × 1024 desktop and the supplied
  863 × 1822 mobile composition, while remaining responsive at browser mobile widths.

This is a fidelity correction inside the already approved files and behavior. It does
not add content, dependencies, assets, integrations, data behavior, or deployment scope.

## Alternatives And Trade-Offs

- Patching only the outdated hosting sentence is smaller but leaves the page verbose and internally focused.
- A generic legal template would look comprehensive but would introduce unsupported claims and obscure current behavior.
- The recommended copy is intentionally limited to four visible sentences in the current production state. Visual interest comes from hierarchy, line art, and motion rather than added content.

## Expected File/Module/Class/Function Changes

- `app/privacy/page.tsx`
  - Update `metadata.description`.
  - Replace `PageHero` and `legal-copy` with the approved semantic Privacy composition.
  - Preserve `readContactDeliveryConfig()`, `providerName`, `retentionNotice`, and `SITE_CONTACT_EMAIL`.
  - Render nothing about the form while delivery remains disabled.
- `components/privacy-signal.tsx`
  - Add desktop and mobile SVG compositions with unique marker IDs and decorative semantics.
  - Keep all visible meaning duplicated in adjacent HTML copy so the diagram can remain `aria-hidden`.
- `styles/globals.css`
  - Add only `.privacy-*` selectors, scoped keyframes, responsive layout, focus behavior, and reduced-motion final-state rules.
- `tests/e2e/privacy.spec.ts`
  - Verify content, link, diagram, desktop/mobile overflow, and reduced-motion visibility.
- `docs/design/privacy/**`
  - Preserve the desktop/mobile mockups and design/motion contracts as review evidence.

## Callers, Consumers, Contracts, Data, And Integrations

Human visitors, crawlers, and search snippets consume the rendered content. No API, data, cookie, provider, or configuration contract changes.

## Existing Behavior To Preserve

- Canonical `/privacy` route and indexability.
- Server rendering, global header/footer, canonical route, metadata system, and global focus behavior.
- Direct email link.
- Fail-closed contact-delivery branch.
- Dynamic provider name and reviewed retention notice when configuration becomes valid.
- All unrelated dirty-worktree changes.

## Security, Privacy, Transaction, Concurrency, And Data Integrity

- No new data collection or processing.
- No secret or provider configuration exposure.
- No database, transaction, concurrency, or persistence impact.
- Content must avoid claims about infrastructure, technical data, or a direct-email retention/deletion commitment.

## Performance And Capacity

No new client component, JavaScript dependency, network request, or runtime bitmap asset. One small server-rendered SVG component and scoped CSS increase HTML/CSS size; paths and transforms remain bounded.

## Backward Compatibility

No route, metadata shape, shared component API, or contact contract change.

## Failure, Timeout, Retry, And Rollback

No runtime failure path changes. If SVG or CSS fails, semantic copy remains readable in normal document flow. Rollback is the bounded page/component/style/test patch.

## Test And Regression Strategy

- Run `pnpm lint`.
- Run `pnpm typecheck`.
- Run the new focused Privacy Playwright spec on desktop and mobile.
- Run `pnpm build` or report any unrelated dirty-worktree blocker with evidence.
- Inspect rendered `/privacy` HTML for the four intended sentences, email link, metadata, diagram labels, and absence of the disabled-form explanation.
- Capture desktop and mobile screenshots against the approved mockups.
- Verify keyboard focus, 200% zoom, reduced motion, repeated navigation, console, no horizontal overflow, and no layout shift caused by animation.

## Detected Stack And Quality Profiles

- Languages and versions: TypeScript 6.0.3, TSX, HTML.
- Application/platform/domain: Public Hunpeo Labs marketing website and privacy disclosure.
- Frameworks and runtimes: Next.js 16.2.12, React 19.2.8, Node.js 24+.
- Build tools and package managers: pnpm 11.9.0, ESLint 9, Vitest 4.1.10, Playwright 1.62.0.
- Selected `.ai/quality-profiles/`: universal, typescript-javascript, frontend-html-css, web-app, seo-geo, visual-design, animation-motion, concurrency, memory.
- Code-quality checks required after implementation: lint, typecheck, build, focused browser regression, rendered HTML/header inspection, responsive screenshots, reduced-motion verification, repeated-navigation lifecycle review, and diff self-review.

## Code Quality Risks To Review

- Language/version best practices: Keep the route as a server component and preserve typed config access.
- Platform/domain best practices: Keep primary content in server-rendered HTML and links accessible.
- Clean code / maintainability: Keep the illustration in one focused server component and namespace every selector/keyframe.
- API compatibility: No change.
- Performance-sensitive paths: Review SVG path count, paint area, animation properties, and mobile layout; use opacity/transform/stroke-dash only.
- Database connection/session/cursor lifecycle: Not applicable.
- Transaction and migration safety: Not applicable.
- Concurrency, deadlock, thread/goroutine/task leak risk: No new async work; reuse the existing observer and confirm route changes do not duplicate animation state.
- Heap/resource memory risk: No new listener, timer, rAF, or persistent animation handle.

## Documentation, Specification, And Diagram Updates

Add design brief, direction, motion contract, and approved desktop/mobile mockups under `docs/design/privacy/`. No operational documentation or architecture diagram change is required.

## Deployment Or Migration Steps

None approved. A future deployment must use the existing reviewed Firebase rollout workflow and verify the live Privacy page separately.

## Assumptions, Unknowns, And Risks

- The page remains English to match the current site.
- The direct-email retention schedule remains unknown and is not discussed.
- The notice is product-specific operational transparency, not jurisdiction-specific legal advice.
- Functional risk remains low because data behavior does not change. Visual regression risk is medium because the approved scope adds responsive composition and motion in a dirty shared stylesheet.

## Approval Decision Requested

Approve `HUNPEOLABS-PRIVACY-001-v4` to implement the exact natural-language copy, visual direction, responsive compositions, and motion contract above in the explicitly listed files. No API, data behavior, configuration, dependency, or deployment change is included.
