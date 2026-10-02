# Repository intelligence brief — Product catalog v2

- Goal: research and redesign `/products` to distinguish featured and other products.
- Commit: `3d53e1b8201251cb28e02dbd2052ad36b1d67fec`; extensive pre-existing WIP preserved.
- Gate: initially READY, CodeGraph current/healthy, CocoIndex metadata current/healthy.
- Actual retrieval: CodeGraph `explore ProductsPage` succeeded; CocoIndex semantic query failed because `~/.cocoindex_code/daemon.log` was not writable. Overall evidence mode DEGRADED for semantic retrieval; no completeness claim.
- Verified files: `app/products/page.tsx`, `content/site.ts`, `docs/product-pages.md`, `styles/tokens.css`, `components/site-header.tsx`, `components/brand-mark.tsx`, focused product E2E/unit references.
- Flow: products registry -> catalog/detail routes -> sitemap/llms.txt; structured-data tests depend on identities. Current three entries are AI Agent Kit, IncOv, Gig.
- Contracts: public routes and registry identities preserved. No DB/API writes or runtime integrations.
- Gap: equal-sized product narratives lack editorial selection and compact broader discovery.
- Proposed solution: independent catalog selection data, scoped layout, static illustrative visuals; details retained.
- Unknown: owner's chosen featured products and any additional portfolio entries. Asked asynchronously; use explicitly provisional selection in mockup.
- Evidence/design/plan: `docs/design/product-catalog-v2/design-and-impact-plan.md`, `preview.html`, `desktop.png`, `mobile.png`.
- Approval: pending; no existing application edits performed in this task.

## Revised owner scope, v2

- Confirmed four products: AI-Agent-Kit, SatsunicSEO, SatsunicMec, BeFam. SatsunicMec identity explicitly mapped by owner to satsunicmedic/HumanScope.
- Source-checked README positioning in Satsunic-SEO-Extension, satsunicmedic and gia-pha. Public availability not verified.
- One refresh attempted; subsequent gate remains DEGRADED (stale indexes, CocoIndex health failure). Current native source evidence used.
- New design/plan replaces the old three-product proposal; legacy app URLs remain untouched pending approved migration decisions.
- Future growth handled by typed publication/featured/order/action fields, not fixed product conditionals or a new CMS.
