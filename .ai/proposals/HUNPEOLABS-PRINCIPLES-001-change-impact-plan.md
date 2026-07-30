# Change Impact Plan

Plan ID/version: HUNPEOLABS-PRINCIPLES-001-v2

## Repository Intelligence Gate

- CodeGraph status: Installed, configured, current, health check passed.
- CocoIndex status: Installed, configured, current, health check passed.
- Repository commit: `3d53e1b8201251cb28e02dbd2052ad36b1d67fec`
- Indexed commit: `3d53e1b8201251cb28e02dbd2052ad36b1d67fec`
- Brief path: `.ai/proposals/HUNPEOLABS-PRINCIPLES-001-repository-intelligence-brief.md`

## Problem Statement And Business Outcome

The current page is accurate but reads as a long text index: five principles, each with three paragraphs and no page-specific visual story. The redesign should help a visitor understand the method in seconds, remember its sequence, and enjoy the page without adding marketing claims or distracting motion.

## Current Behavior And Verified Execution Flow

`GET /company/principles` renders a shared `PageHero`, then maps five canonical records from `content/site.ts` into one `.principles-index` section. The global `MotionOrchestrator` reveals only the hero and the complete list section. The current page has no dedicated diagram, active-state model, or Principles-specific motion.

## Root Cause Or Capability Gap

- The hero message is abstract and longer than necessary.
- The five principles are not presented as one connected process.
- Repeating `body`, `In practice`, and `We avoid` creates visual and reading density.
- Section-level reveal alone does not explain sequence or learning.

## Proposed Direction

Design read: `One calm blue signal turns five principles into one repeatable journey.`

### Exact hero copy

- Index: `05.1 / Principles`
- Title: `How we work.`
- Description: `Five simple principles help us make better decisions.`

### Exact journey

1. `Learn the real system`
   - Summary: `Understand how things work before trying to change them.`
   - Do: `Talk to people. Read the code. See the limits.`
   - Avoid: `Solving the problem we imagined.`
2. `Make the risk clear`
   - Summary: `Know what could go wrong, who decides, and what matters most.`
   - Do: `Name the risks, trade-offs, and owner.`
   - Avoid: `Hiding uncertainty.`
3. `Start small`
   - Summary: `Build the smallest change that can teach us something.`
   - Do: `Focus on one useful outcome.`
   - Avoid: `Calling a demo the solution.`
4. `Prove it`
   - Summary: `Test the result and keep the evidence.`
   - Do: `Show what worked — and what didn’t.`
   - Avoid: `Letting confidence replace proof.`
5. `Grow with care`
   - Summary: `Scale when the value is real and the risks are understood.`
   - Do: `Add guardrails, ownership, and a way back.`
   - Avoid: `Growing before we’re ready.`

### Visual composition

- Desktop hero: concise copy left; horizontal `LEARN → CHOOSE → BUILD → PROVE → GROW` diagram right; dashed return path from Grow to Learn.
- Desktop journey: one open vertical blue rail with square nodes and five asymmetric editorial rows; large blue numbers; no card grid.
- Mobile hero: single-column copy and vertical compact flow.
- Mobile journey: one left rail with stacked summary, `DO`, and `AVOID`; no horizontal overflow.
- Preserve true white, near-black, muted gray, Hunpeo blue `#173df5`, Arial/Helvetica display, mono technical labels, square geometry, and 1px engineering lines.
- Preserve the existing header and footer exactly.

### Concept evidence

- Desktop hero/flow concept:
  `/Users/hunpeo97/.codex/generated_images/019fb0c2-5f40-76e0-b244-aa39cafaa87e/call_rjtmJzNuaWccv9f7tFbxNvaL.png`
- Desktop journey concept:
  `/Users/hunpeo97/.codex/generated_images/019fb0c2-5f40-76e0-b244-aa39cafaa87e/call_zMVMTNnNMTrpoYjNASxySqSh.png`
- Mobile concept:
  `/Users/hunpeo97/.codex/generated_images/019fb0c2-5f40-76e0-b244-aa39cafaa87e/call_pcahVon6fWNPhLz67sA3Dr9m.png`
- These are review concepts, not production runtime assets. After approval they will be copied into `docs/design/principles/` as design evidence and the runtime UI will be recreated in HTML/CSS/SVG.

## Motion Direction

- Hero copy: opacity plus `translateY(12px)`, maximum 520ms with short stagger.
- Flow path: one-time stroke draw, maximum 900ms.
- Traveler: one small blue pulse moves across the main path once and disappears, maximum 1100ms.
- Nodes: square activation with a 60–80ms stagger; no scale beyond a subtle 1.03 maximum.
- Journey rail: one-time line draw when the section enters.
- Journey rows: opacity plus `translateY(12px)`, maximum 480ms with a bounded stagger.
- Reuse the existing `MotionOrchestrator`; add no observer, timer, rAF loop, or client component.
- No infinite animation, parallax, scroll hijacking, animated blur, large zoom, or persistent `will-change`.
- Reduced motion: all content and the complete final diagram render immediately; traveler is hidden.

## In Scope

- Shorten Principles metadata, hero, and five canonical content records.
- Replace the shared hero on this route with a dedicated semantic Principles composition.
- Add one server-rendered, code-native flow component.
- Add one route-local CSS Module for layout, responsive behavior, and motion.
- Add focused unit and E2E coverage.
- Preserve approved desktop/mobile concepts and design/motion notes as repository evidence.

## Out Of Scope

- Shared `PageHero`, header, footer, layout, or `MotionOrchestrator` changes.
- New navigation, CTA, claims, metrics, case studies, testimonials, or localization.
- Client-side scroll state, chart library, animation library, font, image, video, canvas, WebGL, analytics, or third-party script.
- API, database, authentication, privacy, contact, runtime configuration, infrastructure, release, or production deployment changes.

## Change Area Boundary

One public content route, one canonical content slice, one dedicated server component, one CSS Module, two focused test files, and Principles design evidence.

## Impact Boundary

- Direct: Principles copy, metadata, hierarchy, flow, responsive layout, and motion.
- Indirect: Search snippet and visitor understanding.
- No shared component API, data-processing, integration, runtime configuration, or deployment impact.

## Files Explicitly Requested For Approval

- `.ai/proposals/HUNPEOLABS-PRINCIPLES-001-*.md`
- `.ai/local/implementation-approval.md`
- `app/company/principles/page.tsx`
- `app/company/principles/principles.module.css`
- `components/principles-flow.tsx`
- `content/site.ts`
- `tests/unit/content.test.ts`
- `tests/e2e/principles.spec.ts`
- `docs/design/principles/**`

## Dirty-Worktree Boundary

- `content/site.ts` and `tests/unit/content.test.ts` already contain unrelated Gig changes. Implementation will patch only the existing Principles record/test block and preserve all other hunks.
- `tests/e2e/site.spec.ts` and `styles/globals.css` are already heavily modified by other approved work and will not be edited.
- The new CSS Module and focused E2E spec isolate this scope from the dirty shared files.
- `app/company/principles/page.tsx` is currently clean.

## Expected File/Module/Function Changes

- `app/company/principles/page.tsx`
  - Update metadata description.
  - Render the dedicated hero, flow, and journey sections.
  - Keep the route a server component.
- `components/principles-flow.tsx`
  - Render the five-stage semantic figure with desktop/mobile-compatible HTML/SVG primitives.
  - Keep text and flow meaning available without motion.
- `app/company/principles/principles.module.css`
  - Add route-scoped composition, rail, nodes, responsive rules, one-time keyframes, and reduced-motion final state.
  - Reuse existing tokens; no global selector changes.
- `content/site.ts`
  - Shorten only the five existing principle records while retaining the `title`, `body`, `practice`, and `avoid` shape.
- `tests/unit/content.test.ts`
  - Preserve existing registry coverage and assert the five compact principle titles/fields.
- `tests/e2e/principles.spec.ts`
  - Verify exact copy, flow order, semantic headings, desktop/mobile overflow, normal motion, reduced motion, and route re-entry.
- `docs/design/principles/**`
  - Store approved concepts, design direction, motion contract, and final visual review evidence.

## Callers, Consumers, Contracts, Data, And Integrations

Human visitors, crawlers, and existing content tests consume the page. The URL, metadata helper, content-record shape, server-rendering behavior, and route ownership remain stable. No persistence or external integration exists.

## Existing Behavior To Preserve

- Canonical `/company/principles` route and indexability.
- Server-rendered copy and semantic heading structure.
- Global sticky header, footer, focus behavior, and section observer.
- Exactly five principles.
- The Principles page remains the detailed operating-method source; `/work` does not duplicate it.
- All unrelated dirty-worktree changes.

## Security, Privacy, Transaction, Concurrency, And Data Integrity

- No input, auth, PII, data collection, storage, API, secret, transaction, or concurrency change.
- No new client lifecycle or asynchronous work.
- Public wording remains a statement of working method, not an unsupported outcome or customer claim.

## Performance And Capacity

- No dependency or network request.
- One small server-rendered flow and one route-local CSS file.
- Motion is bounded to opacity, transform, and stroke-dash properties and runs once.
- Static HTML remains readable if CSS or animation fails.

## Backward Compatibility

No route, exported principle shape, shared component API, data contract, or integration change.

## Failure, Retry, And Rollback

There is no new runtime failure, timeout, or retry path. Rollback is the bounded route/component/content/style/test patch. If motion is unsupported, the final static state remains visible.

## Test And Regression Strategy

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm exec playwright test tests/e2e/principles.spec.ts --project=chromium --project=mobile`
- `pnpm build`
- Browser verification at 1536 × 1024 and 390 × 844.
- Verify 200% zoom/text expansion, keyboard focus, reduced motion, route re-entry, no horizontal overflow, no console errors, and no layout shift caused by animation.
- Compare accepted concepts and final screenshots with `view_image`; record at least five fidelity checks and an above-the-fold copy diff.
- Re-run CodeGraph impact, refresh both indexes, and require the Repository Intelligence Gate to return `READY`.

## Detected Stack And Quality Profiles

- Languages: TypeScript 6.0.3, TSX, HTML, CSS Modules.
- Application/platform/domain: Public Hunpeo Labs marketing website and company-principles content.
- Framework/runtime: Next.js 16.2.12, React 19.2.8, Node.js 24+.
- Tooling: pnpm 11.9.0, ESLint 9, Vitest 4.1.10, Playwright 1.62.0.
- Selected quality profiles: `universal`, `typescript-javascript`, `frontend-html-css`, `web-app`, `seo-geo`, `visual-design`, `animation-motion`.

## Documentation, Specification, And Diagram Updates

Add Principles-specific design brief, direction, motion contract, approved concepts, and final visual review. No architecture, API, operational, or deployment documentation change is required.

## Deployment Or Migration Steps

None. Production deployment is explicitly excluded and requires separate approval.

## Assumptions, Unknowns, And Risks

- The public copy remains English.
- The generated concepts express the intended composition; exact production typography uses the existing repository fonts and tokens.
- Visual regression risk is medium because the layout and motion are new.
- Functional risk is low because the route remains static and no shared runtime behavior changes.
- The UI and motion are approved. The user explicitly delegated the v2 copy refinement under a natural, simple, short, and intelligent writing constraint.

## Approval Decision Requested

The user approved the complete UI and motion direction in the current Codex task and explicitly delegated a copy refinement with the constraint that the English feel human, natural, simple, short, and intelligent. Implement `HUNPEOLABS-PRINCIPLES-001-v2` with the exact refined copy above and the already approved desktop/mobile “one calm blue signal” composition. No dependency, shared shell change, API/data/configuration change, deployment, commit, or release is included.
