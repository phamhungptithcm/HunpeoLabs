# HUNPEOLABS-SERVICES-001 v1

Status: AWAITING HUMAN APPROVAL. Research and copy proposal complete; application implementation not started.

## Goal and acceptance

Rewrite Services to market what Hunpeo Labs will build and complete for customers. Provide concrete offers, deliverables, completion criteria, and relevant CTAs while keeping claims supportable.

Reviewable copy: `docs/services-copy-proposal.md`.

Approval must cover the copy, the proposed execution offers (especially mobile, AI product, and modernization implementation), and the file scope below. No publishing or deployment authorization is requested.

## Repository intelligence brief

- Inspected current dirty worktree at commit `3d53e1b8201251cb28e02dbd2052ad36b1d67fec`; unrelated changes exist across content, application, tooling, and governance. Preserve them.
- Initial gate: CodeGraph current/healthy; CocoIndex stale/unhealthy. One incremental refresh completed; rerun gate READY for both tools.
- CodeGraph `query services` identified the registry, catalog, detail routes, and home preview. `impact getService` identified detail rendering, metadata, and content tests.
- CocoIndex query `services deliverables marketing customer outcomes web mobile AI modernization` located mobile and web outcomes/deliverables and release documentation. Critical facts checked against current source.
- Flow: `content/site.ts` → catalog/detail route → shared `DetailPage`; summaries also feed metadata, Service JSON-LD, and `/llms.txt`. Homepage preview is independently authored. Slugs feed static params, sitemap, and navigation.
- No persistence, API contract, auth, or infrastructure changes required. CTA remains a link to the existing contact page; successful message delivery is not asserted.
- Specs: current registry, marketing-integrity rules, marketing-growth profile. No supplied work item or separate service contract.

## Findings and proposed changes

Current copy makes buyers interpret internal terminology. Several services describe plans rather than delivered software despite the delivery-focused request. Catalog has no dedicated closing project CTA. Shared detail CTA is generic and appears on other page families.

Risk: low technical risk, moderate commercial-claim risk. Proposed future offers are not customer evidence. Owner must endorse ability and intent to fulfill the defined scopes.

## File-by-file implementation plan

1. `content/site.ts`: update only the six service entries with approved summaries, situations, outcomes, deliverables, process, and scope copy. Preserve slugs, names, types, product/work data, and unrelated WIP.
2. `app/services/page.tsx`: update metadata, hero, group descriptions, and service fit section; add completion/handover section, project links with current maturity labels, and contact CTA using existing visual patterns.
3. `app/services/[slug]/page.tsx`: replace internal labels with buyer-facing labels; pass service-specific CTA copy. Preserve unknown-slug handling, static params, metadata, and structured data.
4. `components/detail-page.tsx`: add optional CTA title/label props with existing defaults so other callers retain their behavior. No global styling or component redesign.
5. `tests/e2e/site.spec.ts`: update obsolete heading assertions and validate service navigation, handover copy, and CTA destination. Preserve existing accessibility/navigation assertions.
6. `tests/unit/content.test.ts`: update wording-specific assertions only where approved wording changes; retain category, uniqueness, service distinction, and lookup checks.

No homepage change proposed in this first scope: its current high-level service preview remains compatible. No dependencies, data migrations, runtime config, tracking, hosting, pricing, or production changes.

## Compatibility and validation

- Preserve all six service URLs, names, grouping, internal links, and notFound behavior.
- Inspect metadata, Service JSON-LD, and `/llms.txt` for matching approved summaries; these consumers update through the registry without code edits.
- Check shared DetailPage callers to ensure defaults preserve their CTAs.
- Run lint, typecheck, unit tests, build, and relevant Services/navigation E2E on desktop and mobile after implementation.
- Inspect seven service routes for heading hierarchy, keyboard links, responsive overflow, and content fit. Validate unknown service route.
- Audit public claims and internal-project maturity labels. No invented customer results or guarantee of rankings, revenue, store approval, or zero downtime.
- Run mandatory final implementation review after the approved implementation; fix in-scope findings and rerun affected checks.
- Rollback by reverting only task-specific hunks; never reset shared dirty files wholesale.

## Alternatives and trade-offs

- Copy-only edits within existing fields minimize code but leave generic shared CTA and weak overview completion guidance.
- Recommended: approved copy plus small catalog sections and optional CTA props. Retain current styling and illustrations.
- Later, separately scoped: real delivery case studies, additional visual examples, bilingual pages, pricing, and measured conversion experiments. These need evidence or business decisions not available here.

## Claim ledger

| Claim | Evidence/status | Decision |
| --- | --- | --- |
| Six named service categories | Verified in current registry | Keep names and URLs |
| Existing project descriptions and maturity | Verified as current site descriptions; not independent product audit | Link canonical product pages with accurate labels |
| Executed mobile/AI/migration deliverables | Proposed future offers, not verified customer history | Owner approval required before website use |
| Customer growth, speed, savings, rankings | Unknown / NOT_MEASURED | Omit |
| Support, pricing, timelines, ownership | Unknown | Agree per engagement; do not invent |

## Current handoff status

- Research: complete within bounded source and two reference websites.
- Written deliverable: overview, six service descriptions, handover, proof framing, CTAs, and metadata draft complete.
- Draft review cycle 1: identified risk that delivery language could imply established customer outcomes; marked future offers explicitly and excluded client proof claims.
- Draft review cycle 2: reread for service differentiation, scope, handover, and proof accuracy; no further issue found within this editorial review. This is not a final implementation review or production approval.
- Application implementation, browser checks, build/tests, mandatory final implementation review: NOT_RUN; pending approved implementation.
- Production readiness: NOT_READY for this proposed change; nothing published.
- Memory candidates: None. Token usage and actual cost: Unavailable.
