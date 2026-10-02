# HUNPEOLABS-NAV-001 v1

Status: approved by user message "apporved"; see HUNPEOLABS-NAV-001-approval.md.

## Outcome and scope

Remove Work and Resources from shared navigation and expose Blog directly.
Proposed order: Services, Products, Blog, About, Careers.
Blog points to the existing `/resources/blog` route.

## Source evidence and intelligence brief

Baseline HEAD: `3d53e1b8201251cb28e02dbd2052ad36b1d67fec` with extensive existing WIP.
Repository intelligence gate returned DEGRADED: both indexes stale, both health
queries passed.
Use DEGRADED evidence: targeted source reads and exact searches. No index-derived
impact or completeness claims. A bounded refresh was requested once.

- `components/site-header.tsx`: one navigation array serves desktop/mobile;
  active link matches the route and nested article paths; link clicks close menu.
- `components/site-footer.tsx`: independent footerLinks array includes Work and Resources.
- `app/resources/blog/page.tsx`: existing blog index and RSS links.
- `tests/e2e/site.spec.ts`: existing mobile menu and header scroll coverage.
- `package.json`: Next.js 16, React 19, TypeScript 6, pnpm, ESLint, Playwright.
- Existing BLOG-001 approval covers CMS work, not the shared navigation change.

## File-by-file implementation

1. `components/site-header.tsx`, navigation: replace Work and Resources entries
   with `["Blog", "/resources/blog"]`.
2. `components/site-footer.tsx`, footerLinks: apply the same replacement while
   preserving current analytics consent and other unrelated edits.
3. `tests/e2e/site.spec.ts`: extend navigation checks to verify exact link order,
   absence of removed entries in both navigation regions, Blog destination,
   active state, and mobile menu close after click.

## Impact and constraints

Low risk: shared marketing navigation only. No dependencies, authentication,
storage, API, infrastructure, deployment, or schema changes. Preserve existing
routes, contextual page links, article URLs, RSS, SEO metadata, contact CTA,
keyboard behavior and analytics preferences. Assumption: request concerns menu
entries; removing entire sections/routes would require a separate plan.
No route migration is needed to expose Blog as a top-level menu item.
Risk is a broken Blog link or mobile/active-state regression.
Rollback restores only the changed navigation entries and related assertions.

## Validation after approval

Run focused ESLint/typecheck and Playwright navigation coverage in desktop and
mobile projects. Verify Blog and a published article active state where content
exists. Inspect final diff for scope and WIP preservation. Apply frontend and
TypeScript quality profiles and mandatory final implementation review before
completion. Record actual results and any pre-existing blockers separately.

## Approval requested

Approve HUNPEOLABS-NAV-001 v1 for the three files above. No production publication.
