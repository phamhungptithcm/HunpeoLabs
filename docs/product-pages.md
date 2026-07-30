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
