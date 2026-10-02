# Compact product distribution actions

Status: APPROVED by owner on 2026-10-02; application delta implemented and validated locally. Existing catalog approval remains valid for its original single-action model. This proposal adds multiple distribution channels without adding detail pages, infrastructure or dependencies.

## Owner requirements

Website/store destinations instead of generic repository links; npm primary for AI-Agent-Kit; GitHub only for open-source products. Missing URLs may stay pending now, with an explicit release checklist. Controls must be compact, restrained and consistent with the existing catalog.

## Evidence and design

Repository intelligence remains DEGRADED: stale CodeGraph and failed/stale CocoIndex; current `content/product-catalog.ts`, `app/products/page.tsx`, scoped CSS, unit/browser tests and discovery route inspected directly. Current action is a single internal/external/summary union. ProductAction renders a link or native details. No multi-channel renderer exists.

`actions-preview.html` is a standalone design artifact, not deployed application behavior. Website is a lightweight globe/text link; npm and Chrome have one compact primary action. Official black mobile badges use original artwork and approximately 40px visible height, below product identity. Secondary rows place description under identity and align actions right; mobile actions follow the description. No new brand colours or oversized panels. Apple asset remains at its recommended 40px minimum. Google artwork includes transparent padding; the bitmap is larger so visible badge heights match.

Unknown links are non-interactive samples only in the clearly labelled preview. Application should retain existing description fallback until verified links exist. No fabricated availability, storefront IDs or placeholder URLs. Release decisions are tracked in `release-links-checklist.md` and referenced by `docs/operations/production-readiness.md`.

## Proposed bounded implementation

| File / function | Change |
| --- | --- |
| `content/product-catalog.ts`: CatalogProduct / getPublishedCatalog | Add optional ordered distribution channels with typed kind, verified HTTPS href, or explicitly pending state. Allow website, npm, App Store, Google Play and Chrome Store. Validate expected store hosts, no credentials, no duplicate channel kinds. Keep the current action as fallback. Repository destinations require explicit open-source evidence; do not add GitHub by default. |
| `app/products/page.tsx`: ProductAction | Render only configured verified channels; use native anchors for external links, no prefetch. Preserve existing inline descriptions when no destinations are ready. AI-Agent-Kit primary npm plus its existing internal overview. |
| `app/products/products.module.css` | Apply compact action row, shared icon sizing, subtle focus/hover, responsive wrapping and compact secondary row from preview. |
| `public/images/product-channels/` | Copy reviewed official unmodified badge assets from the design artifact; local assets avoid CSP/network changes. |
| `app/llms.txt/route.ts`, getCatalogDestination | Verify destination handling: absolute external URLs must not receive the site origin prefix. Prefer retaining existing internal catalog discovery anchors while channel links live in the catalog UI. |
| `tests/unit/product-catalog.test.ts` | Validate missing/pending channels, invalid schemes/hosts/credentials, duplicate kinds, open-source restriction and discovery compatibility. |
| `tests/e2e/products-catalog.spec.ts` | Assert npm URL, fallback descriptions, absence of enabled pending-store links, accessible names, 320/390/768/1280 layouts and legacy route retention. Preview tests for both badges do not prove live listing availability. |
| `docs/product-pages.md` and release checklist | Explain channel configuration, pending state and release verification. |

## Impact and trade-offs

Low security/data risk: static content/UI only; no auth, persistence, financial or provider writes. Main risk is falsely implying apps are released, or rendering broken external links. Hide pending channels in the actual application and require manual release resolution. A manual checklist is deliberately used instead of changing CI or deployment contracts. Existing URLs, header/footer and concurrent work remain untouched. No catalogue-wide search or CMS.

Validate focused lint, TypeScript/build where repository state allows, unit/browser regression, external anchor safety and mobile badge wrapping. Record unrelated workspace failures separately. Rollback is scoped to channel content/rendering/assets; no migration. No deployment authorized.

## Design validation

- Browser verified four products, both local badge assets loaded, npm and Chrome hrefs match repository source, no GitHub distribution link.
- Browser widths 320, 390, 768 and 1280: document scroll width equals viewport width.
- Desktop and mobile screenshots: `actions-desktop.png`, `actions-mobile.png`.
- Store availability and final website URLs: NOT VERIFIED / pending owner content.
- Review cycle 1: secondary rows were too tall for the compact requirement; moved description under identity and aligned actions right.
- Review cycle 2: current desktop/mobile design checked, no further findings within preview scope. This is a design review, not an application implementation gate.
- Application integration: implemented; 45 unit checks and 18 browser checks passed, scoped lint passed and snapshot production build passed. Production: NOT_READY while required link decisions remain pending. Token usage and actual cost: unavailable. Memory candidates: None.

Application delta approval follows `.ai/workflows/plan-existing-system-change.md`: “Do not implement until explicit approval evidence exists.”
