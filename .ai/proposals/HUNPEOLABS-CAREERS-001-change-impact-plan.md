# HUNPEOLABS-CAREERS-001 — Careers for a one-person startup

Status: APPROVED; IMPLEMENTED LOCALLY; VERIFICATION BLOCKED. Version: 2. Date: 2026-10-01.

## Outcome and evidence
The user confirms HunpeoLabs currently has one member. The existing `/careers` page leads with abstract team collaboration and four collaboration-diagram nodes, then announces no published roles near the bottom. Replace that framing with a transparent one-person studio, prominent hiring status, actual product discovery, and a low-pressure email introduction.

Source inspected: `app/careers/page.tsx` (CareersPage, metadata, values, collaboration), `app/about/page.tsx`, `app/contact/page.tsx`, `app/seo.ts` (SITE_CONTACT_EMAIL), `components/site-header.tsx`, `components/site-footer.tsx` references, `styles/tokens.css`, and `tests/e2e/site.spec.ts:422` onwards. Navigation and sitemap already address `/careers` independently. Page is a server-rendered presentation without persistence or API calls. Contact page is project-brief oriented; the existing public contact email fits introductions better. Email is source-verified, delivery is unverified.

Repository intelligence: DEGRADED. Both index health checks passed but indexes are stale for this dirty worktree at commit `3d53e1b8201251cb28e02dbd2052ad36b1d67fec`. One refresh attempt (`--timeout 20`) timed out during CodeGraph sync. No stale index evidence used; bounded source, search, package and Git evidence used. Neither structural nor semantic index completeness is claimed. Many unrelated modifications exist and must be preserved.

## User direction for v2
The user clarified: seek people with shared vision to join the team. The design now invites a conversation about building HunpeoLabs together, rather than passive future job interest. One-person status stays explicit. Main CTA opens the introduction section; product discovery becomes secondary. Principles focus on shared purpose, hands-on building and long-term trust. Closing copy asks what the visitor cares about and wants to build. Do not assign a cofounder title or promise equity, salary, an open vacancy, unpaid work or employment terms without owner confirmation. Terms must be discussed before work begins.

The v2 copy in preview.html supersedes the original v1 copy outline below. Exact application file scope and approval requirement remain unchanged. Approval requested: v2.

## Original v1 design (superseded by v2 preview)
Preview: `docs/design/careers/preview.html`; screenshots: `desktop.png`, `mobile.png` in the same directory.

1. Hero: “One person. Room to grow.” Explain one-person startup building digital products and AI tools. Primary CTA “Explore the products” → `/products`. Secondary introduction anchor.
2. Quiet typographic studio panel: “01.” / “One person. Hands-on.” No stock team photography or implied staff roles.
3. Immediately visible status band: “No open roles right now.” Future opportunities published with clear scope and expectations.
4. Three short principles: real problems, careful craft, clear expectations. Frame as approach, not employee benefits or existing team process.
5. Dark closing invitation: “Like what’s taking shape?” Existing public email with static subject. Explicitly an introduction, not a job application; no role or timeline promised.
6. Use existing white/black/royal-blue tokens, square geometry, large type, thin rules. Two-column desktop, single-column mobile. Existing production header/footer remain in implementation; preview chrome is illustrative only.

## Exact proposed implementation scope
- `app/careers/page.tsx`: replace CareersPage sections, remove page use of SystemDiagram, replace local content arrays; update metadata description to reflect one-person status. Import SITE_CONTACT_EMAIL and scoped styles. Keep route and title.
- `app/careers/careers.module.css` (new): scoped responsive layout and styles matching preview. Reuse shared tokens; visible focus, semantic headings and minimum usable mobile controls. Static rendering; no JS motion needed.
- `tests/e2e/site.spec.ts`: replace ONLY Careers-specific old heading/diagram assertions in the combined about/careers/contact test with one-person disclosure, no-role status, product link and introduction email assertions. Preserve About/Contact assertions. Include no horizontal overflow and keyboard CTA checks at desktop/mobile sizes.
- `docs/design/careers/*` and this proposal: design and validation evidence updates.

Application edits were made after explicit user approval; see HUNPEOLABS-CAREERS-001-approval.md. No shared CSS, diagram component, other page, navigation, dependencies, authentication, database, API, infrastructure, deployment or contact delivery configuration changes are proposed. If required, obtain delta approval first.

## Risk, contracts and alternatives
Low runtime/security risk, moderate content and visual regression risk. Preserve `/careers`, canonical metadata behavior, header/footer links, other route content and existing contact recipient constant. No JobPosting structured data because no vacancy exists. No candidate database, CV upload, form submission, tracking event, financial or transaction behavior. Mailto opens the visitor's email client; do not claim delivery or add false success UI. Users can use the existing Contact navigation if email setup fails. No hiring date, compensation, benefits, funded position or response guarantee invented.

Alternative: minor wording changes would leave team-oriented diagram and buried status. A talent-pool form adds personal-data collection and operational responsibilities without a current hiring need. Prefer the static focused redesign. Revisit actual role listings only when a role exists. Confirmed: one member. Assumed from existing page: no published roles. Unknown: future hiring plans and response capacity; avoid claims.

## Verification after approval
Stack: Next.js 16.2.12 / React 19.2.8 / TypeScript 6 / pnpm 11.9.0; Node >=24. Profiles: universal, typescript-javascript, frontend-html-css, web-app, visual-design, marketing-growth, human-writing, seo-geo.
Run focused Careers E2E on desktop and mobile, check actual route CTA destinations, keyboard focus, metadata, responsive overflow and shared navigation regressions; run lint, typecheck, unit tests and production build. Visually inspect actual route, not just the mockup. Run final-implementation-review and record review cycles. No production or email-delivery acceptance implied by local checks.

No deployment or migration in this task. Rollback: restore only approved Careers edits from a task-local pre-edit snapshot, preserving unrelated WIP. No backend rollback necessary.

## Approval requested
Approve v2 design and exact file scope above, then implement and verify locally. Production publication requires separate authorization.

## Handoff status
V2 implemented following approval. Build and focused lint passed; repository checks and browser verification have blockers. See completion-report.md in docs/design/careers. Production readiness: NOT READY. Token usage and billed cost: Unavailable. Memory candidates: None.
