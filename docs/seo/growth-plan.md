# HunpeoLabs search growth plan

Status: approved work scope; implementation local, editorial drafts not published. Snapshot2026-10-04. No paid SEO service, model activation or ranking guarantee.

## Observed Search Console baseline

Verified Domain property hunpeolabs.com, Web Search, selected3months. Chart displays Aug20–Sep29 2026; report last update6hours ago. Total2clicks,68impressions,2.9%CTR,averageposition3.6. Visible queries: incov0clicks/21impressions; peolabs0/9. These rows do not account for every impression; do not reconstruct hidden queries or claim service rankings from the aggregate. Per-page impressions are not additive to property totals.

Visible pages: home1click/42impressions; AI-Agent-Kit1/1; Services0/32; About0/31; retired Resources0/24; Products0/23; retired IncOv0/21; retired Work0/16; Privacy0/11; Contact0/10. Top10of16rows inspected. US2clicks/32impressions; Vietnam0/4. Small sample is insufficient to infer demand or select a permanent target market. Keep the current English site consistent; Vietnamese demand needs a separate localization decision, not mixed-language landing pages or invented locations.

GSC field Core Web Vitals lastupdatedOct2: both mobile/desktop insufficient usage data in last90days. This is unavailable evidence, not a passing score. Sitemap submission accepted earlier but readback Couldn't fetch remains unresolved. Catalog SEO task owns route/canonical/sitemap changes; legacy impressions do not justify restoring retired pages.

## Query-to-page map

These are intent hypotheses derived from offered scope, not measured search volumes, difficulty scores or top10 forecasts. Give one canonical page ownership of each service intent. Initial content priority AI agents: matches existing first-hand articles and confirmed public product; Web Development is second. GSC alone has not established this commercial prioritization.

| Canonical page | English intent candidates | Vietnamese research candidates | Buyer question | Evidence |
|---|---|---|---|---|
| /services/web-development | website development services; customer portal development | dịch vụ thiết kế website; phát triển ứng dụng web | What is included and what affects scope? | SatsunicSEO contextual website tool, not a client result |
| /services/mobile-app-development | mobile app development services; iOS Android app development | dịch vụ phát triển app; làm ứng dụng iOS Android | Which platforms and what is handed over? | BeFam own product at stated stage |
| /services/ai-agent-development | AI agent development services; AI workflow automation | phát triển AI agent; tự động hóa quy trình bằng AI | What actions can the agent take safely? | AI-Agent-Kit and existing engineering articles |
| /services/ai-product-engineering | AI feature development; AI product engineering services | tích hợp AI vào sản phẩm; phát triển tính năng AI | How do we evaluate user-facing behavior? | AI-Agent-Kit is engineering context, not shipped client-feature proof |
| /services/platform-modernization | application modernization services; legacy platform assessment | hiện đại hóa hệ thống; nâng cấp phần mềm cũ | Can assessment precede implementation? | AI-Agent-Kit review workflow context, not migration performance proof |
| /services/architecture-governance | software architecture review; engineering governance consulting | tư vấn kiến trúc phần mềm; đánh giá kiến trúc hệ thống | What decisions and documents do we receive? | AI-Agent-Kit approvals/evidence context |

No separate page per keyword variation. Improve titles/snippets based on query intent and actual content, not repeated exact-match phrases. Existing unique service metadata retained.

## Delivered public content improvements

Every service gets its explicit name in a descriptive heading, two practical buyer questions, scope-dependent cost/timing language, and crawlable links to current published products using authoritative catalog names. Native details/summary works without client JS. Product evidence is clearly owned-product context with maturity boundaries, not customer case-study outcomes. Existing deliverables/process/CTA retained. No FAQ rich-result claims or new schema.

## Editorial delivery

Drafts in docs/seo/drafts:
- ai-agent-kit-product-case-study.md: factual owned-product case study, engineering rationale, public package, no invented customer metrics.
- choosing-ai-agent-or-ai-feature.md: buyer guide linking agent/product services.
- preparing-a-software-project-brief.md: practical discovery checklist linking all applicable services.

Drafts are not added to published collection.json, sitemap or CMS. Publish through normal CMS author/reviewer/publisher workflow after editorial review. Author attribution must be confirmed; drafts use neutral studio voice and do not impersonate Hung Pham. When live, link guides to relevant services and from related articles; retain readable content, canonical, actual update dates and article metadata. No medical effectiveness or unverified availability claims.

## Measurement workflow

After an authorized release, establish a new baseline date. Compare equal28daywindows in GSC by country/device/query/page, accounting for lag and small samples. Track service impressions/clicks/CTR and query positions individually, published article index status, referral pages, and actual qualified contact submissions. Existing analytics must be checked before adding conversion instrumentation; no raw briefs or PII in analytics.

Prioritize pages with relevant impressions and weak CTR; inspect title/snippet fit before changing content. For weak impressions, inspect index eligibility, internal links and topic usefulness. Contact quality matters more than a property-wide position average. Track Google AI performance separately where exposed; manual ChatGPT/Gemini citations are samples, not guaranteed coverage. No recurring automation created.

## First delivery sequence

Resolve sitemap fetch/readback after current technical release. Improve one service with a relevant case study; publish the two reviewed guides, link them in context, measure before expanding. Maintain consistent name, founder and official links across approved public profiles; prepare profile copy locally, never post without explicit destination authorization. Avoid bought links, automatic mass articles and fake reviews.

Official guidance:
https://developers.google.com/search/docs/crawling-indexing/links-crawlable
https://developers.google.com/search/docs/fundamentals/creating-helpful-content
https://developers.google.com/search/docs/fundamentals/ai-optimization-guide

## Production performance observation

PageSpeed Insights mobile report Oct4 2026 09:32CDT, https://pagespeed.web.dev/analysis/https-hunpeolabs-com/po4bgs16b2 : Performance99,Accessibility100,BestPractices96,SEO100. FCP1.2s,LCP2.0s,TBT20ms,CLS0,SpeedIndex1.4s. One emulated MotoGPower/slow4G/Lighthouse13.5 run, not field CWV or validation of new local edits. No Data in real-user section.

Opportunities: renderblocking estimated720ms; unusedCSS36KiB; unusedJS172KiB; legacyJS14KiB. Estimates are not additive or measured savings. No broad framework/CSS refactor justified by one otherwise healthy run. Console findings include anonymous blog/session401 and Google OneTap/FedCM network/token errors. Authentication remains enforced; do not change401 to successful auth or weaken CSP to raise a score. Review OneTap loading only in a separately measured auth/performance task if repeatable outside headless measurement.

Agentic2/3 flags llms no Markdown links; reported to concurrent SEO catalog owner who owns that file. Optional Markdown discovery improvement does not govern crawler permissions/training or prove GoogleAI inclusion. GoogleAI and other engines need separate observation; no AI citations verified.

## Google AI Search baseline

Read-only GSC GenerativeAIfeatures(Beta)3months view, same Aug20–Sep29 chart: property7impressions. Visible pages home7,Products2,About1,Services1,retiredWork1. Page impressions are not additive to property totals. This is provider-reported GoogleAI visibility, not proof of exact response wording, citation prominence, ChatGPT/Gemini coverage or a qualified lead. The beta report exposed no query or click metric in this observed view. Preserve this baseline before release; don't infer hidden metrics.
