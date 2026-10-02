# Principles Motion Delta Plan

Plan ID/version: `HUNPEOLABS-PRINCIPLES-001-v4`

Status: Proposed, approval pending

## Design Direction

One calm blue signal teaches the loop in a single pass, then each principle wakes as the reader reaches it.

- Primary inspiration: Framer's precise sequential reveal and single-accent focus, adapted to the existing light editorial system.
- Layout variance: 1/10. The approved composition and geometry stay unchanged.
- Motion intensity: 6/10. Clearly art-directed, still calm and brief.
- Information density: 4/10. No content or hierarchy change.
- Anti-goals: no bouncing, elastic spring, parallax, looping glow, scroll hijack, large zoom, blur animation, or decorative hover that implies clickability.

## Requirement Gap

The current animation is technically correct but visually flat:

1. Connector lines start together instead of carrying one signal through five stages.
2. The blue traveler does not travel.
3. The return path fades instead of visibly closing the loop.
4. Journey rows animate as one batch, so several complete before the reader sees them.

## Approved UI To Preserve

- Exact desktop and mobile layouts.
- Five stage boxes, open arrows, rectangular dashed return path, and journey rail geometry.
- All visible copy and punctuation.
- Sticky header, footer, global tokens, and shared `MotionOrchestrator`.
- Semantic server-rendered content and immediate usability.

## Proposed Motion

### Hero

- Eyebrow, title, and intro settle in with 8px maximum travel.
- Duration stays below 620ms per element.
- The sequence begins immediately and never blocks navigation or input.

### Five-stage flow

- See resolves first.
- Each connector draws, a small blue signal crosses it, and the next stage resolves.
- Arrowheads arrive with their connector instead of fading separately.
- After Scale resolves, the dashed return path draws around the rectangle.
- The final open arrow appears and the See ring resolves once.
- Total sequence target: 1.6 to 1.9 seconds.
- All effects run once with no persistent movement.

### Detailed journey

- The rail draws once when the journey enters.
- Each principle row receives its own viewport trigger.
- Within a row, the node, number/title, and Do/Avoid rules resolve in a short 80ms rhythm.
- Maximum per-row sequence target: 520ms.
- Fast scrolling reveals content immediately enough that reading is never delayed.

### Reduced motion

- No translation, scaling, path drawing, stagger, or moving signal.
- All text, boxes, arrows, rail, and rows render in their final state immediately.
- Decorative travelers and origin ring animation are removed.

## Technical Approach

- Continue using CSS transforms, opacity, and small SVG stroke-dashoffset animations.
- Add no animation library or dependency.
- Add route-local SVG data hooks and ordered CSS custom properties.
- Add one route-local client component using `IntersectionObserver` for five journey rows.
- Use a static-first fallback. JavaScript failure, cancellation, or unsupported animation leaves all content readable.
- Disconnect the observer and media listener on route change or unmount.
- Do not modify the shared `MotionOrchestrator`.

## File-by-file Plan

1. `components/principles-flow.tsx`
   - Group each connector, arrowhead, signal, and destination stage by sequence step.
   - Add `pathLength` and route-local data hooks needed for ordered drawing.
   - Preserve all approved SVG coordinates and accessible caption.
2. `app/company/principles/page.tsx`
   - Mount the route-local motion lifecycle component.
   - Add one scoped page hook without changing content structure.
3. `app/company/principles/principles-motion.tsx`
   - Observe the five principle rows.
   - Mark rows visible once, handle reduced motion, and clean up all observers/listeners.
4. `app/company/principles/principles.module.css`
   - Replace simultaneous timing with the ordered signal choreography.
   - Draw the return path instead of fading it.
   - Add per-row entry states and final-state fallbacks.
   - Keep animation properties explicit and reduced-motion complete.
5. `tests/e2e/principles.spec.ts`
   - Verify ordered one-time animation, per-row entry, route re-entry, interrupted navigation, and reduced motion.
   - Preserve responsive, text scaling, overflow, and punctuation coverage.
6. `docs/design/principles/MOTION.md`
   - Record purpose, timings, lifecycle, interruption behavior, and accessibility state.
7. `docs/design/principles/VISUAL_REVIEW.md`
   - Add browser evidence from normal speed, sampled animation frames, desktop, mobile, and reduced motion.

## Impact

- Callers and consumers: Only `/company/principles`.
- Data and public contracts: No change.
- Security and privacy: No change.
- Accessibility: Reduced-motion behavior becomes stricter; semantic meaning stays independent of motion.
- Performance: One small route-local client component, one observer for five rows, no continuous loop, no external asset, and no dependency.
- Compatibility: Existing CSS and `IntersectionObserver`; no emerging scroll-timeline dependency.
- Deployment and rollback: Standard static application build. Rollback is limited to the seven files above.

## Validation

- `pnpm check`
- focused Chromium and mobile Principles E2E
- desktop 1536 x 1024 and mobile 390 x 844
- normal-speed browser review
- start, middle, and end frame sampling through the Web Animations API
- reduced-motion emulation
- fast scroll, route interruption, route re-entry, and background/foreground review
- 200% text scaling and horizontal overflow check
- browser console and layout-shift review
- `git diff --check`
- refreshed CodeGraph and CocoIndex with final Repository Intelligence Gate `READY`

## Approval Request

Approve plan `HUNPEOLABS-PRINCIPLES-001-v4` to implement this bounded motion delta.
