# Principles page design

## Direction

One calm blue signal turns five working principles into one repeatable loop.

- Surface: true white, near-black type, muted gray support text, Hunpeo blue signal.
- Shape: square nodes, thin engineering lines, open editorial spacing.
- Structure: concise hero and flow first, then one continuous five-step rail.
- Restraint: no cards, gradients, shadows, decorative imagery, or invented proof.
- Responsive behavior: horizontal flow on desktop; vertical flow and journey rail on mobile.

## Copy rule

The page should sound like a person explaining how the team works:

- one idea per sentence;
- plain words before technical language;
- short without becoming vague;
- practical rather than promotional;
- intelligent through specificity, not complexity.

## Approved concepts

- `approved-desktop-hero.png` — 1536 × 1024 hero and horizontal loop.
- `approved-desktop-journey.png` — 1024 × 1536 editorial journey rail.
- `approved-mobile.png` — 853 × 1844 mobile composition.
- `reference-v3-desktop-flow.png` — user-supplied square-stage and arrow reference.
- `reference-v3-desktop-journey.png` — user-supplied alternating rail reference.
- `reference-v3-mobile.png` — user-supplied mobile flow and rail reference.

The concepts are design evidence only. Production uses semantic HTML, CSS, and SVG.

## Implemented evidence

- `implemented-desktop-hero.png` — 1536 × 1024 settled hero.
- `implemented-desktop-journey.png` — 1536 × 1024 journey rail.
- `implemented-mobile.png` — 390 × 844 settled mobile hero.
- `implemented-mobile-journey.png` — 390 × 844 mobile journey rail.
- `VISUAL_REVIEW.md` — concept-to-browser fidelity review.
- `MOTION.md` — ordered signal, per-row reveal, lifecycle, and reduced-motion contract.

## Implementation boundary

The shared header, footer, page layout, focus behavior, and global section orchestrator remain unchanged. Content stays server rendered. One small route-local client observer reveals the five journey rows and adds no dependency, request, analytics, or runtime bitmap asset.
