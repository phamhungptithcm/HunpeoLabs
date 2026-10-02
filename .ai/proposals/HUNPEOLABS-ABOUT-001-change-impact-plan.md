# HUNPEOLABS-ABOUT-001 — About and founder introduction

Status: proposed; awaiting explicit human approval. Task reference: user request 2026-10-02. No application edits performed.

## Repository intelligence brief

Gate: READY; CodeGraph and CocoIndex health passed, indexes reported current. CodeGraph `AboutPage` resolves to `app/about/page.tsx`; verified against source. CocoIndex semantic query returned unrelated blog passages; these provide no founder biography evidence. Source inspection is the authority for this scope.

Verified: `/about` is a server page with a generic engineering hero, SystemDiagram, principles, disciplines and CTA. `/company/about` redirects to `/about`. Careers describes a one-person studio. Two About assertions in `tests/e2e/site.spec.ts` depend on the old diagram/heading. Shared footer links to `/about`. Framework: Next.js 16.3.8, React 19.2.8, TypeScript 6.0.3, pnpm 11.9.0; Playwright and Vitest. Existing worktree contains extensive unrelated WIP; preserve it.

## Requirement and concrete content

Make About explain who Hunpeo Labs is and introduce Hung Pham as founder. Keep English to match the website. Keep current white/black/blue visual identity, with an editorial studio introduction and a prominent founder section instead of an engineering flow diagram.

Suggested hero: “A small studio. A personal commitment.”

Studio draft: “Hunpeo Labs is an independent studio founded by Hung Pham. It brings product design, software engineering, and AI together to build useful digital products.”

Founder heading: “Hung Pham / Founder, Hunpeo Labs”. Draft: “I’m Hung Pham, the founder of Hunpeo Labs. This is where I bring my product and engineering work together, from an early idea to the details of building it.”

Sections: studio introduction; founder with clearly labelled LinkedIn, personal Facebook and GitHub; concise approach to useful products and responsible engineering; connect with the studio through its Facebook and the existing contact route. Founder presentation uses typography/initials; no invented portrait, resume, location, founding date, clients, credentials or achievements. Copy is proposed positioning, not a quoted biography.

Links supplied by the user:
- LinkedIn: https://www.linkedin.com/in/hunpham/ (omit self-profile query)
- Personal Facebook: https://www.facebook.com/hawaihouu
- GitHub: https://github.com/phamhungptithcm
- Hunpeo Labs Facebook: https://www.facebook.com/profile.php?id=61579548848441

## File-by-file implementation

1. `app/about/page.tsx`: replace AboutPage content/layout; remove local SystemDiagram import and discipline list; update page metadata to mention studio/founder; retain canonical `/about` and existing contact/principles navigation where useful.
2. `app/about/about.module.css` (new): page-scoped responsive editorial layout and founder panel; accessible link/focus states; use existing typography/colors. Avoid shared global styles and extra dependencies.
3. `tests/e2e/site.spec.ts`: update only affected About expectations in the mobile layout and independently addressable pages scenarios. Verify founder visibility, exact four link destinations, and mobile width/readability. Preserve Careers and redirect coverage.

## Impact, risk and alternatives

Low-risk public presentation change. No database, authentication, API, infrastructure or runtime configuration changes. About search description changes. External links are navigation only; distinguish personal and studio Facebook. New-tab links, if used, must have appropriate rel values. Shared styles/components and other WIP remain untouched. No production deployment included. Rollback is scoped restoration of these About changes, preserving pre-existing WIP.

Alternative: add a founder block beneath the current content; rejected as it retains the process-heavy About structure the user wants replaced. Biography details and portrait remain unknown and are unnecessary for this bounded change.

## Validation and completion after approval

Read relevant bundled Next.js metadata/page guides before implementation; apply frontend HTML/CSS, TypeScript and visual-design quality profiles. Run lint, typecheck and relevant unit coverage; run affected Playwright About/mobile/redirect scenarios. Inspect desktop and mobile rendering for overflow, hierarchy, keyboard navigation and readable founder links. Review fresh diff against approved scope; perform mandatory final-implementation-review and record evidence/completion report. Test success applies only to the local candidate, not deployment or ownership/access to social accounts.

## Approval requested

Approve HUNPEOLABS-ABOUT-001 with the three-file implementation scope above, English copy, founder identity and supplied public links. Do not deploy or modify unrelated WIP.
