# Implementation Approval Record

Plan ID/version: HUNPEOLABS-SERVICES-001-v2-mockup-fidelity

Repository intelligence gate status: DEGRADED

Approval status: APPROVED

Approver: User in current Codex chat

Approval timestamp or task reference: Current chat, user message following the completed seven-page mockup: “approved triển khai giống 100% đã mockup vào project”

Approved scope: Implement the approved `output/services-mockup/index.html` design and copy across the overview and six existing service routes. This supersedes the earlier copy-only v1 approach. Match its responsive layout and service-specific header/footer; replace preview-only controls with real contact/product navigation. Preserve privacy/analytics preferences. No publication, deployment, push, or unrelated edits.

Approved paths:

- `app/services/**`
- `app/layout.tsx`
- `components/services-*.tsx`
- `content/site.ts`
- `tests/e2e/services.spec.ts`
- `tests/e2e/site.spec.ts`
- `tests/unit/content.test.ts`
- `docs/design/services/**`
- `.ai/proposals/HUNPEOLABS-SERVICES-001-*`

Constraints: Preserve dirty WIP; existing routes/metadata/JSON-LD/llms consumers; shared page appearance outside Services; no new dependency, backend, auth, tracking, or production mutation.

## Concrete implementation plan and impact

1. Extend the service registry with headline and use approved mockup copy, retaining names/slugs and existing field semantics.
2. Build reusable Services CTA/delivery/detail components; overview reuses the approved group, project, FAQ, and hero markup. Keep server rendering and native details controls.
3. Scope the exact mockup styles under `.services-surface`. Route-specific chrome uses a small pathname switch around existing header/footer children in root layout; non-service paths render the unchanged original components.
4. Remove only mockup tooling (preview banner, page picker, placeholder dialogs). Use real Next links. Retain a small privacy/preferences footer line required by the existing site.
5. Migrate stale tests; add service navigation, unknown route, metadata/JSON-LD, no-JS, responsive and privacy regression checks. Compare rendered geometry against mockup at desktop/mobile.
6. Run lint, typecheck, unit, build, and browser checks; review all task-specific changes against the saved pre-edit files and record final review/report.

## Repository evidence

Current HEAD remains `3d53e1b8201251cb28e02dbd2052ad36b1d67fec`. Prior brief identifies registry -> catalog/detail/metadata/JSON-LD/llms and shared chrome. Current direct reads verify these paths. Current gate is DEGRADED after one refresh failed for CocoIndex; use bounded source, rg, compiler, and tests. Do not misstate validator readiness: its hard-coded READY requirement is stricter than the gate's explicit DEGRADED fallback. No self-approval or production approval is implied.

Stack: Next 16.2.12 / React 19 / TypeScript 6 / pnpm 11.9 / Vitest / Playwright. Profiles: universal, TypeScript/JavaScript, frontend HTML/CSS, web app, visual design, SEO/GEO, marketing integrity. Risk: low implementation, moderate offer accuracy; user approved proposed offers through the exact mockup instruction.
