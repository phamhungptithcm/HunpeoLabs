# HUNPEOLABS-TAXONOMY-029 — Category autocomplete and tag chips

Status: awaiting human approval. No application edits authorized yet.

## Intelligence and verified facts
Gate DEGRADED: CodeGraph stale; CocoIndex stale/unhealthy. One refresh attempted and failed on CocoIndex daemon log permissions. Bounded rg/source reads used; no complete indexed impact claim.
Editor already uses native datalist for categories, populated by authenticated catalog reads from blogCategories (bounded to 100). Category on the post is a string. Catalog writes are admin-only. Tags currently split a text field by commas; schema enforces at most 10 tags and 40 characters per tag. Editor has existing autosave and shared BlogToast. Dirty working tree includes editor, repository and styling changes; preserve them.

## Proposed behavior and constraints
- Replace native datalist with a visible accessible autocomplete: filter existing categories, select by mouse or keyboard to fill the exact stored name; trim and match case-insensitively before proposing a new name.
- Commit a new category on Enter/selection confirmation or blur, never on every keystroke. Admins create it in blogCategories through the authenticated taxonomy API. Preserve admin-only catalog creation; other staff receive a clear permission toast when attempting creation. Existing categories remain selectable for staff.
- New-category creation is idempotent under concurrent requests; use a dedicated create-only path in the existing taxonomy API, keeping catalog edit semantics intact. Return the stored name, update local options, and surface failures without a false success. Do not allow autosave to persist partially typed/unconfirmed category names.
- Render tags as chips with a small top-right x button and accessible deletion label. Enter commits a trimmed tag, clears input, and keeps focus. Ignore empty/duplicate tags; honor IME composition. Maximum 10 tags and 40 characters per tag, matching schema. Attempts beyond the limit show the existing toast. Removing a chip immediately updates post.tags through the existing dirty/autosave flow.
- No dependencies, migrations, production actions, or broader authorization changes.

## File and function plan
- components/blog-editor/editor.tsx: category draft/commit state, autocomplete interactions, tag draft and chip add/remove, existing toast integration and save coordination.
- components/blog-editor/taxonomy-fields.tsx (if useful): isolate accessible field UI and keyboard handlers.
- app/admin/blog/[id]/page.tsx: pass verified admin capability and category records as needed.
- app/api/admin/blog/taxonomy/route.ts and lib/blog/repository.ts: validated create-only operation, admin checks and atomic category deduplication; preserve existing update behavior and unrelated WIP.
- lib/blog/taxonomy-input.ts (if useful): pure normalization/limit rules for focused validation.
- styles/blog-design.css: autocomplete list and compact tag chip/delete layout, focus/mobile behavior.
- tests/unit and tests/e2e/blog-cms.spec.ts: focused cases for selection/new category, permission failures, deduplication/concurrency, IME, Enter, deletion and limits.

## Risks and validation
Medium risk: catalog writes, autosave interaction and keyboard accessibility. Verify existing catalog naming/IDs before implementing the create path. Check authenticated admin creation, denied staff creation, exact existing-name selection, failed save, concurrent deduplication, max lengths, 10/11 tags, removal/re-add, keyboard and mobile. Run relevant lint/typecheck/unit checks and focused browser verification where available. Read bundled Next.js guides before code changes; complete fresh final implementation review and task completion report. Rollback is scoped source revert; no migration required.

Approval requested for this scope, including retaining the existing admin-only category creation permission.
