# Repository Intelligence Brief

Plan ID/version: `HUNPEOLABS-ANALYTICS-001-v1`

## Gate Status

- CodeGraph: installed, configured, current, health check passed.
- CocoIndex: installed, configured, current, health check passed.
- Repository commit: `3d53e1b8201251cb28e02dbd2052ad36b1d67fec`
- Indexed commit: `3d53e1b8201251cb28e02dbd2052ad36b1d67fec`
- Gate result: `READY` on 2026-08-03.

## Task Context

- Business outcome: monitor public website traffic in Firebase without collecting project-brief content, adding advertising behavior, or weakening the current privacy and security posture.
- Request: research adding Firebase Analytics to the existing Hunpeo Labs website.
- Scope: repository analysis, current Firebase project verification, provider research, impact analysis, and implementation plan only.
- Constraints: existing-system approval gate, dirty worktree preservation, no deployment, no Firebase/GA4 console mutation, and no application-code edits before explicit approval.

## Indexed Facts

- CodeGraph located the global entry point at `app/layout.tsx`; it renders the shared header, motion orchestrator, route content, footer, and structured data.
- CodeGraph found no current Firebase client or Analytics symbol. The only Firebase-indexed source is the production preflight script.
- CodeGraph impact shows `app/layout.tsx` is the global render boundary. `PrivacyPage` is route-local, while `getSiteUrl` has 16 downstream symbols and should remain unchanged.
- CocoIndex found that `docs/operations/production-readiness.md` explicitly forbids adding analytics until provider, fields, retention, consent, and CSP behavior are reviewed.
- CocoIndex found that Firebase App Hosting is already the production runtime and that no analytics/error-monitoring provider is currently selected in repository policy.

## Source-Code Verified Facts

- `package.json` uses Node.js 24+, pnpm 11.9.0, Next.js 16.2.12, React 19.2.8, and TypeScript 6.0.3. It has no Firebase dependency.
- `app/layout.tsx` is a server component and the smallest global mount point for one analytics client boundary.
- `next.config.ts` currently limits production `script-src` and `connect-src` to `'self'`; Firebase Analytics cannot function under the current CSP.
- `app/privacy/page.tsx` says Hunpeo Labs does not sell information or use it to target ads, but it does not disclose analytics, cookies, device/browser data, approximate location, purpose, retention, or preference controls.
- `.env.example`, `apphosting.yaml`, `scripts/validate-production-env.mjs`, and CI have no analytics configuration contract.
- The Firebase project is `hunpeolabs-prod`. Firebase CLI verified one active Web App named `hunpeolabs` with the expected project/app identity.
- The Web App SDK configuration already contains a syntactically valid `measurementId`; Analytics/GA4 linking exists and a new Firebase Web App is not required.
- The downloaded SDK config was inspected only for key presence/identity, was not printed, and was deleted from `/private/tmp` after verification.
- The repository has extensive unrelated tracked and untracked changes, including intended target files such as `app/layout.tsx`, `app/privacy/page.tsx`, `next.config.ts`, `package.json`, `styles/globals.css`, and `docs/operations/production-readiness.md`.

## Relevant Modules

- `app/layout.tsx`: global server-rendered layout and analytics client mount point.
- `next.config.ts`: CSP and security headers.
- `app/privacy/page.tsx`: public disclosure and analytics preference access.
- `components/site-footer.tsx`: possible persistent “Analytics preferences” entry point.
- `.env.example`, `apphosting.yaml`, `scripts/validate-production-env.mjs`: fail-closed public configuration contract.
- `tests/e2e/smoke.spec.ts`, `tests/e2e/privacy.spec.ts`: security-header and Privacy regression boundaries.
- `docs/operations/production-readiness.md`: provider, privacy, deployment, validation, and rollback contract.

## Entry Points And Call Paths

- `RootLayout` renders one client-only analytics/consent component after the primary page content.
- The client component reads a validated public Firebase configuration, reads a versioned first-party consent preference, and does not import or initialize Analytics until consent is granted.
- After opt-in, a dynamic import initializes the existing Firebase Web App, checks browser support, sets advertising-related consent to denied, sets analytics storage to granted, and enables automatic traffic measurement.
- No contact API request, project-brief field, server log, or structured-data flow is an Analytics source.

## Data Stores And Contracts

- No database, API, schema, migration, or server persistence change is proposed.
- One versioned, first-party browser preference stores `granted` or `denied`; it contains no identity or activity data.
- Firebase/GA4 receives only the reviewed automatic traffic fields in phase 1. Google documents default web collection including page location/referrer/title, language, screen resolution, browser/device information, sessions, and approximate geography.
- Firebase web configuration values are public identifiers, not secrets, but remain validated as one complete configuration set and must never be mistaken for server credentials.

## Related Specifications And ADRs

- `.ai/workflows/plan-existing-system-change.md`: requires plan-first approval.
- `.ai/guards/implementation-approval-gate.yaml`: protects application, runtime configuration, infrastructure, contracts, and behavior-changing tests.
- `docs/operations/production-readiness.md`: requires provider/data/retention/consent/CSP review before analytics.
- `docs/design/privacy/design-brief.md`: the previous Privacy scope explicitly excluded analytics and cookie controls, so this work needs a separate approval.

## Related Tests

- Existing: CSP assertion in `tests/e2e/smoke.spec.ts`; Privacy content/motion/responsive coverage in `tests/e2e/privacy.spec.ts`; full lint/type/unit/build and desktop/mobile/cross-browser scripts.
- Missing: config completeness tests, no-request-before-consent test, accept/decline/persistence/revoke tests, single-page navigation page-view test, CSP endpoint verification, unsupported-browser fallback, and production DebugView evidence.

## Potential Impact Areas

- Direct: global client JavaScript, a consent/preference UI, Privacy copy, CSP, public build/runtime configuration, dependency lockfile, tests, and operations docs.
- Indirect: bundle and network cost, Lighthouse, all routes, client navigation, browser storage, Firebase/GA4 dashboards, privacy expectations, and future event governance.
- Operational: Firebase/GA4 console settings, DebugView, developer-traffic filtering, data retention, release validation, rollback, and post-deploy traffic evidence.
- Security/data: third-party script execution, widened CSP, pseudonymous identifiers/cookies after opt-in, page URLs/referrers, approximate geography, device/browser metadata, and accidental PII in URLs or future event parameters.

## Brainstorming Record

- Assumption: monitoring traffic means aggregate users, sessions, page views, route popularity, acquisition/referrer, geography, and device/browser data rather than session replay or form-content analytics.
- Unknowns: GA4 property owner, current retention, enhanced-measurement toggles, Google Signals/Ads links, internal-traffic filters, property timezone/currency, and named operational owner.
- Alternative 1: App Hosting metrics only. Lowest privacy impact, but it provides operational request/latency evidence rather than GA4 acquisition and visitor behavior; it does not meet the stated outcome.
- Alternative 2: initialize Firebase Analytics for every visitor. Highest coverage, but creates immediate third-party data processing and cookie/identifier behavior; not recommended without a separate owner-approved legal basis.
- Alternative 3: Firebase Analytics with basic opt-in. Do not load or initialize the SDK until consent; always deny advertising/personalization. Lower traffic coverage, but the clearest fail-closed privacy behavior. Recommended.
- Long-term option: after a stable traffic baseline, add a separately reviewed typed event catalog for business outcomes. Do not include free text, email, names, company, full form fields, User-ID, or arbitrary URLs.
- Regression risks: duplicate page views during Next.js navigation, consent timing races, SDK initialization during SSR, blocked network calls from incomplete CSP, Analytics test traffic contaminating reports, banner regressions, and collision with unrelated dirty hunks.

## Remaining Unknowns

- Confirm consent/legal policy and whether explicit opt-in is accepted despite reduced traffic coverage.
- In Firebase/GA4 console, confirm the linked property and web stream, then review retention, enhanced measurement, Ads/Signals, internal-traffic filtering, timezone, and owner access. These are external mutations and remain outside this plan unless separately authorized.
- During implementation, capture the actual Analytics network hosts and CSP violations in a controlled browser run before finalizing the narrow allowlist.

