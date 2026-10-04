# Public product navigation and Services examples

Status: APPROVED. Human user replied "apporved" on2026-10-04 after reviewing this plan. Request: fix Explore our work destination and align Services projects with the public Products page; agent chooses coherent direction.

## Verified source and intelligence
Repository Intelligence Gate: DEGRADED. CodeGraph stale/healthy; CocoIndex stale/failed health. Bounded source/Git reads used. Next.js16.3.8/React19/TypeScript; pnpm scripts available. Original beaus-dev checkout contains unrelated approved Ask WIP; preserve it. No changes made to application code.

Home Explore our work targets /work; Services hero targets #work. Services owns a duplicated project array AI Agent Kit/Gig/IncOv. Public Products renders content/product-catalog.ts through getCatalogGroups/getPublishedCatalog: AI-Agent-Kit, SatsunicSEO, SatsunicMec, BeFam. Gig and IncOv are not published entries in this catalog. Editorial publication does not imply released/available product; pending channels must stay pending.

## Decision and scope
Use /products for the Explore our work intent because it represents the public portfolio. Label it Explore our products so destination is clear. Services retains its existing service discovery cards; examples represent the same published product collection, not client case studies.

- app/page.tsx: secondary hero CTA /products, label Explore our products.
- app/about/page.tsx and app/resources/blog/page.tsx: only matching Explore our work CTAs use the same label/destination; preserve other Work navigation and work routes.
- app/services/page.tsx: secondary hero CTA /products, label Explore our products; replace hardcoded project examples with getPublishedCatalog data, reuse ProductCatalogVisual, names/category/summary/badge from canonical catalog. Section heading Products from our lab; describe as own products at their published stage. All4 public entries displayed, no Gig/IncOv. Actions internal overview where implemented, otherwise /products#id via getCatalogDestination; pending availability never advertised as live.
- Scoped styles only if reused visuals require container sizing; preserve current white/blue design and service layout.
- Existing relevant navigation/catalog browser checks may be updated or extended to assert canonical names/destinations and no hidden/draft entries; no dependencies or API changes.

Preserve catalog content, Products layout, service descriptions, Work routes, SEO/auth/CMS/Ask behavior. No invented product maturity, customer results, prices or new URLs. Do not deploy/push as part of this new scope until requested; validate locally first.

## Verification and risk
Low risk public navigation/content consistency. Inspect actual Next Link guide before code edits; typecheck and lint touched files, existing catalog unit tests, focused desktop/mobile Services and CTA navigation. Review final diff and mandatory final-implementation-review; report intelligence limitation, remaining gaps, tokens/cost unavailable and memory candidatesNone. Rollback by reverting scoped navigation/rendering diff only. Optional product visual style consumers checked before any shared changes.
