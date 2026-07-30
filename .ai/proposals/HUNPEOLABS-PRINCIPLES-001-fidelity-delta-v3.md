# Principles Fidelity Delta Plan

Plan ID/version: HUNPEOLABS-PRINCIPLES-001-v3

## Repository Intelligence Gate

- Status: READY on 2026-07-29.
- CodeGraph: current and healthy.
- CocoIndex: current and healthy.

## User Feedback

The implementation does not yet match the accepted mockup closely enough. The flow arrows, stage boxes, return path, journey rail, and alternating row composition must follow the supplied screenshots. Public copy must not use em dashes or double-hyphen punctuation that reads as machine-written.

## Exact Fidelity Corrections

- Desktop flow:
  - five large square stages;
  - `SEE / MAP / BUILD / PROVE / SCALE`;
  - first stage filled Hunpeo blue, remaining stages white with blue outlines;
  - open-line arrows between every stage;
  - square-corner dashed return path from Scale to See;
  - one small ring above the first stage.
- Mobile flow:
  - vertical stage stack;
  - first square filled blue, remaining squares white with dark outlines;
  - solid center line;
  - dashed rectangular return path on the left with an open arrow into See.
- Desktop journey:
  - one central blue rail with filled square nodes;
  - odd principles place number, title, and summary left of the rail;
  - even principles begin to the right of the rail;
  - `DO / AVOID` blocks use blue top rules and a vertical divider;
  - dashed bottom return loop with an upward open arrow.
- Mobile journey:
  - one left rail;
  - first node filled blue and following nodes outlined;
  - number, title, summary, Do, and Avoid stack exactly in the reference rhythm.

## Exact Copy

1. `See the real system`
   - Summary: `Start with what exists, not assumptions.`
   - Do: `Read the code, workflow, users, and constraints.`
   - Avoid: `Designing for an imagined system.`
2. `Make risk visible`
   - Summary: `Show what changes, who owns it, and what can go wrong.`
   - Do: `Map decisions, dependencies, and evidence.`
   - Avoid: `Hiding uncertainty.`
3. `Start small`
   - Summary: `Build the smallest useful, testable change.`
   - Do: `Choose one real outcome.`
   - Avoid: `Calling a demo done.`
4. `Prove it works`
   - Summary: `Test, observe, and keep the evidence.`
   - Do: `Connect behavior to proof.`
   - Avoid: `Replacing proof with confidence.`
5. `Scale with care`
   - Summary: `Expand only when value and failure modes are clear.`
   - Do: `Add guardrails, an owner, and a rollback path.`
   - Avoid: `Scaling too early.`

No em dash or double hyphen is allowed in visible Principles copy.

## Scope And Impact

Direct changes remain limited to the Principles route, route-local CSS, flow component, canonical Principles records, focused tests, and Principles design evidence. Shared header, footer, layout, MotionOrchestrator, global styles, APIs, data flows, dependencies, deployment, commit, and release remain unchanged.

## Validation

- `pnpm check`
- focused desktop and mobile Principles E2E tests
- Browser/IAB at 1536 x 1024 and 390 x 844
- reduced motion, route re-entry, text scaling, overflow, and console checks
- `view_image` comparison against all three supplied reference screenshots
- refreshed repository indexes and final `READY` gate
