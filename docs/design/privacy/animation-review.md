# Animation Review

## Scope And Environment

- Mode: Implementation review against the approved Privacy motion contract.
- Surface, route, component, or diff: `/privacy`, `PrivacySignal`, scoped `.privacy-*` motion, and the existing shared `MotionOrchestrator`.
- Motion direction: One calm, short signal journey with visible blocked branches and no persistent movement.
- Browsers, devices, inputs, and reduced-motion configuration: Chromium desktop and iPhone 13 Playwright projects; normal and `prefers-reduced-motion: reduce`.
- Load, throttling, and lifecycle conditions: Local production build, initial route entry, scroll reveal, navigation away and back. CPU throttling and physical-device traces were not used.

## Evidence

| Evidence | Class | Source, trace, device, viewport, state, or command | Limitation |
| --- | --- | --- | --- |
| Timing and frequency | source-verified | Scoped keyframes in `styles/globals.css` | No slow-motion trace |
| Reduced-motion final state | browser-observed | Privacy Playwright spec on desktop and mobile | Chromium projects only |
| Repeated route entry | browser-observed | Privacy Playwright navigation lifecycle test | Does not simulate background-tab suspension |
| Final visual state | browser-observed | Production desktop/mobile screenshots | Captured with reduced motion for deterministic full-page evidence |
| Runtime ownership | source-verified | Existing `MotionOrchestrator` | Shared observer was not changed |

## Findings

| Severity | Location | Current behavior | Recommended behavior | Why | Evidence | Verification |
| --- | --- | --- | --- | --- | --- | --- |
| None | Hero copy and diagram | Reveals once and settles | Keep | Establishes hierarchy without delaying reading | Source and browser test | Iteration count is `1` |
| None | Main information path | Draws once; one traveler crosses and disappears | Keep | Explains one short, intentional path | Source and final-state assertion | Desktop/mobile lifecycle test passed |
| None | Sell and Ads branches | A runner approaches each gate and retracts once; the static blocked branch remains | Keep | Makes the privacy boundary clear without a loop | Source review | Reduced-motion final state preserves meaning |
| None | Statements | Existing observer reveals the rail and three statements once | Keep | Supports scanning as the user reaches the section | Browser observation | Repeated navigation passed |

## Decision And Timing

- Purpose and frequency: Explain the allowed path and blocked uses once per route entry.
- Duration, delay, easing or spring: Copy 520ms, path 760ms, traveler 860ms, branches 480ms, nodes/core 360ms, and statements 520ms with short stagger.
- Enter, exit, origin, stagger, and spatial continuity: Copy enters upward by 14px; the signal moves from share to reply; branches terminate at their visible gates.
- No-animation opportunities: The complete static composition is the default server-rendered state and the reduced-motion result.

## Interruptibility, Gesture, And Lifecycle

- Repeat, reverse, cancel, route change, background, and unmount: Entrance sequences have one iteration and no callback. Route unmount discards CSS animation state; repeated navigation creates a fresh route entry.
- Pointer capture, touch, multi-touch, bounds, velocity, and damping: Not applicable; there is no gesture animation.
- Stale completion and duplicate-effect risk: No component state or completion callback exists.
- rAF, timers, handles, observers, listeners, subscriptions, and cleanup: The Privacy component owns none. The existing shared orchestrator owns and disconnects its observer.

## Accessibility

- Static and reduced-motion behavior: All copy, paths, nodes, gates, and labels render immediately; travelers and branch runners stay hidden.
- Keyboard, focus, announcements, and input parity: Motion does not move focus or announce state. The email action works independently.
- Persistent motion, flashing, vestibular, pause, or stop risks: No loop, parallax, large zoom, flashing, or persistent animation; pause controls are unnecessary.

## Performance And Compatibility

- Layout, paint, composite, main-thread, input, memory, layer, and battery cost: Bounded CSS opacity/transform/stroke animations on one SVG; no permanent `will-change`, JS loop, or client-owned timer.
- Behavior under representative load: Production build and normal desktop/mobile browser runs completed without console errors. No performance trace or throttled physical-device test was captured.
- Browser/API support and fallback: Static-first SVG/CSS remains readable when animation is unsupported.
- Dependency impact: None.

## Prioritized Action Plan

1. No implementation action is required for the approved scope.
2. If motion changes materially later, repeat reduced-motion, route lifecycle, and cross-browser verification.
