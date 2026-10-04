# Shared website and Studio toast
Plan ID/version: HUNPEOLABS-TOAST-064-v1
Repository intelligence gate status: DEGRADED — current gate/native source fallback; stale optional indexes.
Approval status: APPROVED
Approver: human user
Approval timestamp or task reference: 2026-10-03 current chat direct instruction "cần đồng bộ giống studio" after concrete website/Studio toast comparison.
Observed: Studio/editor use BlogToast and global CSS. Public auth/share/RSS/comments/account use separate or inline feedback. Reuse the exact existing component/CSS, not a second design. Website English/Studio Vietnamese. Add optional language/action/pending props; default Studio countdown/hover/focus behavior unchanged. Pending sign-in remains until completion; error/success/info countdown5s. Keep retry controls functional after error toast dismissal. Observe open dialogs to keep portaled toast visible when modal closes. Replace public transient feedback only; persistent content, loading/retry state, inline form validation and server auth/API unchanged.
Approved paths:
- `components/blog-admin/toast.tsx`
- `components/google-one-tap.tsx`
- `components/blog-admin/login.tsx`
- `components/blog-admin/account.tsx`
- `components/blog-share.tsx`
- `components/blog-rss.tsx`
- `components/blog-comments/comments.tsx`
- `components/blog-copy-button.tsx`
- `components/project-brief-form.tsx`
- `styles/blog-design.css`
- `tests/unit/toast-countdown.test.ts`
Constraints: no new dependency, no auth/session/controller/API change, no schema/provider setting changes. Do not remove unrelated WIP/generated next-env. Local implementation/verification; no new production deploy requested this turn. Validate lint/typecheck/countdown regression tests/build; mandatory final review. Browser rendered acceptance NOT TESTED due prior restriction; no workaround.

Bounded public-site search also found code/section copy feedback and contact brief outcomes. Include the same toast presentation there; retain prepared brief/instructions, API delivery and form validation. No contact transport changes.
