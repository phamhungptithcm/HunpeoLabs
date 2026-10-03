Plan ID/version: HUNPEOLABS-TAXONOMY-029
Repository intelligence gate status: DEGRADED
Approval status: APPROVED
Approver: Human user in current Codex chat
Approval timestamp or task reference: User message "approved" following proposal HUNPEOLABS-TAXONOMY-029, client date 2026-10-02
Approved scope: Category autocomplete, admin-only create-if-new, tag chips/Enter/delete/limits, scoped validation and reports.
Constraints: Preserve unrelated dirty work; no dependencies, migrations, production actions or authorization broadening. DEGRADED native fallback explicitly allowed by repository workflow; legacy validator requires READY and is incompatible with the current fallback policy. Do not mislabel the gate READY.
Approved paths:
- `components/blog-editor/editor.tsx`
- `components/blog-editor/taxonomy-fields.tsx`
- `app/admin/blog/[id]/page.tsx`
- `app/api/admin/blog/taxonomy/route.ts`
- `lib/blog/repository.ts`
- `lib/blog/taxonomy-input.ts`
- `styles/blog-design.css`
- `tests/unit/blog-taxonomy*.test.ts`
- `tests/e2e/blog-cms.spec.ts`
