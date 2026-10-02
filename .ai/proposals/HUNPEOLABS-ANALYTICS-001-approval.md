# Implementation Approval Record

Plan ID/version: HUNPEOLABS-ANALYTICS-001-v1

Repository intelligence gate status: READY — verified 2026-08-03 after refreshing CodeGraph and CocoIndex

Indexed analysis reviewed: CodeGraph and CocoIndex analysis of the global layout, footer, Privacy route, CSP, Firebase App Hosting configuration, production validation, tests, and operations documentation.

Approval status: APPROVED

Approver: User in the current Codex task

Approval timestamp or task reference: Current Codex task, explicit user message “Approved HUNPEOLABS-ANALYTICS-001-v1” on 2026-08-03.

Approved scope: Implement the reviewed basic-consent, traffic-only Google Analytics for Firebase integration for the existing active `hunpeolabs` Web App. Keep Analytics unloaded before opt-in; deny advertising storage, advertising user data, and advertising personalization; collect no contact-form fields, User-ID, user properties, or custom events; preserve a fail-closed disabled path; add narrow CSP, public configuration validation, Privacy disclosure, automated tests, and operational documentation.

Approved paths:

- `.ai/proposals/HUNPEOLABS-ANALYTICS-001-*.md`
- `ai/proposals/HUNPEOLABS-ANALYTICS-001-*.md`
- `package.json`
- `pnpm-lock.yaml`
- `.env.example`
- `env.example`
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
- `github/workflows/ci.yml`
- `docs/operations/production-readiness.md`
- `README.md`

Required constraints: Preserve all unrelated dirty-worktree changes and patch only approved hunks. Keep the root layout server rendered. Dynamically import the Firebase Analytics SDK only after explicit opt-in. Use one versioned first-party preference containing only `granted` or `denied`. Keep local, test, and partially configured environments fail-closed. Do not add arbitrary event logging. Do not broaden CSP beyond observed required origins. Do not expose server credentials or contact secrets. Validate mobile, keyboard, reduced-motion, browser storage failure, Strict Mode, direct navigation, client navigation, CSP, dependency, build, and rollback behavior.

Explicit exclusions: Firebase/GA4 console mutation, Google Ads, Google Signals, advertising audiences, personalization, User-ID, user properties, custom events, key events, BigQuery, session replay, Performance Monitoring, Crashlytics, contact-form analytics, database/API/auth changes, commit, push, release, or production deployment.

Delta approval required when:

- Any path outside the approved list is required.
- Any custom event, additional data category, identifier, provider, advertising feature, or analytics destination is proposed.
- CSP must be widened beyond exact reviewed Firebase/Google Analytics origins.
- Firebase/GA4 console configuration or production deployment is required.
- Implementation materially deviates from the opt-in, traffic-only, fail-closed design.
