Plan ID/version: HUNPEOLABS-PERFORMANCE-042-v1
Repository intelligence gate status: READY — verified post-source snapshot on 2026-10-03; later documentation refresh encountered a sandbox daemon-log permission error
Approval status: APPROVED
Approver: human user
Approval timestamp or task reference: 2026-10-03 current chat message "apporved" in response to Phase 0 + Phase 1 approval request
Approved paths:
- `app/resources/blog/[[]slug]/page.tsx`
- `app/resources/blog/loading.tsx`
- `app/resources/blog/layout.tsx`
- `app/resources/blog/[[]slug]/loading.tsx`
- `components/blog-loading.tsx`
- `components/blog-loading.module.css`
- `components/use-blog-session.ts`
- `components/blog-account-link.tsx`
- `components/google-one-tap.tsx`
- `lib/blog/public-read.ts`
- `lib/blog/session-store.ts`
- `tests/unit/blog-session-store.test.ts`
- `tests/unit/blog-streaming.test.ts`
- `tests/e2e/blog-performance.spec.ts`
- `.ai/proposals/HUNPEOLABS-PERFORMANCE-042*`
Constraints: Phase 0 baseline and Phase 1 only. No persistent media/public-data cache, auth/API/schema change, dependency change, production write or deployment. Preserve existing worktree changes. Legacy validator requires READY although repository-intelligence-gate.yaml explicitly permits DEGRADED native fallback; record this mismatch without fabricating READY or changing policy. This task-specific approval record does not replace another task's local approval.

Execution history: Initial intelligence mode was DEGRADED, authorized native fallback was used, and the legacy path validator rejected that mode. A later required post-implementation refresh genuinely restored READY; the field above records that verified later state, not the initial state.

Path encoding: `[[]slug]` escapes the literal `[slug]` directory for the validator's fnmatch patterns; it authorizes exactly that route segment.

Implementation detail: public blog layout wires the no-JavaScript reading fallback on every response; placing it only inside loading would miss fast responses. This is necessary wiring for the approved loading/readability acceptance criterion, within the same public blog module.
