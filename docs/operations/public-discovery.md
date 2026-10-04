# Public discovery and current products

`content/product-catalog.ts` is the editorial source for published products. Published records populate Products, Services examples, canonical product overview pages, sitemap, llms.txt and collection schema. Publication is not a claim of release availability. Only verified channels render working download links; pending channels never receive invented URLs. Ask's bounded topic contract recognizes the four current products; adding a new product also requires updating its topic contract and localized knowledge tests.

Retired routes return 404 under the separately approved route cleanup. Work, Gig, IncOv and retired resource pages must not be restored to current discovery. Public blog posts remain CMS-owned; discovery uses `listDiscoveryPosts`, never drafts or previews. Static pages have no fabricated last-modified date. Development/preview deployments remain non-indexable. Production robots allows public crawling; authentication remains the access boundary for private surfaces.

## Verification and release

Run typecheck, lint, catalog/SEO/Ask/schema tests, production build, then crawl every sitemap URL and inspect canonical, HTTP status, robots metadata, readable HTML and JSON-LD. Check desktop/mobile and Firefox/WebKit, including unknown/retired routes. Deploy only with explicit release authority; verify the exact production candidate after rollout.

In the verified Search Console Domain property, submit `https://hunpeolabs.com/sitemap.xml` (not the Services HTML page). Read back its processing status and discovered URLs. Inspect representative product and blog URLs after rollout. A submission toast or HTTP 200 does not prove Google has fetched, crawled or indexed a URL. Do not claim ranking or AI citations from local tests. On 2026-10-04 submission succeeded but GSC reported that the sitemap could not be read; independent HTTP/XML checks passed. Fetch acceptance remains unresolved until actual GSC readback changes.

Google AI search uses ordinary SEO fundamentals and does not require a special schema or llms.txt. This file is optional discovery guidance, not an indexing control. Structured data must describe visible, confirmed facts; do not add fictitious prices, reviews, availability or medical claims.

Official references:
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/search/docs/crawling-indexing/block-indexing
- https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
