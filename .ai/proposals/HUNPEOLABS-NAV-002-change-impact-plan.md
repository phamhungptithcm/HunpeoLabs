# HUNPEOLABS-NAV-002 v1 — Scroll-driven compact navbar

Status: PENDING human approval. No application edits made.

## Intelligence brief and verified evidence

HEAD: 3d53e1b8201251cb28e02dbd2052ad36b1d67fec; extensive unrelated WIP must be preserved.
Initial repository intelligence gate: DEGRADED; CodeGraph and CocoIndex stale,
health checks passed. One bounded incremental refresh completed successfully.
This plan uses targeted source evidence, not index-derived impact claims.

- `app/layout.tsx`: renders shared SiteHeader through BlogChrome.
- `components/site-header.tsx`: passive scroll listener; boolean scrolled state
  changes after 20px; shared desktop/mobile navigation and menu state.
- `styles/tokens.css`: default header height 5.5rem (88px at default root size).
- `styles/globals.css`: sticky shared header, surface transitions, mobile menu
  positioned using header height; mobile base height 4.5rem (72px).
  Privacy mobile override is 3.375rem (54px). Global reduced-motion rules exist.
- `tests/e2e/site.spec.ts`: sticky-header and mobile-menu attachment checks exist.
- Stack: Next.js 16.3.8, React 19.2.8, TypeScript 6, pnpm, Playwright.

## Proposed behavior and smallest safe implementation

Assumption: request concerns shared SiteHeader. Bespoke page chrome is outside
scope. At the top retain current size. Between scrollY 20px and 140px progressively
compact the desktop header from 88px to 64px, mobile from 72px to 60px; never enlarge
the already compact 54px privacy header. Return smoothly as scrolling approaches
the top. Keep the navbar visible, shrink branding and CTA modestly, preserve
readability and usable controls. Freeze compact progress while mobile menu is
open to prevent moving navigation targets. Honor prefers-reduced-motion with a
stable compact state and no interpolated decorative motion.

1. `components/site-header.tsx`, SiteHeader: track clamped scroll progress via one
   requestAnimationFrame per scroll frame; expose a CSS variable on the header;
   preserve data-scrolled and menu behavior, cancel pending work on cleanup.
2. `styles/globals.css`: derive header height and restrained branding/CTA sizing
   from progress; position mobile navigation at 100% of the actual header height;
   account for privacy override and reduced motion. Keep typography readable.
3. `tests/e2e/site.spec.ts`: extend current coverage for initial/intermediate/final
   size, reverse scrolling, sticky positioning, mobile menu attachment, reduced
   motion, and compact privacy layout.

Before implementation read relevant bundled Next.js docs and frontend/TypeScript
quality profiles. No dependencies, routes, authentication, storage, APIs, schema,
infrastructure or publication changes.

## Impact, risks and alternatives

Low-risk presentation change across pages using SiteHeader. Risks: sticky-height
scroll feedback, menu gaps, small controls, privacy override conflicts, anchor
occlusion, unnecessary rerenders. Check short scroll movement and both directions,
retain conservative existing anchor offsets, clamp progress and avoid redundant
updates. Threshold-only CSS transition is simpler but does not track scroll
progress as closely. No animation library is needed. Rollback only this task's
changes, preserving unrelated WIP.

## Validation and completion

Run focused lint, typecheck and Playwright header/menu tests on desktop/mobile;
visually inspect intermediate scrolling, top restoration and privacy override.
Run mandatory final-implementation-review and record current evidence, findings,
limitations and completion report before successful handoff.

## Approval requested

Approve HUNPEOLABS-NAV-002 v1 for the three application/test paths listed above
and related task evidence documents. No production deployment.
