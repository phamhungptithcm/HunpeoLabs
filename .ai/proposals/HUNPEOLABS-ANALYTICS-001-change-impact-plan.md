# Change Impact Plan

Plan ID/version: `HUNPEOLABS-ANALYTICS-001-v1`

## Summary And Recommendation

Add Google Analytics for Firebase to the existing active Firebase Web App using the modular Firebase Web SDK and a fail-closed, explicit opt-in flow. Phase 1 measures traffic only: automatic page views, sessions, acquisition/referrer, approximate geography, and device/browser aggregates. It does not add advertising, personalization, User-ID, user properties, custom CTA events, form analytics, session replay, or error monitoring.

Implementation is not authorized by this document. This plan stops at the existing-system approval gate.

## Repository Intelligence Evidence

- Gate: `READY` on 2026-08-03.
- Repository/indexed commit: `3d53e1b8201251cb28e02dbd2052ad36b1d67fec`.
- Brief: `.ai/proposals/HUNPEOLABS-ANALYTICS-001-repository-intelligence-brief.md`.
- CodeGraph: global entry point is `app/layout.tsx`; no current Firebase client/Analytics implementation exists.
- CocoIndex: current operations policy requires provider, data fields, retention, consent, and CSP review before adding analytics.
- Live read-only Firebase verification: project `hunpeolabs-prod` already has an active Web App named `hunpeolabs`, and its SDK config includes a valid Analytics measurement ID. No new app registration is needed.

## Requirement Gap

Firebase App Hosting supplies operational logs and platform metrics, but the website does not initialize a measurement SDK, so it does not emit GA4/Firebase Analytics traffic events. A valid measurement ID proves the Firebase/GA4 link exists; it does not prove that the current website collects or reports traffic.

## Consent And Data Contract

- Recommended mode: basic consent/explicit opt-in.
- Before consent: do not dynamically import Analytics, do not inject `gtag.js`, do not create Analytics identifiers/cookies, and do not send consent-denied pings.
- On accept: initialize once, set `analytics_storage=granted`, and keep `ad_storage`, `ad_user_data`, and `ad_personalization` denied.
- On decline or revoke: keep Analytics uninitialized/disabled and persist only the first-party preference.
- Preference storage: one versioned local-storage value containing only `granted` or `denied`; no activity, timestamp, identity, or server sync in v1.
- Data allowed in phase 1: automatic traffic fields documented by Google, including page location/referrer/title, language, screen resolution, browser/device information, sessions, and approximate geography.
- Data prohibited: contact-form fields, name, email, company, project brief, User-ID, user properties, arbitrary event parameters, sensitive URL query values, advertising audiences, and cross-product ads personalization.
- Page views: rely on reviewed GA4 enhanced measurement for page load and browser-history changes. Do not also add a manual `usePathname()` page-view emitter unless browser evidence proves automatic history measurement is insufficient; this avoids duplicate counts.

## Scope

### In Scope

- Add the exact current reviewed `firebase` dependency (research snapshot: 12.17.0; re-verify at implementation time and pin consistently with repository convention).
- Add a small client-only Firebase Analytics adapter with guarded, single-flight initialization and `isSupported()` fallback.
- Add a compact consent banner plus a persistent Analytics-preferences entry point.
- Add complete-or-absent public Firebase configuration validation; local/test builds remain analytics-off unless explicitly configured.
- Add the existing Web App's public config to the approved Firebase App Hosting environment without exposing any server secret.
- Narrowly extend CSP only for endpoints demonstrated by the Firebase SDK and captured browser traffic.
- Update Privacy and production-readiness disclosure.
- Add unit, browser, security-header, and operational verification coverage.

### Out Of Scope

- Creating a Firebase project or Web App.
- Changing Firebase App Hosting backend, domain, scaling, contact delivery, health endpoint, auth, database, or API behavior.
- Google Ads linking, Google Signals, remarketing, audiences, ad personalization, User-ID, custom dimensions, custom events, conversions/key events, BigQuery export, session replay, Performance Monitoring, or Crashlytics.
- Collecting contact-form interactions or contents.
- Legal-compliance claims or jurisdiction-specific legal advice.
- Production deployment, release, commit, push, or Firebase/GA4 console mutation.

## Proposed Architecture

1. The server layout renders normal content and one small client boundary.
2. The boundary checks whether the complete public Firebase config is enabled and whether a valid stored preference exists.
3. With no preference, it renders a non-blocking, keyboard-accessible consent prompt. No Analytics module is initialized.
4. Accept dynamically imports the modular Firebase app/analytics APIs, supplies the existing public Web App config, applies consent settings before initialization where supported, checks browser support, and initializes exactly once.
5. Decline stores the preference and sends nothing.
6. A footer or Privacy control reopens preferences. Revocation disables collection for the current initialized instance and prevents future initialization; the implementation must verify cookie/identifier cleanup behavior and document any provider limitation rather than claiming deletion it cannot prove.
7. GA4 enhanced measurement owns page-view/history measurement. No duplicate route observer is introduced in v1.

## Expected File-Level Changes

- `package.json`, `pnpm-lock.yaml`
  - Add and lock the exact modular Firebase Web SDK dependency.
- `.env.example`
  - Document the complete public Firebase Analytics config and an explicit enable/disable switch; use placeholders only.
- `apphosting.yaml`
  - Add the verified public Web App configuration for build/runtime. Values are public identifiers, not Secret Manager values.
- `scripts/validate-production-env.mjs`
  - Fail on partial Analytics configuration, invalid project/app/measurement formats, or an enabled flag without a complete set. Keep fully absent/disabled configuration valid for non-Analytics environments.
- `lib/firebase-analytics.ts` (new)
  - Own typed config parsing, singleton/single-flight initialization, dynamic imports, `isSupported()` handling, consent defaults, collection enable/disable, and safe no-op behavior.
  - Never accept arbitrary event names or parameters in phase 1.
- `components/analytics-consent.tsx` (new)
  - Own the versioned preference state, accessible opt-in/decline UI, reopen control contract, and initialization lifecycle.
  - Remove every listener/subscription it creates; avoid timers and unbounded state.
- `app/layout.tsx`
  - Mount one Analytics consent boundary without converting the root layout to a client component.
- `components/site-footer.tsx`
  - Add a persistent “Analytics preferences” control that works after accept or decline.
- `app/privacy/page.tsx`
  - Add concise, accurate disclosure of provider, purpose, allowed data categories, no advertising use, preference control, and reviewed retention once the owner confirms it.
- `styles/globals.css`
  - Add only namespaced consent/preference styles with keyboard focus, mobile layout, 200% text support, and reduced-motion-safe behavior.
- `next.config.ts`
  - Extend CSP narrowly. Expected initial sources from official Firebase SDK source are `https://www.googletagmanager.com` for the dynamically inserted script and `https://firebase.googleapis.com` for dynamic web config; Analytics/Firebase Installations collection hosts must be added only after captured browser evidence identifies the exact required origins.
- `tests/unit/firebase-analytics.test.ts` (new)
  - Cover configuration completeness, valid/invalid identifiers, default disabled state, consent parsing/versioning, single-flight behavior, unsupported browser fallback, and prohibited event API absence.
- `tests/e2e/analytics.spec.ts` (new)
  - Under an isolated fake/test configuration, verify zero third-party Analytics requests before consent, accept/decline persistence, reopen/revoke behavior, keyboard/mobile behavior, direct navigation and client navigation without duplicate page views, and graceful blocked-network behavior.
- `tests/e2e/smoke.spec.ts`
  - Assert the reviewed CSP allowlist and that unrelated security headers remain intact.
- `tests/e2e/privacy.spec.ts`
  - Verify the final reviewed disclosure and preference entry point without weakening existing responsive/motion assertions.
- `.github/workflows/ci.yml` or a dedicated repository-native analytics test command, only if required by the isolated browser fixture
  - Run Analytics E2E with fake public identifiers and intercepted third-party endpoints so CI never writes test traffic into the production property.
- `docs/operations/production-readiness.md`
  - Replace “no provider selected” with the exact Analytics contract, owner-controlled console checklist, validation, alert/observation boundaries, rollback, and post-deploy evidence.
- `README.md`
  - Add only the public configuration/validation entry point if needed; no marketing claim that traffic monitoring is live before production evidence exists.

## Existing Behavior To Preserve

- Server-rendered routes, global header/footer geometry, navigation, metadata, structured data, Contact behavior, fail-closed delivery, health endpoint, sitemap/robots/llms routes, Firebase App Hosting target, security headers, reduced motion, and supported browser matrix.
- Local/dev/test environments do not send production Analytics traffic by default.
- Privacy continues to state that visitor information is not sold or used to target ads.
- No full URL containing sensitive query parameters may be intentionally logged. Existing public routes currently do not depend on sensitive queries; this must be rechecked before enabling enhanced measurement options.
- All unrelated dirty-worktree changes remain untouched.

## Security, Privacy, Performance, And Reliability Impact

- Risk classification: medium overall due to a new client dependency, global runtime behavior, third-party script, CSP expansion, browser storage, and external data processing. Privacy review is mandatory.
- Supply chain: inspect the pinned Firebase release and production dependency audit; retain frozen lockfile CI.
- CSP: do not add broad `https:` or wildcard Google domains. Capture real network/CSP evidence and allow only necessary origins.
- Secrets: Firebase Web config is non-secret, but no Admin SDK credential, service-account key, token, or contact secret enters the browser or repository.
- PII: event wrappers are intentionally absent in phase 1. Never send form fields, email, company, free text, or User-ID.
- Lifecycle: initialization is browser-only, guarded for React Strict Mode, single-flight, no-op on unsupported environments, and safe across client navigation.
- Performance: SDK is dynamically imported only after opt-in. Compare production bundle and Lighthouse/network waterfall; Analytics failure must never block content or navigation.
- Availability: third-party failures are swallowed into a bounded no-op state without retry loops or user-facing site failure.
- Cost: GA4 standard collection is expected to avoid a new application runtime cost, but BigQuery/export/360 or future linked services are excluded until separately reviewed.

## Firebase/GA4 Owner Checklist (External, Not Authorized Here)

- Confirm the linked GA4 property and `hunpeolabs.com` Web data stream are the intended production resources.
- Confirm named owners and least-privilege access.
- Review property timezone/currency.
- Keep Google Ads links, Google Signals, ad personalization, and advertising audiences disabled for v1.
- Configure the shortest acceptable user/event retention (recommended starting point: 2 months; owner must confirm).
- Review enhanced measurement individually. Keep page views/history changes; enable no additional category without documenting its fields and purpose.
- Configure internal/developer traffic filters before DebugView/production validation.
- Confirm no sensitive values appear in route query strings or page titles.
- Record the final settings as release evidence. Console changes require separate authorization.

## Test And Validation Strategy

- `pnpm install --frozen-lockfile` after the approved dependency update.
- `pnpm lint`.
- `pnpm typecheck`.
- `pnpm test`.
- Focused Analytics Playwright test with fake config and intercepted network.
- Existing Privacy desktop/mobile/reduced-motion spec.
- Existing Chromium mobile/desktop core suite and Firefox/WebKit smoke suite.
- `pnpm build` with Analytics disabled, invalid/partial config negative cases, and the reviewed production config.
- `pnpm lighthouse:ci` plus bundle/network comparison against the pre-change baseline.
- `pnpm audit` or the repository-approved production dependency audit.
- Browser verification: no third-party request/cookie before opt-in; exactly one initialization; expected page-view behavior on direct and client navigation; decline/revoke persistence; no console errors; CSP has no unexpected violations.
- Firebase DebugView on an authorized development device after developer-traffic filtering. DebugView is validation evidence, not production traffic evidence.
- After a separately approved deployment: verify exact rollout, live headers, consent behavior, Analytics Realtime/DebugView event receipt, and absence of form/PII parameters. Standard reports may take longer than Realtime/DebugView.

## Compatibility, Deployment, And Rollback

- No API, database, schema, route, or server contract change.
- Browser compatibility follows the existing Playwright matrix; unsupported Analytics environments degrade to the website with no tracking.
- Deployment sequencing: approve plan -> implement locally -> validate code and browser behavior -> owner reviews console settings -> separately approve deployment -> verify rollout and live Analytics evidence.
- Rollback: redeploy the last verified rollout and/or set the explicit Analytics enable flag false. The disabled path must avoid SDK initialization without weakening CSP or other security headers. Do not claim already collected GA4 data is deleted; provider-side deletion is a separate owner-controlled operation.

## Detected Stack And Quality Profiles

- Stack: Node.js 24+, pnpm 11.9.0, Next.js 16.2.12 App Router, React 19.2.8, TypeScript 6.0.3, ESLint 9, Vitest 4.1.10, Playwright 1.62.0, Firebase App Hosting.
- Application/domain: public marketing/product website with contact and privacy disclosures.
- Selected profiles: `universal`, `typescript-javascript`, `frontend-html-css`, `web-app`, `devops`, `memory`; `infrastructure` applies if App Hosting/runtime configuration changes.

## Dirty Worktree And Approval Boundary

The worktree is already heavily modified, and several proposed target files contain unrelated user changes. Implementation must snapshot exact target diffs, patch only named hunks, validate approval per path, and never restore, stage, commit, or absorb unrelated work.

Approval must explicitly cover these protected areas: global application layout, new client runtime/dependency, browser storage/consent UI, Privacy disclosure, CSP/security headers, App Hosting public configuration, production validation, behavior-changing tests, and operations documentation.

## Approval Decision Requested

Approve `HUNPEOLABS-ANALYTICS-001-v1` to implement the opt-in, traffic-only Firebase Analytics design above in the listed files. Approval does not authorize Firebase/GA4 console mutation, commit, push, release, or production deployment. Any custom event, advertising feature, new data category, wider CSP origin, additional provider, or material file/scope expansion requires a delta plan and fresh approval.

## Primary Research Sources

- Firebase Web Analytics setup: https://firebase.google.com/docs/analytics/web/get-started
- Firebase Web event logging and DebugView: https://firebase.google.com/docs/analytics/web/events and https://firebase.google.com/docs/analytics/debugview
- Firebase Web configuration model: https://firebase.google.com/docs/web/learn-more
- Google consent mode: https://developers.google.com/tag-platform/security/guides/consent
- GA4 default/enhanced collection and retention: https://support.google.com/analytics/answer/11593727, https://support.google.com/analytics/answer/9216061, and https://support.google.com/analytics/answer/7667196
- Firebase JS SDK Analytics source: https://github.com/firebase/firebase-js-sdk/tree/master/packages/analytics/src

