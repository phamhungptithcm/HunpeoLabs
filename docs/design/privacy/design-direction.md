# Privacy Page Design Direction

## Design Read

Reading this as: privacy without the maze — one human conversation expressed as a calm engineering signal.

## Direction Controls

| Control | Value 1-10 | Rationale |
| --- | ---: | --- |
| Layout variance | 7 | A bespoke asymmetric hero and responsive diagram make the page memorable without changing the global shell. |
| Motion intensity | 6 | A one-time traveling signal, softly retracting blocked branches, and rail draw create delight without persistent movement. |
| Information density | 3 | Four visible sentences and one diagram keep the page appropriate for a marketing site. |

## Principles And Anti-Goals

- Principles: natural language, minimal copy, one clear path, strong scale contrast, code-native drawing, precise blue signal, generous whitespace, static-first meaning.
- Anti-goals: legal-template column, generic cards, stock locks/shields, gradients, glassmorphism, decorative infinite motion, technical privacy exposition, extra claims.

## Inspiration Boundary

- Primary inspiration: Framer — precision, motion-first staging, one-accent discipline.
- Secondary influence: Mastercard — orbital paths, trajectory, editorial breathing room.
- Adapted qualities: compressed headline energy, connected-node storytelling, asymmetric composition.
- Protected or project-inappropriate elements excluded: proprietary typefaces, brand colors/assets, signature navigation, logos, product screenshots, circular portrait cards.

## Design System

- Existing system and ownership: Repository-owned Hunpeo Labs tokens and global shell remain authoritative.
- Tokens to use or add: Reuse `--color-bg`, `--color-text`, `--color-muted`, `--color-line`, `--color-accent`, spacing, gutter, max-width, and motion easings. Add only scoped custom properties if SVG timing needs them.
- Component strategy: Dedicated server-rendered `PrivacySignal`; no change to shared `PageHero`.
- Dependency impact: None.

## Visual Language

- Typography: Existing sans display with tight tracking; mono labels for index, flow title, node labels, and statement eyebrows.
- Color: White canvas, near-black content, muted gray body, Hunpeo blue only for lines, numbers, labels, and active core.
- Spacing and layout: Desktop 40/60 asymmetric hero; mobile single-column with vertical signal; wide statement rail below.
- Shape, border, and elevation: Square nodes, 1px borders, no card shadows; only a subtle static blue core halo.
- Imagery and icons: Code-native SVG lines, nodes, pulse marks, gates, and reply glyph; mockup PNGs are review evidence only.
- Motion: One-time draw/travel/retract/bloom/reveal sequence using CSS and the existing section observer.

## Responsive Composition

- Mobile: Headline first, vertical flow diagram, Sell/Ads gates beside the core, stacked statement rail, touch-safe email.
- Tablet: Single-column hero with a compact horizontal or hybrid signal; two-column statement wrap only when measures remain readable.
- Desktop: Headline left, horizontal diagram right, three statements on one rail.
- Wide screen: Cap at the existing max-width; increase whitespace rather than diagram complexity.
- Zoom, text expansion, localization, and RTL: Preserve document flow; no fixed text boxes; SVG labels may need a future localized variant before adding another locale.

## State Coverage

- Default and interaction states: Final diagram state, email hover/focus, navigation unchanged.
- Loading: Not applicable; server-rendered and no external assets.
- Empty: Not applicable.
- Error and recovery: If CSS/SVG animation fails, semantic HTML remains readable and the SVG defaults visible.
- Success: Not applicable.
- Offline, unauthorized, stale, or partial: Page and vector remain available from the normal cached document; no user-specific state.

## Accessibility, Performance, And Content Boundaries

- Accessibility: Semantic headings/articles/link; SVG is decorative because nearby copy carries the meaning; no color- or motion-only information.
- Reduced motion: Immediate final state; no path travel, stagger, scale, or translation.
- Performance: No client bundle or media request; bounded SVG and compositor-friendly opacity/transform with stroke-dash path drawing.
- SEO/GEO and content meaning: Primary copy remains raw HTML; no hidden legal content or unsupported claim.
- Asset rights: Repository-owned logo/system; generated mockups are design evidence, not shipped runtime assets.

## Approval Boundary

- Approved surfaces and files: Only the paths listed in `HUNPEOLABS-PRIVACY-001-v4`.
- Explicit exclusions: Shared header/footer redesign, shared PageHero redesign, API/configuration/data/dependency/deployment changes.
- Decisions requested: Approve desktop/mobile compositions and motion contract.
- Delta approval triggers: New dependency, client animation runtime, persistent motion, global token change, shared component change, additional copy, provider activation, or production deployment.
