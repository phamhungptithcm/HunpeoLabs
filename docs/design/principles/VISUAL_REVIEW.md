# Principles visual review

## Evidence

- Browser: Codex in-app browser against `http://localhost:3000/company/principles`.
- Desktop viewport: 1536 × 1024.
- Mobile viewport: 390 × 844.
- State: settled after the one-time entry sequence.
- Console: no warning or error entries observed.
- Horizontal overflow: none at either viewport.
- Automated variants: desktop, mobile, reduced motion, route re-entry, and 200% text scaling.

## Motion v4 review

- Normal-speed desktop review at 1536 × 1024 confirmed one ordered signal rather than simultaneous stage motion.
- A frame near 520ms showed See resolved with the first connector and blue signal in progress.
- A frame near 980ms showed the sequence resolved through Build with the signal moving toward Prove.
- A frame near 1540ms showed all five stages resolved while the dashed return path was still drawing from Scale.
- The final frame restored the approved static composition exactly.
- Mobile review at 390 × 844 showed the same order on the vertical track with no horizontal overflow.
- Before the journey entered, all five rows remained in their static-first pending state. Rows became visible only when they reached the viewport.
- A sampled journey frame showed the number, title, node, and details resolving with a soft opacity and 8px settle.
- Browser logs contained development information only, with no warning or error.
- Reduced motion, route re-entry, and single-iteration behavior were verified by focused Playwright coverage.

## Concept fidelity

1. Desktop uses five large square stages with `SEE / MAP / BUILD / PROVE / SCALE`.
2. Each stage connection uses a straight line and open arrowhead. The return path is square-cornered and dashed.
3. The first stage is filled blue with a small ring; the other desktop stages are white with blue outlines.
4. The journey rail matches the supplied left-right alternation, filled desktop nodes, large blue numbers, blue detail rules, and vertical `DO / AVOID` divider.
5. Mobile uses the supplied vertical flow anatomy: filled first square, dark outlined later squares, solid center line, and left dashed return path.
6. Mobile journey uses a filled first node, outlined following nodes, stacked copy, and separated `DO / AVOID` blocks.
7. The shared sticky header and footer are preserved exactly; route styling remains local.
8. Motion stays bounded to one ordered signal, return-path draw, per-row reveal, ring resolve, and a complete reduced-motion state.

## Above-the-fold copy diff

The hero keeps `Five simple principles help us make better decisions.` The final flow restores the exact reference labels `SEE / MAP / BUILD / PROVE / SCALE`.

All five principles use short sentences with plain punctuation. Visible Principles copy contains no em dash or double hyphen.

## Intentional differences

- The supplied flow and journey images are focused crops. The live screenshots include the real site header, gutters, and viewport framing.
- Copy removes the em dash shown in the mobile reference because the user explicitly rejected that punctuation.

No material mismatch remains in stage geometry, arrow style, return paths, rail position, node treatment, row alternation, detail dividers, mobile transformation, palette, or visible Principles copy.
