# Repository Intelligence Brief

## Gate Status

- CodeGraph: Installed, configured, current, health check passed.
- CocoIndex: Installed, configured, current, health check passed.
- Repository commit: `3d53e1b8201251cb28e02dbd2052ad36b1d67fec`
- Indexed commit: `3d53e1b8201251cb28e02dbd2052ad36b1d67fec`
- Gate result: `READY`

## Task Context

- Business outcome: Make the approved Principles page feel more refined, memorable, and pleasant through purposeful motion without changing its layout or copy.
- Request or work item: Current Codex task request for animation that feels more aesthetic, calm, and visually impressive.
- Scope: Route-local flow choreography, journey reveal behavior, focused motion tests, and Principles motion documentation.
- Constraints: Preserve the approved mockup fidelity, wording, sticky header, footer, shared layout, and static semantic content. No new dependency, global animation change, infinite loop, deployment, commit, or release.

## Indexed Facts

- CodeGraph structural facts:
  - `PrinciplesFlow` has one caller, `PrinciplesPage`.
  - `PrinciplesPage` is the only route composing this flow.
  - The shared `MotionOrchestrator` is rendered by `app/layout.tsx`, observes direct `main > section` elements, and is intentionally outside the proposed edit scope.
  - The route-local motion can be isolated without changing shared components or unrelated routes.
- CocoIndex semantic/documentation facts:
  - The current flow paths draw once, but all connector segments use the same delay.
  - The return path fades instead of visibly completing the loop.
  - The current traveler scales at the See node rather than moving through the stages.
  - All five journey rows animate within 280ms of the journey section becoming visible, so lower rows can finish before the user reaches them.
  - Existing documentation requires one-time motion, deterministic route re-entry, immediate reduced-motion output, and no persistent ambient effect.

## Source-Code Verified Facts

- Exact paths/sections opened:
  - `components/principles-flow.tsx`
  - `components/motion-orchestrator.tsx`
  - `app/company/principles/page.tsx`
  - motion rules and keyframes in `app/company/principles/principles.module.css`
  - `tests/e2e/principles.spec.ts`
  - `docs/design/principles/MOTION.md`
  - `docs/design/principles/VISUAL_REVIEW.md`
  - `package.json`
  - `.ai/quality-profiles/animation-motion.yaml`
  - `.ai/quality-profiles/visual-design.yaml`
  - `.ai/quality-profiles/frontend-html-css.yaml`
  - `.ai/rules/animation-integrity.md`
- Verified behavior:
  - Hero copy settles upward by 12px.
  - Flow paths draw once for 700ms after a shared 180ms delay.
  - Flow stages enter with a short vertical movement and stagger.
  - The return path and arrow use opacity only.
  - The rail draws once and all journey rows enter as one section-level sequence.
  - Reduced motion removes animations and hides the decorative traveler.
  - The page adds no route-local client behavior today.

## Relevant Modules

- `app/company/principles/principles.module.css`: Current route-local timing, easing, keyframes, and reduced-motion state.
- `components/principles-flow.tsx`: SVG geometry and the data hooks needed for staged signal choreography.
- `app/company/principles/page.tsx`: Route boundary for a local journey observer.
- Proposed `app/company/principles/principles-motion.tsx`: Local lifecycle owner for per-row visibility only.
- `tests/e2e/principles.spec.ts`: Existing bounded-motion, reduced-motion, route re-entry, responsive, and overflow coverage.
- `docs/design/principles/MOTION.md`: Canonical route motion contract.

## Entry Points And Call Paths

- Entry point: `GET /company/principles` to `PrinciplesPage`.
- Main callers/callees: `PrinciplesPage` to `PrinciplesFlow`, canonical principle records, and the proposed local `PrinciplesMotion`.
- Downstream consumers: Visitors, assistive technology, Playwright checks, and search crawlers receiving unchanged semantic HTML.

## Data Stores And Contracts

- Tables, views, migrations, or datafixes: None.
- APIs, events, schemas, or external contracts: None.
- Public contract: The route, semantic HTML, wording, metadata, layout geometry, and reduced-motion readability remain unchanged.

## Related Specifications And ADRs

- `docs/design/principles/MOTION.md`: Current one-time route motion contract.
- `docs/design/principles/VISUAL_REVIEW.md`: Approved desktop and mobile visual fidelity.
- Inspiration layer: Framer reference for precise sequential motion and restrained single-accent focus only. Its dark theme, typography, components, and brand-specific motion are not copied.

## Related Tests

- Existing tests:
  - Normal motion is bounded to one iteration.
  - Route re-entry remains complete.
  - Reduced motion disables path animation and hides the traveler.
  - Desktop, mobile, 200% text scaling, overflow, and visible copy are covered.
- Missing regression tests:
  - No test proves connectors and stages run as one ordered signal.
  - No test proves the return path is drawn after Scale.
  - No test proves each journey row enters when that row reaches the viewport.
  - No test covers observer cleanup or a reduced-motion preference change while the route is mounted.

## Potential Impact Areas

- Direct: Route-local CSS animation, SVG presentation markup, one local client-side visibility observer, focused E2E assertions, and motion documentation.
- Indirect: A small client bundle and one `IntersectionObserver` only while the Principles route is mounted.
- Operational: No API, storage, analytics, infrastructure, or deployment impact.
- Security/data: No user data, input, authentication, authorization, network request, or secret impact.

## Brainstorming Record

- Assumptions:
  - “Wow” means a clear, art-directed sequence rather than more effects or constant movement.
  - The approved composition and wording must remain unchanged.
- Unknowns:
  - No user study establishes a preferred motion intensity.
  - Real low-end mobile frame behavior must be verified after implementation.
- Alternative solutions:
  - CSS timing changes only: lowest risk, but lower journey rows still animate before they are seen.
  - Scroll-linked CSS timelines: expressive, but support and fallback behavior add compatibility risk.
  - Global `MotionOrchestrator` expansion: reusable, but broadens impact to unrelated routes.
  - Recommended route-local observer: small, reversible, and limited to five static rows.
- Smallest safe solution:
  - Keep the current layout and shared orchestrator.
  - Turn the flow into one ordered, one-time signal using route-local CSS and SVG data hooks.
  - Add one route-local observer so each principle wakes only when it reaches the reader.
- Potential long-term solution:
  - Extract a shared declarative reveal utility only if multiple approved routes later need the same behavior.
- Regression risks:
  - Incorrect SVG transform origins can move boxes or arrowheads.
  - A client enhancement can flash or leave content hidden if the initial state is not static-first.
  - Long staggers can make the page feel slow.
  - Observer cleanup and reduced-motion preference changes must not leave stale hidden rows.
- Recommended direction:
  - One calm blue signal completes `SEE / MAP / BUILD / PROVE / SCALE`, draws the return path, resolves at See, then each detailed principle appears when the reader reaches it.

## Remaining Unknowns

- Unknown: Approval for the v4 motion delta.
- How to resolve: User explicitly approves `HUNPEOLABS-PRINCIPLES-001-v4`.
