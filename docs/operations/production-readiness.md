# Hunpeo Labs Website Production Readiness

This document describes the source-backed launch contract. It does not authorize or perform a production deployment.

## Required launch configuration

Run this before building a production release:

```bash
NEXT_PUBLIC_SITE_URL=https://<verified-production-domain> pnpm validate:production-env
```

`NEXT_PUBLIC_SITE_URL` must be an explicit public HTTPS origin. Without it, page metadata and `robots.txt` fail closed to non-indexable behavior.

If contact delivery is required for launch, set `REQUIRE_CONTACT_DELIVERY=true` and provide all four values through the deployment secret/configuration store:

- `CONTACT_WEBHOOK_URL`: reviewed public HTTPS webhook with no credentials or query string
- `CONTACT_WEBHOOK_TOKEN`: secret bearer token, never exposed to the browser
- `CONTACT_PROVIDER_NAME`: reviewed public provider/channel name used by the Privacy page
- `CONTACT_RETENTION_NOTICE`: reviewed public retention statement

Partial contact configuration is invalid. Missing configuration leaves the form visibly disabled and `/api/contact` returns `503 DELIVERY_UNAVAILABLE`.

## Contact delivery contract

`POST /api/contact` accepts JSON with:

- `name`: 2–120 characters
- `email`: 5–254 characters
- `company`: optional, 2–160 characters
- `projectType`: one supported form option
- `brief`: 20–5,000 characters
- `website`: hidden honeypot; must remain empty

The route validates content type and same-origin browser requests, applies five attempts per ten minutes per process-local client key, and forwards only allowlisted fields. Downstream delivery uses an eight-second timeout, rejects redirects, and returns success only after a `2xx` response.

The current limiter is intentionally process-local. A horizontally scaled deployment must add a trusted shared edge or platform rate limiter before treating the limit as globally enforced. The deployment owner must also verify that forwarded client-address headers cannot be supplied directly by public clients.

No contact field or webhook token may be logged.

## Security and privacy

The application sends baseline CSP, clickjacking, MIME-sniffing, referrer, browser-permission, cross-origin, and production HSTS headers. Any future analytics, fonts, media, monitoring SDK, or contact provider that requires another CSP origin needs a reviewed change.

The Privacy page is driven by the same fail-closed contact configuration. It must be reviewed again whenever hosting, analytics, authentication, payments, newsletters, contact delivery, or retention changes.

No analytics or error-monitoring provider is currently selected. Do not add a client script or claim telemetry coverage until the provider, data fields, retention, consent behavior, and CSP changes are reviewed.

## Health and monitoring readiness

`GET /api/health` returns a non-cached service status without secrets or dependency details. Configure the selected uptime platform to:

1. request `/api/health` over HTTPS;
2. expect HTTP `200` and `{"status":"ok"}`;
3. alert the named production owner;
4. retain only operational request metadata permitted by the reviewed hosting policy.

Application error monitoring remains pending provider selection. Hosting logs must be checked for `5xx`, contact `429`, contact `502`, and latency before launch.

## CI and browser support

GitHub Actions runs:

- frozen dependency installation;
- lint, TypeScript, unit tests, and production build;
- production-environment contract validation using a reserved example origin;
- the 32-scenario Chromium desktop/mobile core suite;
- Firefox and WebKit critical-route smoke tests;
- Lighthouse CI for Home, Services, and Contact, with SEO enforced as a hard
  release gate at `0.90` or higher.

Lighthouse thresholds are release baselines, not claims about real-user Core Web Vitals. Field performance remains unavailable until a production origin and privacy-reviewed measurement system exist.

## Search and machine discovery

Production pages publish canonical metadata, page-specific social metadata, and
source-verified JSON-LD. Service, Product, and distinct Work detail pages link
their entities and breadcrumbs to the site-wide Organization graph. Repository
URLs appear in structured data only when the repository was verified as public.

`/llms.txt` is a compact discovery aid generated from the same typed service,
product, and open-work registries. It does not override `robots.txt`, page-level
`noindex`, or the sitemap, and it must not be described as a ranking or AI
citation guarantee.

## Content launch rules

- Blog remains `noindex` until at least one reviewed, source-backed article passes the typed publication gate.
- Research and Talks routes remain available and `noindex`, but the Resources index labels them “In preparation” rather than presenting them as published libraries.
- Open Source may link only to repositories verified as public. AI Agent Kit and Gig were verified public on GitHub before their URLs were added.
- Claims, authors, sources, dates, customers, metrics, jobs, and outcomes require separate evidence and review.

## Preview release

A preview environment must:

1. use a non-production deployment environment so indexing remains disabled;
2. omit contact secrets unless the preview webhook is separately authorized;
3. run the complete CI workflow against the exact commit;
4. verify security headers, `/api/health`, mobile navigation, Contact unavailable/success/error states, and external repository links;
5. record the preview URL and commit for reviewer sign-off.

Creating a preview deployment is an external write and requires separate authorization.

## Rollback

No database migration or persisted website state is introduced by this foundation.

For a failed release:

1. stop promotion and keep the previous known-good deployment active;
2. redeploy the previously tested commit or use the hosting provider's immutable rollback;
3. disable contact delivery by removing all contact configuration values together;
4. confirm `/api/health`, Home, Contact, `robots.txt`, and `sitemap.xml`;
5. verify that `NEXT_PUBLIC_SITE_URL` still points to the intended production origin;
6. document the failed commit, observed symptom, rollback target, and validation evidence.

Never roll back by weakening validation, CSP, rate limiting, privacy disclosure, or indexing safeguards.
