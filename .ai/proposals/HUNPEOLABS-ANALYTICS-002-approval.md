# Implementation Approval Record

Plan ID/version: HUNPEOLABS-ANALYTICS-002-v1

Repository intelligence gate status: READY — refreshed and verified 2026-08-04

Indexed analysis reviewed: CodeGraph and CocoIndex analysis of the Analytics client boundary, Firebase App Hosting activation, production runbook, deployment, validation, and rollback paths.

Approval status: APPROVED

Approver: User in the current Codex task

Approval timestamp or task reference: Current Codex task, explicit user message “Approved HUNPEOLABS-ANALYTICS-002-v1 — timezone:America/Chicago, currency: USD, internal IP/CIDR: pending” on 2026-08-04.

Approved scope: Under Google account `hunpeo97@gmail.com`, enable/link Google Analytics for Firebase project `hunpeolabs-prod`; create/configure the dedicated `Hunpeo Labs` GA4 property with reporting timezone `America/Chicago` and currency `USD`; set the reviewed privacy-minimal retention, enhanced-measurement, advertising, and test-filter settings; reconstruct an isolated Analytics-only release candidate from immutable production build `build-2026-07-30-001`; enable the Analytics flag; validate and deploy that isolated candidate to App Hosting backend `hunpeolabs`; verify by Realtime or DebugView; and roll back to `build-2026-07-30-001` if required.

Approved paths:

- `.ai/proposals/HUNPEOLABS-ANALYTICS-002-*.md`
- `ai/proposals/HUNPEOLABS-ANALYTICS-002-*.md`
- `package.json`
- `pnpm-lock.yaml`
- `.env.example`
- `apphosting.yaml`
- `scripts/validate-production-env.mjs`
- `lib/firebase-analytics.ts`
- `components/analytics-consent.tsx`
- `app/layout.tsx`
- `components/site-footer.tsx`
- `app/privacy/page.tsx`
- `styles/globals.css`
- `next.config.ts`
- `tests/unit/firebase-analytics.test.ts`
- `tests/e2e/analytics.spec.ts`
- `tests/e2e/smoke.spec.ts`
- `tests/e2e/privacy.spec.ts`
- `.github/workflows/ci.yml`
- `docs/operations/production-readiness.md`
- `README.md`

Required constraints: Use only `hunpeo97@gmail.com` and visibly confirm project `hunpeolabs-prod`; timezone is `America/Chicago`; currency is `USD`; internal IP/CIDR is pending, so do not discover an IP, create an Active internal exclusion, or claim internal filtering is complete. Keep retention at 2 months, Page views/history changes as the only enabled enhanced-measurement category, Google Signals and user-provided data off, no Google Ads links, advertising consent denied, and no custom events. Build from the immutable current production archive and apply only approved Analytics hunks; do not deploy the dirty repository checkout. Run required tests and final review, record the exact rollout/build/source, verify live behavior and Realtime/DebugView, and preserve `build-2026-07-30-001` as the rollback target.

Explicit exclusions: Unrelated dirty-worktree content, Git commit/push/tag/release, Google Ads, Google Signals, user-provided data, audiences, key events, custom events, User-ID, user properties, active permanent traffic exclusions, IP discovery, provider-side data deletion, database/API/auth changes, contact-provider activation, or secrets.

Delta approval required when: The Firebase wizard proposes a different measurement ID; an existing unrelated GA4 property would be linked; any additional data category, provider, CSP origin, advertising feature, active filter, source path, or unrelated release content is required; or rollback target `build-2026-07-30-001` is unavailable.
