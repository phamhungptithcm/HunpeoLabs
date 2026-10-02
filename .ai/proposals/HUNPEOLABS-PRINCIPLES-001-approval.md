# Implementation Approval Record

Plan ID/version: HUNPEOLABS-PRINCIPLES-001-v2

Repository intelligence gate status: READY — verified 2026-07-29

Indexed analysis reviewed: CodeGraph and CocoIndex analysis of the Principles route, canonical content, shared shell, shared motion lifecycle, route-scoped styling boundary, tests, and existing design evidence.

Approval status: APPROVED

Approver: User in the current Codex task

Approval timestamp or task reference: Current Codex task, explicit user message “UI is good I approved but for text cần tự nhiên giống con người đơn giản dễ hiểu ngắn nhưng thông minh” on 2026-07-29.

Approved scope: Implement the complete approved desktop/mobile Principles UI and motion direction, with the v2 copy refined under the user’s explicit constraint that it feel human, natural, simple, easy to understand, short, and intelligent.

Approved paths:

- `.ai/proposals/HUNPEOLABS-PRINCIPLES-001-*.md`
- `.ai/local/implementation-approval.md`
- `app/company/principles/page.tsx`
- `app/company/principles/principles.module.css`
- `components/principles-flow.tsx`
- `content/site.ts`
- `tests/unit/content.test.ts`
- `tests/e2e/principles.spec.ts`
- `docs/design/principles/**`

Required constraints: Preserve unrelated dirty-worktree changes. Keep the route server rendered. Preserve the shared sticky header, footer, layout, metadata system, focus behavior, and MotionOrchestrator without editing them. Match the approved layout, hierarchy, white/black/blue palette, square flow geometry, desktop/mobile adaptations, and bounded one-time motion. Use the exact v2 copy in the plan. Use code-native HTML/CSS/SVG only. Add no dependency, client animation runtime, third-party script, analytics, or runtime bitmap asset. Respect reduced motion. Do not commit, release, or deploy.

Explicit exclusions: Shared PageHero changes, shared header/footer/layout changes, new claims, localization, API/data/auth/contact/privacy behavior, runtime configuration, infrastructure, dependencies, production deployment, commit, and release.

Delta approval required when:

- New paths outside the approved list are required.
- The accepted composition, hierarchy, flow stages, or v2 copy changes materially.
- A dependency, client runtime, third-party service, runtime asset, shared component change, or public claim is required.
- API, data, configuration, infrastructure, deployment, commit, or release behavior changes.
