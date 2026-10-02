# Implementation Approval Record

Plan ID/version: HUNPEOLABS-BLOG-001 v2
Repository intelligence gate status: READY — plan source mapping was verified READY in this chat; current refresh is DEGRADED because CocoIndex cannot open its daemon log. Required-workflow phase 3 explicitly permits approved work with bounded source evidence.
Approval status: APPROVED
Approver: User in this Codex chat
Approval timestamp or task reference: User message “apporved” directly responding to the request to approve plan v2, in this chat.
Approved scope: Implement the complete v2 blog CMS, moderated reader comments and article sharing locally; preserve unrelated WIP. Exact scope and acceptance criteria are in HUNPEOLABS-BLOG-001-change-impact-plan.md.
Approved paths:
- `lib/blog/**`
- `lib/firebase-admin.ts`
- `app/api/admin/blog/**`
- `app/api/blog/**`
- `app/admin/blog/**`
- `app/blog-account/**`
- `components/blog-editor/**`
- `components/blog-admin/**`
- `components/blog-comments/**`
- `components/blog-share.tsx`
- `components/blog-article.tsx`
- `components/blog-content.tsx`
- `content/blog.ts`
- `app/resources/blog/**`
- `app/resources/page.tsx`
- `app/sitemap.ts`
- `app/robots.ts`
- `app/llms.txt/route.ts`
- `styles/blog*.css`
- `styles/globals.css`
- `next.config.ts`
- `package.json`
- `pnpm-lock.yaml`
- `env.example`
- `.env.example`
- `firebase.json`
- `firestore.rules`
- `firestore.indexes.json`
- `storage.rules`
- `scripts/validate-blog-env.mjs`
- `scripts/blog-*.mjs`
- `tests/unit/blog*.test.ts`
- `tests/integration/blog*.test.ts`
- `tests/e2e/blog*.spec.ts`
- `tests/e2e/site.spec.ts`
- `tests/unit/seo.test.ts`
- `tests/unit/product-catalog.test.ts`
- `tests/unit/structured-data.test.ts`
- `playwright.config.ts`
- `docs/blog-editor-guide.md`
- `docs/operations/blog-runbook.md`
- `docs/operations/production-readiness.md`
- `app/privacy/page.tsx`
Required constraints: Local/emulator implementation only. No production provisioning, IAM changes, billing, deployment, real publication, Git push, or unrelated WIP edits. No fabricated content or provider verification. Preserve existing security controls. Additional architecture/scope requires delta approval.

Integration detail: concurrent product-catalog test now imports the approved async sitemap/feed consumer; only await compatibility and server-only mock are adjusted, preserving its assertions. This is required caller adaptation, not new product scope.

## Design integration approval — v1

Approval status: APPROVED
Approver: User in this chat
Evidence: “approved hãy triển khai giống 100%” directly following the seven-screen Journal + Studio mockup review.
Approved design source: `design/blog-v1/index.html`, `design.css`, `design.js`.
Concrete integration plan: reuse the approved tokens, layout, typography and responsive rules in scoped blog styles; replace public index/article/share/discussion and admin dashboard/editor/moderation/settings markup while retaining authenticated API operations, autosave conflicts, moderation and publication constraints. Replace illustrative values with actual data. Keep design review toolbar and demo records out of production. Provide actual empty/loading/failure states from screen 7. Compare desktop/mobile renders and rerun local functional workflows.
Necessary additional integration paths: `components/blog-admin/ui.tsx`, `components/blog-admin/chrome.tsx`, `components/blog-admin/dialog.tsx`, `styles/blog-design.css`, `app/layout.tsx` (wrap existing header/footer to select blog-specific chrome without changing other routes); scoped test/evidence scripts remain under existing allowlist. Public blog layout/error/loading/not-found routes are covered by `app/resources/blog/**`. No unrelated page, infrastructure, or production changes.
Risk: MEDIUM UI integration over previously approved HIGH-risk CMS. Preserve repository/auth/data behavior, keyboard access, user input and errors. Repository intelligence DEGRADED after one attempted refresh; direct source evidence used. This is the concrete implementation of the approved mockup and existing feature scope, not a request for another approval.
