# HUNPEOLABS-FOOTER-027 — Remove footer navigation

Status: Approved with user refinement on 2026-10-02: remove the logo row too, keep only the metadata row shown in the second attachment.

## Repository intelligence and evidence

- Gate executed: CodeGraph and CocoIndex healthy but stale; DEGRADED. Conclusions use bounded source inspection, not stale indexes.
- Current commit: 3d53e1b8201251cb28e02dbd2052ad36b1d67fec. Existing unrelated working-tree changes must be preserved.
- `app/layout.tsx` renders `SiteHeader` and `SiteFooter` separately.
- `components/site-footer.tsx` defines `footerLinks` and renders Services, Products, Blog, About, Careers inside a nav labelled Footer navigation.
- Stack: Next.js 16.3.8, React 19.2.8, TypeScript 6.0.3, pnpm; shared context build commands checked.

## Impact and implementation plan

1. In `components/site-footer.tsx`, remove `footerLinks`, BrandMark import and the entire main row. Preserve contact email, Privacy, analytics preferences, copyright and the header.
2. In `styles/globals.css`, remove obsolete main-row/navigation rules and the metadata border that duplicates the outer footer border. Preserve metadata spacing and responsive wrapping.
3. Update the existing footer-navigation expectation in `tests/e2e/site.spec.ts` to assert the navigation is absent while retaining metadata coverage; run the focused browser check on desktop and mobile plus targeted ESLint and TypeScript. Complete applicable quality gates and final implementation review after approval.

Risk: low; presentation-only change across pages using the root layout. No data, authentication, API, dependency, deployment or infrastructure changes. Rollback restores the removed navigation. No new tests needed for this small reversible removal unless existing tests depend on it.

Acceptance: Footer no longer displays the logo row or the five navigation links in the attachment; header navigation and footer metadata remain intact. Update the existing blog footer-logo expectation to match the compact footer.

Approval scope requested: the component removal and corresponding existing E2E expectation above, with only directly necessary spacing adjustments if any. No protected application files edited yet.
