# Privacy Page Motion Contract

| Token or pattern | Purpose | Trigger and frequency | Duration | Easing | Enter/origin | Interrupt/cancel behavior | Reduced motion | Technique | Usage boundary |
| --- | --- | --- | ---: | --- | --- | --- | --- | --- | --- |
| `privacy-copy-in` | Establish headline hierarchy | First hero reveal, once per route entry | 520ms max | `cubic-bezier(.22,1,.36,1)` | opacity + `translateY(14px)` | Route change removes the section; no callback or retained state | Immediate final state | CSS keyframes | Hero copy only |
| `privacy-path-draw` | Explain the allowed information path | First diagram reveal, once | 760ms max | `cubic-bezier(.2,.7,.2,1)` | stroke dash from start to end | CSS animation ends naturally; route unmount discards it | Full path visible | CSS stroke dash | Main path |
| `privacy-signal-travel` | Create a human, memorable sense of one short journey | Once after the main path begins | 860ms max | `cubic-bezier(.4,0,.2,1)` | Small blue pulse with a short fading trail follows the main path | No callback; interruption leaves the static path understandable | Pulse omitted | CSS offset-path or SVG transform animation with static fallback | One pulse only |
| `privacy-branch-retract` | Show Sell and Ads as paths Hunpeo Labs does not take | Each branch once after the core activates | 480ms max | `cubic-bezier(.4,0,.2,1)` | Dashed branch reaches the gate, fades, and retracts toward the core | No retained state; final gate remains visible | Static blocked branch and gate | CSS stroke dash/opacity | Two blocked branches only |
| `privacy-node-in` | Connect path stages to labels | Once, after path begins | 360ms max, 80ms stagger | `cubic-bezier(.22,1,.36,1)` | opacity + scale `.96` | No callback; interruption leaves readable default geometry | Immediate final state | CSS keyframes | Diagram nodes only |
| `privacy-core-activate` | Emphasize the boundary decision | Once after main nodes | 360ms max | ease-out | opacity + scale `.98`; one restrained halo bloom | No infinite pulse | Static core and halo | CSS keyframes | Protected core only |
| `privacy-statement-in` | Support scanning down the page | Existing section reveal, once per statement group | 520ms max, 70ms stagger | `cubic-bezier(.22,1,.36,1)` | opacity + `translateY(12px)` | Route unmount; no timers | Immediate final state | CSS keyframes | Three statements only |
| `privacy-link-shift` | Confirm email interactivity | Hover/focus, repeatable | 160ms | existing fast transition | underline/arrow translate up to 4px | Reverses immediately on pointer/focus exit | Color/underline state remains | CSS transition | Email link only |

## Global Principles

- Motion personality: natural, precise, quietly playful.
- Responsiveness expectation: Content and links are interactive immediately; animation never gates reading or navigation.
- Spatial continuity: The blue path establishes You Share → We Understand → We Reply; rejected branches stop at visible gates.
- Stagger and sequence limit: Maximum total hero sequence approximately 1.2 seconds; no interaction waits for it.
- Persistent motion policy: None; the traveling pulse and branch retraction each run once.

## Runtime Contract

- Initial and hydration state: Server-rendered content and SVG are visible by default. Motion begins only after the existing orchestrator applies reveal classes.
- Repeated interaction: Only the email micro-interaction repeats.
- Reversal: Hover/focus transition reverses; entrance sequences do not reverse.
- Route change and unmount: No component-owned listener, timer, observer, rAF, or animation handle.
- Background and visibility: No persistent work remains after the one-time sequence.
- Cleanup ownership: Existing `MotionOrchestrator` owns the shared IntersectionObserver lifecycle.

## Accessibility And Static Equivalence

- Reduced-motion substitutions: Remove non-essential transform, stroke travel, scale, and stagger; show the final diagram and content immediately.
- Keyboard and gesture parity: Email focus matches hover visibility; no gesture interaction.
- Focus and announcements: No focus movement or live-region announcement.
- Pause or stop controls: Not required because there is no persistent or long-running motion.

## Performance And Compatibility Budget

- Allowed techniques and dependencies: Existing CSS keyframes/transitions and IntersectionObserver only; no new dependency.
- Expensive-property exceptions: Static low-opacity core halo only; no animated blur/filter/box-shadow.
- Layer and `will-change` policy: No permanent `will-change`.
- Browser support and fallbacks: Static SVG/HTML is the fallback in all supported browsers.
- Trace and device evidence required: Desktop/mobile browser capture, reduced-motion emulation, repeated route navigation, console, layout-shift/overflow inspection, and representative CPU-throttled animation review.
