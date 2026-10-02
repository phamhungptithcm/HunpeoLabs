# Change Impact Plan

Plan ID/version: HUNPEOLABS-PRODUCT-PAGES-001-v1

## Repository Intelligence Gate

- CodeGraph status: Installed, configured, current, health check passed.
- CocoIndex status: Installed, configured, current, health check passed.
- Repository commit: `3d53e1b8201251cb28e02dbd2052ad36b1d67fec`
- Indexed commit: `3d53e1b8201251cb28e02dbd2052ad36b1d67fec`
- Brief path or summary: `.ai/local/HUNPEOLABS-PRODUCT-PAGES-001-repository-intelligence-brief.md`

## Indexed Facts

- CodeGraph structural facts: `content/site.ts` owns product/work identity; `/products/[slug]` resolves the product registry and emits Product/SoftwareSourceCode structured data; `/work/[slug]` redirects overlapping product work; product routes feed sitemap and `llms.txt`.
- CocoIndex semantic/documentation facts: AI Agent Kit and IncOv already have source-backed product purpose, maturity, boundaries, capabilities, and workflows. Gig is verified public open-source work with release-evidence positioning but is not yet a canonical product.

## Source-Code Verified Facts

- Paths/sections opened: product/work routes, `content/site.ts`, `components/detail-page.tsx`, `components/product-system-visual.tsx`, sitemap, `llms.txt`, product listing, public open-source page, tests, build commands, visual and animation rules.
- Verified behavior: AI Agent Kit and IncOv render through one generic text-only detail component. Gig renders at `/work/gig`. Product detail pages do not expose demo media, install/source/support actions, bespoke visual narratives, or concise product-specific FAQ content.

## Problem Statement And Business Outcome

The current product links open generic text profiles that do not show the products clearly. Create three canonical, independently designed product pages that communicate value quickly, show real product evidence, provide source/support paths, and remain honest about maturity.

## Current Behavior And Verified Execution Flow

`products` → `/products` and `/products/[slug]` → generic `DetailPage` → metadata and structured data. `work` → `/work` and `/work/[slug]`; overlapping items redirect only when `productSlug` is present. Media is not part of the current product-detail flow.

## Root Cause Or Capability Gap

The `Product` registry contains only generic copy fields and the detail route has one service-like layout. Gig is modeled only as work. There is no product-page presentation model or media contract.

## In Scope

- Save the three approved mockups as design evidence.
- Add Gig as a canonical product and redirect `/work/gig` to `/products/gig`.
- Add a typed product-page presentation registry for concise copy, video/poster metadata, workflows, capabilities, FAQs, CTA, source, and support.
- Build three product-specific page compositions sharing only the Hunpeo Labs shell and design tokens.
- Add verified product demo media or honest static fallback/poster when video generation is unavailable.
- Preserve SEO metadata, canonical URLs, structured data, sitemap, `llms.txt`, accessibility, reduced motion, and responsive behavior.
- Add proportional unit/E2E/browser visual evidence.

## Out Of Scope

- Production deployment, analytics, contact-provider activation, authentication, pricing, customer proof, fabricated metrics, new dependencies, or changes to the related product repositories.

## Change Area Boundary

Public product content, routes, components, styles, media, design documentation, and focused tests in the Hunpeo Labs website only.

## Impact Boundary

- Direct: `/products`, `/products/ai-agent-kit`, `/products/incov`, `/products/gig`, `/work/gig`, open-source links, product metadata/structured data, media payload.
- Indirect: sitemap and `llms.txt` automatically consume the product registry.
- No database, authentication, contact delivery, secret, infrastructure, or production data impact.

## Files Explicitly Approved For Change

- `.ai/proposals/HUNPEOLABS-PRODUCT-PAGES-001-*.md`
- `.ai/local/HUNPEOLABS-PRODUCT-PAGES-001-*.md`
- `ai/local/HUNPEOLABS-PRODUCT-PAGES-001-*.md`
- `.ai/local/implementation-approval.md`
- `docs/design/product-pages/**`
- `docs/product-pages.md`
- `content/site.ts`
- `content/product-pages.ts`
- `app/products/**`
- `app/work/**`
- `app/resources/open-source/page.tsx`
- `components/product-detail-page.tsx`
- `components/product-detail-visuals.tsx`
- `components/product-video.tsx`
- `components/product-system-visual.tsx`
- `styles/globals.css`
- `public/media/products/**`
- `lib/structured-data.ts`
- `tests/e2e/site.spec.ts`
- `tests/unit/content.test.ts`
- `tests/unit/structured-data.test.ts`
- `tests/unit/seo.test.ts`

## Areas Requiring Developer Review Before Touching

- Existing unrelated dirty-worktree changes in `styles/globals.css`, `tests/e2e/site.spec.ts`, Contact/Privacy/SEO/Firebase files.
- Any related project repository outside HunpeoLabs.
- Production configuration or deployment.

## Reason No Other Area Is Changed

The existing registry, metadata, sitemap, and layout architecture can support the feature without dependencies, infrastructure changes, or broad refactoring.

## Proposed Solution

Keep one canonical product identity registry and add a separate typed presentation registry. Render a product-specific server component selected by slug. Use semantic HTML/CSS/SVG for key diagrams and native `<video>` for source-backed demos, with poster and static fallback. Use CSS-only motion with reduced-motion behavior.

## Alternatives And Trade-Offs

- Three unrelated route implementations would maximize freedom but duplicate accessibility, CTA, FAQ, media, and SEO behavior.
- One generic template would be maintainable but fail the approved requirement that each product has its own page story.
- The chosen approach shares primitives and contracts while keeping bespoke hero/workflow/evidence compositions.

## Expected File/Module/Class/Function Changes

- `content/site.ts`: add Gig product identity and canonical work mapping.
- `content/product-pages.ts`: add typed presentation data for all three products.
- `app/products/[slug]/page.tsx`: render bespoke product detail and keep metadata/JSON-LD.
- `components/product-detail-page.tsx`: shared semantic page contract and product-specific composition routing.
- `components/product-detail-visuals.tsx`: source-backed diagrams for control, incidents, and releases.
- `components/product-video.tsx`: accessible native video/poster/fallback.
- `app/products/page.tsx` and `components/product-system-visual.tsx`: include Gig and link each product card to its canonical page.
- `styles/globals.css`: scoped product-detail visual system and responsive/reduced-motion states.
- Tests/docs/media: focused regression evidence and saved design artifacts.

## Callers, Consumers, Contracts, Data, And Integrations

Public browser/search/AI clients consume rendered HTML, metadata, JSON-LD, sitemap, and `llms.txt`. GitHub links remain source-verified. No runtime third-party integration is added.

## Existing Behavior To Preserve

Sticky navigation, brand tokens, service/work pages, honest maturity boundaries, fail-closed search metadata, keyboard/focus behavior, reduced motion, and current unrelated user changes.

## Security, Privacy, Transaction, Concurrency, And Data Integrity

No user data or persistence. Video is local static media. External links use existing trusted repository URLs. No secrets or remote runtime fetches.

## Performance And Capacity

Use compressed local media with posters, preload metadata only, responsive sizing, and no animation library. Avoid layout shift and pause motion when reduced motion is requested.

## Backward Compatibility

Existing AI Agent Kit and IncOv URLs remain. `/work/gig` becomes a permanent canonical redirect to `/products/gig`. Product index and discovery outputs gain Gig.

## Failure, Timeout, Retry, And Rollback

If video cannot load, show the poster and source-backed visual explanation. Rollback is the bounded product-page/data/style/media patch; no migration is required.

## Test And Regression Strategy

- Lint, typecheck, unit tests, production build.
- E2E for three canonical routes, headings, maturity/boundary, source/support CTAs, video/fallback, Gig redirect, mobile overflow, and reduced motion.
- Browser screenshots at desktop and mobile compared to the approved mockups.
- Verify canonical metadata, JSON-LD, sitemap, `llms.txt`, console, and media responses.

## Detected Stack And Quality Profiles

- Languages and versions: TypeScript 6, CSS, HTML.
- Application/platform/domain: Next.js 16 public marketing/product website.
- Frameworks and runtimes: React 19, Node 24+.
- Build tools and package managers: pnpm 11, ESLint, Vitest, Playwright.
- Selected `.ai/quality-profiles/`: universal, typescript-javascript, frontend-html-css, web-app, seo-geo, visual-design, animation-motion.
- Code-quality checks required after implementation: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, focused and core Playwright.

## Code Quality Risks To Review

- Preserve server-component rendering and avoid unnecessary client JavaScript.
- Keep presentation data typed and source-backed.
- Avoid global CSS regressions in the dirty worktree.
- Ensure video loading does not harm LCP or mobile overflow.
- No database, transaction, concurrency, or heap-sensitive runtime path is introduced.

## Documentation, Specification, And Diagram Updates

Save approved mockups, document route/content/media contracts, and record visual, motion, SEO, and quality review evidence.

## Deployment Or Migration Steps

No deployment is approved. Build output is the verification target. Static media ships with a future separately approved deployment.

## Assumptions, Unknowns, And Risks

- Related repositories may contain reusable real demo media; this must be verified before copying.
- Sora generation requires a locally configured key and access; if unavailable, use real project media or source-backed browser/terminal capture.
- Exact 100% raster-to-browser identity is not measurable; implementation will be evaluated against layout, hierarchy, copy, color, spacing, and responsive screenshots.

## Approval Decision Requested

APPROVED by the user in the current Codex task on 2026-07-29: “Approved lưu thiết kế này lại sau đó implement ui change giống 100% như đã thiết kế…”
