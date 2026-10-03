# Repository intelligence brief — HUNPEOLABS-TAXONOMY-029

Gate DEGRADED. CodeGraph stale, health passed; CocoIndex stale, health failed. One refresh attempted; CocoIndex daemon log access failed. No current indexed claims used. Source fallback: bounded rg and targeted reads.

Commit: 01ae2cac86c87da0cbe07d34d45ad03df3c3ad3f. Existing and concurrently changing WIP is preserved; baseline patch captured at /private/tmp/hunpeolabs-taxonomy-029-before.patch.

Call path: app/admin/blog/[id]/page.tsx authenticates staff, reads category catalog, passes admin capability to Editor → TaxonomyFields → existing same-origin taxonomy API → admin-only createCategory transaction → blogCategories. Existing catalog update remains unchanged. Selected category and tags use Editor.update and its revision-protected autosave. Pending category creation prevents a manual save/publish transition from saving stale selection.

Contracts: category string <=80; tags <=10 with each tag <=40; catalog readers bounded to 100. New createOnly boolean dispatch returns stored name. Lookup trims, normalizes NFC and case; no accent stripping. Firestore reads bounded to 101 and uses deterministic identity/probing to preserve renamed entries and prevent duplicate creation. No migration, dependency, authorization or production configuration changes.

Technology: TypeScript 6.0.3, React 19.2.8, Next.js 16.3.8, pnpm, Vitest, Playwright, Firebase Admin/Firestore. Bundled Next.js use-client guide consulted. Selected profiles: universal, typescript-javascript, frontend-html-css, web-app, api, database, concurrency. User-facing visual check: compact chips, visible x, bounded suggestion list, keyboard navigation, focus styling, responsive wrapping.

Validation boundary: unit logic/API dispatch tests, isolated demo Firestore emulator, rendered real component in a Vite browser fixture with stubbed taxonomy response. This does not prove authenticated full editor integration or production Firebase/Google behavior. Remaining risks: pre-existing catalog edits can independently create case duplicates; editor suggestions snapshot the loaded catalog; new create-only operation itself is concurrency-safe. No real account or production data used.
