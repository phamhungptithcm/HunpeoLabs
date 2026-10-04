# Route cleanup based on current UI reachability

Plan ID/version:HUNPEOLABS-ROUTE-CLEANUP-003 v1
Status:APPROVED2026-10-04 human reply "approved sitemap và llms.txt đã sửa ở session khác".
Owner intent2026-10-04:remove Work route and scan/remove public routes no longer linked from UI. Supersedes earlier preference to retain Work compatibility pages. No implementation in this audit turn.

## Evidence
Repository Intelligence DEGRADED:CodeGraph stale/healthy,CocoIndex stale/unhealthy. Source/current local route graph verifies25public routes;16hydrated route checks from prior audit; current CTA updates approved underPUBLIC-PRODUCTS-002 remain WIP. Reachability traversal starts from homepage/shared primary nav, excludes self/fragment links as meaningful inbound use. Ask conditional links and login/server redirects separately read; backend,SEO,RSS,OG,metadata endpoints not considered orphan public pages merely because absent from menu. Source/content/SEO/test references traced.

Current UI-unreachable public paths:/work,/products/gig,/products/incov,/resources,/resources/open-source,/resources/research,/resources/talks,/company/about. Work detail aliases3redirecttooldproduct profiles. Actual Ask portfolio sourceLink still routes toWork/Gig/IncOv and must change before removal. Blog-account absent from static anchors but login-document.ts explicitly supports it; admin/blog/login used by auth.ts redirect; keep both.

## Removal decision
Delete public page route implementations:
- app/work/page.tsx and app/work/[slug]/page.tsx (known Work aliases included); /work and /work/* no longer render/redirect.
- app/resources/page.tsx,app/resources/open-source/page.tsx,app/resources/research/page.tsx,app/resources/talks/page.tsx; preserve nested resources/blog/** completely.
- app/company/about/page.tsx (unused alias); preserve About /about and actively linked /company/principles.
- /products/gig and /products/incov removed from dynamic public product allowlist/generateStaticParams/getProduct route lookup; retain /products/ai-agent-kit used by actual catalog. Do not delete shared legacy content/assets merely because routes retired; check consumers first.
Retired paths return actual404 (dynamicParams=false as appropriate) and no retired entry in sitemap,llms,currentUI or Ask. No blanket prefix redirects to unrelated Products. No removal of Blog-account/admin/API/auth/media/CMS/RSS/OG/service-detail/account endpoints.

## File-by-file implementation
1.content/ask-knowledge.ts:canonical public catalog as portfolio/product source,4publishedentries; names/summary/publication state from getPublishedCatalog, no invented availability/commercialfacts.
2.lib/ask/contracts.ts,retrieval.ts:published4product topics/sourceLinks/portfolio /products; old Work phrasing can classify portfolio semantically but emitted links always validcatalog; unsupported IncOv/Gig should not synthesize removed destinations. KnownFAQ local path maintained, strictbounds/AppCheck/paid-off unchanged. lib/ask/provider.ts only if topic-contract switch forces scoped prompt mapping; no provider enablement.
3.app/products/[slug]/page.tsx:catalog-backed route admission for actual implemented internal actions; unknown/retired routes404; source oldproducts for preserved AI detail allowed behind canonical filter.
4.app/sitemap.ts,app/llms.txt/route.ts:remove orphan routes/oldengineering discovery; canonicalpublishedcatalog and existingblog/service routes only. No deletion ofpubliccontentdatabases.
5.Route file deletions above. Delete ResourcePlaceholder component only if proven no remaining consumers; do not clean unusedServicesChrome/visualassets as unrelated refactor.
6.tests/e2e/products-catalog.spec.ts,site.spec.ts,Askunit/browsertests,discoveryunit tests when present:replace earlier legacy200 acceptance with approved404, canonicalproduct names/source links/FAQ answers, currentheader/Aboutprinciples/services/Blog unaffected. Invalid-route realstatus asserted, no assertion weakening.
7.Preserve original dirtyWIP and reconcile Ask released compatibility fixes selectively if necessary for truthful build/CSP validation; source base main3de98e9 has released fixes missing locally. Any wider reconciliation will be explicit separate scope, not reset/pull-over-WIP.

## Checks and impact
Mediumrisk:publicURLs/discoverycontract removal. Approval intentionally permits retired publicURLs404; external bookmarked/CMS article links may need later editorial repair. StoredliveCMSarticle links not audited; no authenticatedcontentwrites or data deletions. Typecheck/lint/catalog andAskunits; desktop/mobile canonicalnavigation/FAQ/retiredroutes status and sitemap/llms; actualproductionbuild route enumeration; final fresh mandatory review and evidence report. No deployment/push until authorized for this newchange. Rollback scopeddeleted routes/allowlist/discoverydiff, preserveexistingCMSauthstate.

## Keep
Home,Services andall6details,Products andAI-Agent-Kitdetail,About,Principles,Careers,Contact,Privacy,Blog and dynamicarticles,readerlogin andStudio/Admin/auth/API/infrastructureendpoints. These have explicitUI or runtime consumers. Pendingcatalog externalchannels remain disabled. No global rule deleting every route with zero staticlinkcount.

Approval delta: sitemap and llms.txt are read-only/session-owned. Current checkout still shows old references, so report integration gap rather than overwrite. User says already fixed in another session; do not assume those edits are present here.
