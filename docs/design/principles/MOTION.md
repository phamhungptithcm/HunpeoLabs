# Principles motion contract

Motion turns the static loop into one calm signal, then helps the reader enter each principle at the right moment.

## Choreography

| Element | Purpose | Behavior |
| --- | --- | --- |
| Hero copy | Establish reading order | Opacity and an 8px upward settle, up to 540ms |
| See stage | Establish the origin | One restrained scale resolve |
| Connectors | Explain sequence | Draw one after another from See to Scale |
| Signal | Carry attention | One small blue dot crosses each connector once |
| Stages | Confirm arrival | The next square resolves as the signal reaches it |
| Return path | Close the loop | The dashed route draws only after Scale |
| See ring | Confirm learning | One short resolve after the loop closes |
| Journey rail | Connect the details | Draws once when the section enters |
| Journey rows | Meet the reader | Each row resolves once when it reaches the viewport |

The hero sequence finishes in about two seconds. Each journey row finishes in no more than 520ms.

## Lifecycle

- The shared route-aware section orchestrator continues to own section entry.
- A route-local `IntersectionObserver` watches only the five principle rows.
- Each row is unobserved after its first reveal.
- Route changes disconnect the observer and remove the media-query listener.
- A live switch to reduced motion disconnects the observer and reveals every row.
- Fast scrolling, canceled animation, unsupported animation, or JavaScript failure never removes semantic content.
- Route re-entry starts from a deterministic server-rendered layout.

## Reduced motion

With `prefers-reduced-motion: reduce`, all content and paths render in their final state immediately. Translation, scaling, path drawing, stagger, the moving signal, and the decorative See ring are removed.

## Performance

- No animation dependency, timer, animation frame, scroll listener, filter, blur, or persistent compositor hint.
- Motion uses opacity, small transforms, and bounded SVG stroke drawing.
- One observer exists only while the Principles route is mounted.
- No infinite loop, parallax, scroll hijacking, large zoom, or layout-changing animation.
