# Blog publication and Google discovery

Ownership: this companion runbook and `tests/unit/blog-indexing.test.ts` are maintained by the indexing follow-up task. The SEO catalog task owns sitemap, product routes, metadata, schema and `public-discovery.md`. Coordinate before editing shared source.

## Publication flow

The public repository reads `blogPublished`; drafts are not discovery inputs. `listDiscoveryPosts()` follows every published-page cursor. The dynamic sitemap reads that list per request. Publishing makes the URL eligible for the next sitemap response; withdrawal removes it from that discovery list. This does not send Google an indexing notification. The mocked regression checks sitemap behavior, not authenticated CMS publication or live Google acceptance.

After publication, verify the actual production article returns 200, renders readable content, has its own canonical, permits indexing and is linked from the Blog listing. Verify the URL appears in the live sitemap. Article metadata already supplies publication/modification dates. Sitemap lastmod should use a real content update date; never rewrite every static page's timestamp on each build.

## Search Console fetch failure

Use the verified `hunpeolabs.com` property. Submit `/sitemap.xml`, not an HTML service page. Submission success is different from processing success. On 2026-10-04 the submission was acknowledged, but readback said Couldn't fetch. Ordinary HTTP/XML checks passed; this does not prove real Googlebot access or identify the cause.

1. Read the sitemap detail and record processing date, exact error and discovered URL count.
2. Run URL Inspection's live test on a published article and a canonical product URL. Record crawl permission, fetch result and canonical separately from existing index status.
3. If the live fetch fails, investigate DNS/TLS, redirect chains, server errors and edge access controls using actual request/error evidence. Do not weaken authentication or trust a spoofed Googlebot user agent as verification.
4. After a verified correction or successful deployment, recheck the public XML and GSC processing. Avoid repeated unchanged submissions. Request indexing for selected important URLs; do not promise a deadline.
5. Track excluded URLs individually. Redirects, private noindex pages and non-HTML assets are not automatically missing content.

No DNS permissions, deployment, CMS publication or indexing requests are performed by these tests. Google's Indexing API is not for ordinary blog/product/service pages.

## Ranking and measurement

Choose the target country, language and service intent before writing landing pages. Link practical first-hand articles to the relevant service and confirmed product evidence. Use only approved prices, availability and outcomes. Measure GSC queries, impressions, clicks, CTR and position alongside actual contact conversions. Sitemap, structured data and llms.txt do not guarantee rankings or AI citations. No paid inference or indexing service is required by this workflow.

References:
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
- https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors
- https://developers.google.com/search/apis/indexing-api/v3/quickstart
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content
