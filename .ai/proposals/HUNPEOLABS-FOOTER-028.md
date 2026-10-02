# HUNPEOLABS-FOOTER-028 — Compact contact details

Status: Approved by user reply “ok”; implemented and locally verified. Date: 2026-10-02.

## Verified context and intelligence brief

Repository gate ran: DEGRADED, both optional indexes stale but healthy. Bounded source evidence: components/site-footer.tsx, styles/globals.css footer and mobile rules, app/seo.ts, tests/e2e/services.spec.ts. Shared footer currently contains tagline, support email, Privacy, analytics preferences and copyright. It is called from the root layout; no logo/navigation remains. Services tests verify shared footer consistency. Preserve unrelated dirty-tree changes.

Stack/profile: Next.js 16.3.8, React 19.2.8, TypeScript 6.0.3; universal, TypeScript/JavaScript, frontend HTML/CSS, web-app and visual-design. Existing shared documentation and installed Next Link guide were read in the previous footer task and remain applicable.

## Concrete design

Keep the existing white background, thin top border, muted monospace text and current page gutter. Add a compact contact block immediately above the existing legal/metadata line, within the same footer; no logo, navbar, cards or icons.

Desktop: two balanced columns. Left contains the address, right contains phone, founder and office hours. At narrow widths they become a single column with natural text wrapping. Labels use slightly darker existing text tokens; values keep the subdued hierarchy.

Visible content:

- Address: Xóm 2, Đông Dương, Quảng Trạch, Quảng Trị 470000
- Phone: +84 889 680 497 (tel:+84889680497)
- Founder: Hung Pham
- Hours: Mon–Fri, 8 AM–5 PM

Use the user-supplied address verbatim without geocoding, inferred timezone or external Maps link. Correct the supplied label “Fouder” to “Founder”. Keep English labels consistent with the site, Vietnamese proper names intact. Keep email, Privacy, consent control, tagline and copyright in their existing compact lower row.

## Implementation and impact

1. components/site-footer.tsx: add semantic contact markup and clickable telephone number.
2. styles/globals.css: scoped contact layout using existing typography, colors and spacing; responsive two-column-to-one-column layout. No global token or unrelated style changes.
3. tests/e2e/site.spec.ts: extend the existing footer check for supplied values and phone link, keeping no-logo/no-navbar assertions.

Risk low: static presentation/contact publication in the shared footer across public pages. No API, persistence, auth, provider, config, infrastructure or dependency changes. No structured-data change or deployment. Rollback reverses only task hunks.

Validation: targeted ESLint, TypeScript, desktop/mobile footer browser check, screenshot inspection and no horizontal overflow. Final implementation review after approval. Full-site production readiness remains outside this local UI scope.

Acceptance: all four supplied contact details visible and readable, usable phone link, compact balanced desktop layout, clean mobile wrapping, unchanged visual language and preserved existing footer controls.
