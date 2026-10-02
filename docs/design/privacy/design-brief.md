# Privacy Page Design Brief

## Product Surface

- Surface type: Public marketing-site Privacy route.
- New build or redesign: Redesign of `/privacy`.
- Routes, screens, or components: Privacy page, information-flow illustration, desktop/mobile compositions, scoped motion.
- Existing design system: Hunpeo Labs white/black/blue editorial system, Arial/Helvetica display type, mono technical labels, square geometry, thin engineering lines, sticky header, global section reveal.

## Audience And Outcome

- Primary audience: Prospective clients, collaborators, and visitors checking how Hunpeo Labs handles information they intentionally share.
- Primary user task: Understand the policy in seconds and find the privacy contact.
- Business outcome: Turn a generic legal page into a memorable trust surface without adding legal or infrastructure-heavy copy.
- Trust, compliance, or accessibility context: Accuracy and readability override novelty. The visual cannot imply guarantees beyond the visible copy.

## Content And Information Architecture

- Primary message: What a visitor shares follows one short path: Hunpeo Labs understands and replies.
- Content hierarchy:
  1. `Privacy, without the maze.`
  2. You Share → We Understand → We Reply.
  3. We do not sell or advertise with personal information.
  4. Privacy contact.
- Required actions: Email `support@hunpeolabs.com`.
- Required states: Default desktop/mobile, link hover/focus, configured provider disclosure, normal motion, reduced motion.
- Locales and text-expansion expectations: English baseline; tolerate 200% zoom and approximately 30% text expansion without overlap or horizontal page scroll.

## Brand And Assets

- Existing brand guidance: Precision, evidence, clear boundaries, restrained blue signal.
- Approved assets and provenance: Existing Hunpeo Labs logo/brand mark and repository-owned design screenshots.
- Existing tokens, components, fonts, icons, and imagery: `styles/tokens.css`, `SiteHeader`, `SiteFooter`, `MotionOrchestrator`, mono labels, line-icon/SVG visual system.
- Elements that must be preserved: Header/footer, blue `#173df5`, black/white base, square geometry, server-rendered copy, visible focus.

## References

- Primary inspiration: Framer reference for motion-first precision, dense display type, and one-accent discipline.
- Optional secondary influence: Mastercard reference for orbital/trajectory composition and editorial whitespace.
- Patterns to adapt: Thin paths, activated nodes, asymmetric hero, dramatic scale contrast, one-time staged movement.
- Elements that must not be copied: Brand colors, proprietary fonts, logos, signature navs, exact compositions, product claims, imagery, or pill-heavy component language.

## Constraints

- Framework and styling system: Next.js server components, repository CSS, code-native SVG.
- Supported browsers and viewports: Existing Playwright Chromium desktop/mobile plus current Firefox/WebKit smoke boundary.
- Accessibility target: Semantic copy, keyboard-visible link, contrast, decorative SVG semantics, reduced-motion final state.
- Performance budget: No dependency, client component, image request, video, canvas, WebGL, blur animation, or infinite loop.
- SEO/GEO requirements: Keep primary meaning in raw HTML and preserve `/privacy` metadata/canonical behavior.
- Dependencies and delivery constraints: Existing dirty worktree; changes must stay namespaced and surgical.

## Unknowns And Approval Needs

- Unknown facts: No user-research evidence exists for the illustration metaphor.
- Decisions requested: Approve the natural-language v2 desktop/mobile mockups and the one-time signal/retraction motion sequence.
- Explicit exclusions: Hosting/logging explanations, cookie controls, analytics, provider activation, legal-compliance claims, production deployment.
