# Repository Intelligence Brief

## Gate Status

- CodeGraph: Installed, configured, current, health check passed.
- CocoIndex: Installed, configured, current, health check passed.
- Repository commit: `3d53e1b8201251cb28e02dbd2052ad36b1d67fec`
- Indexed commit: `3d53e1b8201251cb28e02dbd2052ad36b1d67fec`
- Gate result: `READY`

## Task Context

- Business outcome: Make `/company/principles` easier to understand, shorter, more memorable, and visually distinctive without weakening the existing Hunpeo Labs brand or inventing public claims.
- Request or work item: User request in the current Codex task to redesign the Principles page with simpler language, a flow or chart, and calm contextual motion.
- Scope: One public Next.js route, its principle content, one dedicated code-native flow component, route-scoped styles, focused tests, and design evidence.
- Constraints: Existing-system approval gate; preserve the sticky header/footer and all unrelated dirty-worktree changes; English remains the site language; no dependency, external asset, runtime data, API, infrastructure, or production deployment change.

## Indexed Facts

- CodeGraph structural facts:
  - `app/company/principles/page.tsx` is the route entry point.
  - The route renders shared `PageHero` and maps `principles` from `content/site.ts`.
  - `principles` has two route references and coverage in `tests/unit/content.test.ts`.
  - `PageHero` is shared by Principles, Open Source, and resource placeholders, so changing it would broaden the blast radius.
  - `MotionOrchestrator` adds `reveal-section` and `is-visible` to direct `main > section` elements and owns the shared `IntersectionObserver` lifecycle.
- CocoIndex semantic/documentation facts:
  - Existing approved visual direction is a true-white, near-black, muted-gray, one-blue-accent editorial system with square geometry and thin engineering lines.
  - Existing motion contracts prefer static-first meaning, bounded one-time CSS motion, no persistent loop, and immediate final state under reduced motion.
  - Existing Privacy design evidence establishes a compatible code-native SVG, asymmetric composition, desktop/mobile adaptation, and dependency-free motion pattern.

## Source-Code Verified Facts

- Exact paths/sections opened:
  - `app/company/principles/page.tsx`
  - `components/page-hero.tsx`
  - `components/motion-orchestrator.tsx`
  - `components/site-header.tsx`
  - `app/layout.tsx`
  - `content/site.ts`
  - `styles/tokens.css`
  - relevant `.page-hero`, `.principles-index`, `.reveal-section`, responsive, and reduced-motion rules in `styles/globals.css`
  - `tests/unit/content.test.ts`
  - Principles coverage in `tests/e2e/site.spec.ts`
  - `docs/design/privacy/*`
  - `package.json`
  - `.ai/context/build-test-commands.md`
- Verified behavior:
  - The page is server rendered and currently contains one hero section plus one section containing five long principle articles.
  - Each principle has a title, summary, `In practice`, and `We avoid` paragraph.
  - There is no dedicated Principles visual or page-specific motion.
  - Shared reveal motion applies only at direct-section level.
  - Browser inspection at 1536 × 1024 and 390 × 844 found no horizontal overflow.
  - At 390 × 844, the page is approximately 3317px tall and the first principle article is approximately 469px tall.
  - The current header, footer, metadata helper, and public-content registry already provide the shell and contracts the redesign should preserve.

## Relevant Modules

- `app/company/principles/page.tsx`: Route composition and metadata.
- `content/site.ts`: Canonical principle wording consumed by the route and unit tests.
- `components/motion-orchestrator.tsx`: Existing shared section-reveal lifecycle; reuse without modification.
- `components/site-header.tsx` and `app/layout.tsx`: Shared shell to preserve without modification.
- `styles/tokens.css`: Authoritative color, typography, spacing, gutter, and motion tokens.
- `tests/unit/content.test.ts`: Existing content-registry contract.
- `tests/e2e/site.spec.ts`: Existing route-ownership assertion; preserve without modifying this already-dirty file.

## Entry Points And Call Paths

- Entry point: `GET /company/principles` → `PrinciplesPage`.
- Main callers/callees: `PrinciplesPage` → `createPageMetadata`, current `PageHero`, and `principles`.
- Downstream consumers: Human visitors, crawlers/search snippets, unit tests, Playwright route assertions, and the shared `MotionOrchestrator`.

## Data Stores And Contracts

- Tables, views, migrations, or datafixes: None.
- APIs, events, schemas, or external contracts: None.
- Public contract: Stable `/company/principles` URL, server-rendered semantic HTML, metadata/canonical behavior, and the Principles page remaining the detailed source for operating practices.

## Related Specifications And ADRs

- `docs/design/privacy/design-brief.md`: Existing brand, responsive, accessibility, and implementation constraints.
- `docs/design/privacy/design-direction.md`: Approved one-accent editorial language and code-native diagram pattern.
- `docs/design/privacy/motion-contract.md`: Bounded one-time animation and reduced-motion rules.

## Related Tests

- Existing tests:
  - `tests/unit/content.test.ts` asserts five complete principles.
  - `tests/e2e/site.spec.ts` asserts the Principles page owns detailed operating-method content and the Work page does not duplicate it.
- Missing regression tests:
  - No Principles-specific visual-flow, responsive-overflow, or reduced-motion test.
  - No exact compact-copy assertion.

## Potential Impact Areas

- Direct: Visible English copy, route metadata, route composition, semantic flow figure, responsive layout, and motion.
- Indirect: Search snippet and visitor understanding of how Hunpeo Labs works.
- Operational: Static HTML/CSS/SVG only; no runtime service or deployment impact.
- Security/data: No authentication, authorization, PII, data collection, storage, API, or secret impact.

## Brainstorming Record

- Assumptions:
  - “phù hợp ngữ cảnh” means the redesign should fit the existing company/engineering context rather than introduce a different art direction.
  - English remains the public-site language.
- Unknowns:
  - No user-research evidence establishes which principle wording is easiest for the target audience.
  - The generated mockups remain review concepts until the user explicitly approves them.
- Alternative solutions:
  - Copy-only reduction: smallest code diff but does not satisfy the requested flow/chart or visual interest.
  - Add a generic card grid: easy to implement but conflicts with the existing open editorial system and would remain repetitive.
  - Recommended connected-signal journey: short copy, one explanatory flow, and one open narrative rail using existing tokens and motion ownership.
- Smallest safe solution:
  - Replace the shared `PageHero` use only on this route with a dedicated Principles hero and code-native five-step flow.
  - Keep the five canonical principle records and shorten their fields.
  - Add one route-local CSS Module and one focused server component.
- Potential long-term solution:
  - If later research justifies interaction, the active flow stage could become scroll-linked, but this is intentionally excluded now to avoid client state and persistent motion.
- Regression risks:
  - Dirty `content/site.ts` and test files require surgical hunks.
  - Long copy at 200% zoom or mobile may collide with the journey rail.
  - Animation must not hide meaning before hydration or under reduced motion.
- Recommended direction:
  - “One calm blue signal”: `LEARN → CHOOSE → BUILD → PROVE → GROW`, with a subtle return path to communicate learning.

## Remaining Unknowns

- Unknown: None for the bounded implementation scope.
- How resolved: The user approved the UI and motion in the current Codex task and delegated the v2 copy refinement under an explicit natural, simple, short, and intelligent writing constraint.
