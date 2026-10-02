# Hunpeo Labs product catalog — revised portfolio

Plan: HUNPEOLABS-PRODUCT-CATALOG-002 v2. Status: APPROVED by the owner’s subsequent “approved” message; application integration in progress.

## Confirmed scope

The owner specified exactly four current products: **AI-Agent-Kit, SatsunicSEO, SatsunicMec, BeFam**, with more products to be published later. The owner explicitly confirmed SatsunicMec is the anatomy/physiology product in `satsunicmedic`, formerly using the working title HumanScope. IncOv and Gig are excluded from this proposed catalog. Their existing URLs are not deleted or redirected by this design decision.

## Verified research

- HunpeoLabs `content/site.ts` and `app/products/page.tsx` currently list AI Agent Kit, IncOv and Gig. The registry also drives dynamic routes, sitemap and llms.txt; catalog changes must not accidentally delete old detail routes.
- `Satsunic-SEO-Extension/README.md`: page audits, website crawling, evidence and report exports in Chrome. Use SatsunicSEO as the owner-specified display name; the preview describes this extension. No rank improvement or live provider claim.
- `satsunicmedic/README.md`: interactive anatomy, physiology and pathology education. README states full medical release NOT_READY. Use the confirmed name SatsunicMec without implying clinical validation or diagnostic use.
- `gia-pha/README.md`: mobile-first genealogy, relationships, shared calendars and clan activities. This source read verifies product positioning, not Store availability.
- Existing HunpeoLabs docs verify AI Agent Kit's engineering platform positioning and canonical `/products/ai-agent-kit` route; display name becomes AI-Agent-Kit as requested.
- External reference from initial research: https://www.atlassian.com/software separates featured selection from wider discovery. Repository tokens remain the visual authority. No reference brand copy/images are reused.

The intelligence gate is DEGRADED. CodeGraph query found ProductsPage. One index refresh completed, but the next gate still reported stale indexes and failed CocoIndex health. Use bounded current source reads; do not treat metadata as semantic-query proof. Base commit remains `3d53e1b8201251cb28e02dbd2052ad36b1d67fec`, with extensive pre-existing WIP.

## Design and editorial rules

1. Compact portfolio hero with section anchors.
2. Featured: AI-Agent-Kit and SatsunicSEO, each with a large conceptual visual, purpose, category and action. Selection is a design proposal, not a popularity or readiness ranking.
3. More from the lab: SatsunicMec and BeFam, with compact visual identity, short purpose and expandable descriptions in the prototype.
4. Contact CTA and existing global shell.

Use white, ink and `#173df5`, existing Arial/Helvetica, thin borders and restrained monospace labels. Conceptual illustrations are identified as such. Letter tiles for SatsunicMec/BeFam are placeholders for visual identity, not new approved logos. No mock scores, patients, customers or performance statistics.

Desktop has two featured cards and horizontal secondary rows. Mobile stacks both patterns. Four products do not need search, filters or a carousel. Add categories/search only when actual catalog size and visitor needs justify them. Do not show fake upcoming products to fill space.

## Extensible content contract

Keep a typed registry of stable IDs with editable display names. Separate:

- Identity: id, slug, name, category, summary, accessible visual metadata.
- Editorial: `featured`, `sortOrder`, `publicationState: draft | published | archived`.
- Product maturity: a separate evidence-backed field, optional until verified. Publishing a catalog entry never means the product is production-ready.
- Destination: a discriminated action, either verified external URL, implemented internal detail route, or inline product summary. Never render an unimplemented route or placeholder `#` action.

Draft entries stay out of navigation, metadata, sitemap and llms.txt. Published entries appear once, with selected entries in Featured and all remaining entries in More from the lab. Zero featured products yields a single collection; zero secondary products hides that section. Stable sort order with ID tie-break prevents shuffle. Archived entries are removed from discovery only; URL retention/redirect requires an explicit compatibility decision.

Adding a future product means adding its content, verified destination and visual, then setting its publication/featured/order fields. The page composition must not need another product-specific conditional. A new CMS or admin publishing system is not needed for this iteration; editorial updates use repository content and the existing review/release workflow. No infrastructure or dependency change.

## Prototype interaction boundary

The HTML preview shows all four confirmed products. AI-Agent-Kit retains its known detail link; the three new products expose inline descriptions through native details controls, so the prototype has no fabricated detail URLs. These are preview interactions. Before actual publication, each product needs a reviewed destination and maturity copy; an inline summary remains a valid honest fallback.

## Approved application integration

| File | Intended change |
| --- | --- |
| `content/product-catalog.ts` (new) | Four-product catalog with typed editorial/publication/action model, preserving the existing legacy detail registry. |
| `app/products/page.tsx` | Render sorted published catalog entries in featured and secondary sections; update metadata to four product identities. |
| `app/products/products.module.css` (new) | Scoped styles from the approved preview, global tokens, responsive layout and focus states. |
| `components/product-catalog-visual.tsx` (new) | Accessible static illustrative assets through visual configuration; reusable fallback for future products. |
| `app/sitemap.ts`, `app/llms.txt/route.ts` | Include only actual new public destinations; retain known existing URLs. Avoid drafts and nonexistent detail pages. |
| `tests/unit/product-catalog.test.ts` (new) | Unique IDs/slugs, valid actions, draft exclusion, stable order, empty groups, all four products exactly once. |
| `tests/unit/seo.test.ts` | Catalog metadata and discovery expectations where affected. |
| `tests/e2e/products-catalog.spec.ts` (new) | Correct names, groups/actions, inline details, keyboard, 390/768/1280 widths and reduced motion. |
| `tests/e2e/site.spec.ts` | Update catalog-only selectors if needed; preserve existing legacy product detail and work redirect checks. |
| `docs/product-pages.md` | Catalog versus detail registry ownership, adding/publishing products, legacy URL policy. |

A full new detail-page design for SatsunicSEO, SatsunicMec or BeFam would expand beyond this catalog plan and needs a concrete delta design. Do not silently delete IncOv/Gig or rewrite related repositories.

## Risk, validation and rollback

Main risk is misleading launch status or broken destinations as the catalog diverges from the old detail registry. Validate publication/actions and keep catalog identity separate from release readiness. New scoped CSS avoids overwriting unrelated WIP. No authentication, database, clinical data, billing, deployment or third-party writes.

After approval: lint, typecheck, unit tests, build, targeted catalog E2E plus old product/detail/work-route regressions. Check metadata, sitemap, llms.txt, keyboard, reduced motion, mobile overflow and no product omissions/duplicates. Rollback only the bounded catalog patch; preserve pre-existing edits. No migration.

## Approval

User corrections confirmed the four identities and SatsunicMec mapping. The owner subsequently approved this plan with “approved”. Approval evidence: `.ai/proposals/HUNPEOLABS-PRODUCT-CATALOG-002-approval.md`. Implementation follows `.ai/workflows/plan-existing-system-change.md`: “Do not implement until explicit approval evidence exists.”
