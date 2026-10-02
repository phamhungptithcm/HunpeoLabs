# Product pages

This document records the approved product-page design, public route ownership,
media provenance, and claim boundaries for the Hunpeo Labs website.

## Canonical routes

| Product | Canonical route | Consolidated work route |
| --- | --- | --- |
| AI Agent Kit | `/products/ai-agent-kit` | `/work/ai-agent-kit` redirects |
| IncOv | `/products/incov` | `/work/incov` redirects |
| Gig | `/products/gig` | `/work/gig` redirects |

Each product owns a distinct page, narrative, visual system, workflow, video,
boundary statement, FAQ, metadata, and structured-data entry. The product index
links to these canonical routes.

## Approved design references

The review artifacts are stored as immutable PNG references:

| Product | File | SHA-256 |
| --- | --- | --- |
| AI Agent Kit | `docs/design/product-pages/ai-agent-kit-approved.png` | `fe181550313bf33c75d8f7153cae09c0cea7d5e14629f99357355320069e059d` |
| IncOv | `docs/design/product-pages/incov-approved.png` | `1e192a566a475f3ab2d4b04a42823f77179a68029c24f69e081bcf0c39291068` |
| Gig | `docs/design/product-pages/gig-approved.png` | `9a2b5a6b6556cd95485672b4e31028a4c982ca0d907812dda02c2bbf7053b816` |

The implementation follows the approved editorial direction while using native
HTML, responsive layout, accessible controls, and real product footage.

## Media provenance

No synthetic product demo was generated. Existing source-backed project media
was selected so the public pages show the actual tools and flows.

| Product | Website asset | Verified source |
| --- | --- | --- |
| AI Agent Kit | `public/media/products/ai-agent-kit/bootstrap-demo.mp4` | `ai-agent-kit/docs/assets/bootstrap-demo.gif` |
| IncOv | `public/media/products/incov/architecture-walkthrough.mp4` | `IncOv/docs/media/incov-architecture-walkthrough.mp4` |
| Gig | `public/media/products/gig/release-showcase.mp4` | `gig/docs/assets/gig-showcase.mp4` |

Posters are derived from the same source footage. Videos use native controls,
are muted and inline-capable, and load metadata only until the visitor chooses
to play. Each page first shows its approved product-specific visual cover; the
play action transitions to the real footage without navigating away. The AI
Agent Kit GIF was converted to MP4 for smaller transfer size and consistent
browser playback.

Motion is CSS-based and limited to hierarchy, flow, and state feedback: staged
hero entry, flow-line pulse, active-node emphasis, section reveal, and
cover-to-video transition. The global `prefers-reduced-motion` policy reduces
these animations to effectively immediate state changes.

## Public claim boundaries

- AI Agent Kit is described as an open-source engineering platform. The page
  does not promise a production outcome.
- IncOv is explicitly under validation. The page explains the review workflow
  and does not claim measured customer or production results.
- Gig is described as an open-source engineering project. Release-trace
  examples are product behavior, not proof that an unverified deployment is
  healthy.
- No customer names, adoption metrics, rankings, testimonials, or performance
  improvements are published without reviewed evidence.

## Content ownership

Product-page copy and data live in `content/product-pages.ts`. Shared product
index and work-route mappings live in `content/site.ts`. The page renderer is
`components/product-detail-page.tsx`; product-specific diagrams are kept in
`components/product-detail-visuals.tsx`.

## Product catalog (approved portfolio revision)

`/products` now uses `content/product-catalog.ts`, separately from the legacy
product detail registry. The current published catalog is AI-Agent-Kit,
SatsunicSEO, SatsunicMec and BeFam. Featured selection is editorial, not a
release-readiness claim. The owner confirmed SatsunicMec as the public name of
the satsunicmedic/HumanScope educational product.

To add a product, add a stable ID, name, category, summary, sort order,
publication state, action and optional visual configuration. Use `draft` until
content is reviewed. Set `featured` independently of publication or maturity.
Generic workflow, audit and letter visuals are available; missing visuals use
a name initial. No new route component is needed for an inline summary.

Actions are typed: existing internal product route, verified HTTPS external
URL, or inline summary. Validate any new external destination before publishing.
Internal detail destinations must exist in the legacy detail registry. Draft
and archived entries are excluded; duplicate IDs, incomplete published entries
and invalid destinations fail validation. Ordering is stable. Empty groups are
omitted. Adding a full new detail page is a separate scoped task.

SatsunicSEO exposes its source-confirmed Chrome listing. Pending website/store channels remain visible as disabled controls without helper text; no fabricated
`/products/<slug>` routes or active placeholder links are published. `llms.txt`
links them to their catalog anchors. The sitemap retains real existing detail
URLs and has no fragment or nonexistent product URL entries. IncOv/Gig details
and existing work redirects remain available even though they are not in the
new catalog. Displaying an entry does not certify app/provider/medical release
readiness.

Catalog styles are isolated in `app/products/products.module.css`. It reuses
the global site shell and has static illustrative visuals, native disclosure
controls, and no extra client JavaScript or dependencies. Visuals are labeled
as illustrations, not live screenshots. See
`docs/design/product-catalog-v2/design-and-impact-plan.md` for approval scope.

## Product distribution channels

`content/product-catalog.ts` keeps `action` as the internal overview or fallback for products with no configured channels and optional `channels` for distribution. Use `{ kind: "website" | "npm" | "app-store" | "google-play" | "chrome-store", state: "verified", href }` only after source/owner confirmation. Missing URLs are `{ kind, state: "pending" }`: these render disabled website/store controls with a subdued disabled appearance and no href. Complete the [release link checklist](design/product-catalog-v2/release-links-checklist.md) before publishing.

AI-Agent-Kit uses npm as primary with its existing overview secondary. Known store destinations are shown as compact links; App Store/Google Play use official local artwork. Apple is first when both stores are present. External links use native anchors without Next.js prefetch. Catalog discovery keeps its original internal destination/anchor; legacy profiles remain available.

Repository hosts require `openSourceEvidence` describing verification that the repository is public and open source. No repository link is a fallback for a missing store or website. Verified URL is a content state, not proof of current release availability: live/region/publisher verification remains a release task. Add future channels by content, not by product-specific page conditions.
