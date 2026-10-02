# Repository Intelligence Brief

Plan ID/version: `HUNPEOLABS-ANALYTICS-002-v1`

## Gate Status

- CodeGraph: installed, configured, current, health check passed.
- CocoIndex: installed, configured, current, health check passed.
- Repository commit: `3d53e1b8201251cb28e02dbd2052ad36b1d67fec`.
- Indexed commit: `3d53e1b8201251cb28e02dbd2052ad36b1d67fec`.
- Gate result: `READY` on 2026-08-04.

## Task Context

- Business outcome: activate the already implemented opt-in Firebase Analytics integration, configure a privacy-minimal GA4 property, deploy it to Firebase App Hosting, and verify traffic in Realtime or DebugView.
- Request: review GA4 retention, enhanced measurement, advertising, and internal traffic; enable the feature flag; deploy; and verify receipt.
- Correct production identity: Google account `hunpeo97@gmail.com`, Firebase project `hunpeolabs-prod`, Web App `hunpeolabs`, backend `hunpeolabs` in `us-central1`.
- Constraints: production project, external GA4 mutations, existing-system approval gate, extensive dirty worktree, no secret access, no unrelated release content, and no destructive provider-side data action.

## Indexed Facts

- CodeGraph traces the global integration through `app/layout.tsx`, the client consent boundary, `lib/firebase-analytics.ts`, and the footer preference control.
- CodeGraph confirms `apphosting.yaml` and production-environment validation are the operational activation boundary.
- CocoIndex finds the production runbook requires a linked GA4 property/stream, named owner, timezone, shortest acceptable retention, reviewed page/history measurement, disabled advertising, internal/developer filtering, and no sensitive query values before activation.
- CocoIndex finds deployment must use the App Hosting preflight and a clearly understood source tree, then record rollout and rollback evidence.

## Source-Code Verified Facts

- `apphosting.yaml` contains the correct public Firebase Web App identifiers and measurement ID `G-7N5K4TXCTL`, but `NEXT_PUBLIC_FIREBASE_ANALYTICS_ENABLED` is currently `false`.
- The implementation dynamically imports Firebase Analytics only after explicit visitor opt-in and sets `ad_storage`, `ad_user_data`, and `ad_personalization` to `denied`.
- Phase 1 exposes no arbitrary custom-event API and is limited to automatic aggregate traffic.
- Firebase CLI is logged in as `hunpeo97@gmail.com`; project `hunpeolabs-prod` is active and labeled production.
- On the correct Firebase Console account, the Analytics page shows `Enable Google Analytics`. No GA4 property is currently linked, so retention, stream-level enhanced measurement, Ads links, and data filters cannot yet be reviewed or configured.
- The active App Hosting rollout is `build-2026-07-30-001`, Cloud Build ID `9ba0aeca-0ca6-4136-b60f-041521fd282f`, created 2026-07-29 22:49:08 local console time from a source upload.
- The immutable source object is `gs://firebaseapphosting-sources-91549992622-us-central1/hunpeolabs--2741-DBwA4VCXQv5t-.zip`, SHA-256 `bb758bb16adaebd8285f649e75d3b834ccdb1bc8a9be9d56f7cde740ddfb321a`.
- The active source archive has 395 files and does not contain the Firebase Analytics integration or activation flag.
- The current checkout is branch `beaus-dev` at the indexed commit but has 158 changed/untracked status paths. Its tracked diff spans 67 files with 7,317 insertions and 381 deletions, so direct local-source deployment would publish unrelated work.

## Relevant Modules

- `lib/firebase-analytics.ts`: config parsing, consent state, guarded initialization, and collection disablement.
- `components/analytics-consent.tsx`: explicit opt-in/decline and preference UI.
- `app/layout.tsx`, `components/site-footer.tsx`: global mount and persistent preference entry point.
- `app/privacy/page.tsx`: public traffic-analytics disclosure.
- `next.config.ts`: narrow Analytics CSP origins.
- `apphosting.yaml`, `scripts/validate-production-env.mjs`: activation and production config validation.
- Analytics unit/E2E tests, security-header tests, CI, and production runbook: release evidence.

## Entry Points And Call Paths

- App Hosting build injects the complete public Web configuration and enable flag.
- `RootLayout` passes the configuration to `AnalyticsConsent` without converting the root layout to a client component.
- With no/granted/denied preference, the consent component respectively prompts, dynamically initializes, or leaves Analytics disabled.
- Initialization sets Analytics consent granted only for analytics storage while all advertising-related consent remains denied.
- GA4 enhanced measurement owns automatic page-view/history measurement; no manual duplicate route event is emitted.

## Data Stores And Contracts

- No database, API, authentication, or server persistence change.
- One first-party local-storage value stores only `granted` or `denied`.
- GA4 property and Web data stream are external production resources that must be created/linked before the local flag can be enabled.
- Internal-traffic rules require an owner-approved public IP address or CIDR. No IP value is present in the repository, and this plan does not infer or discover one.

## Related Specifications And ADRs

- `.ai/proposals/HUNPEOLABS-ANALYTICS-001-change-impact-plan.md`: approved opt-in, traffic-only implementation contract; explicitly excluded console mutation and deployment.
- `.ai/proposals/HUNPEOLABS-ANALYTICS-001-approval.md`: records the approved code/data boundary and requires delta approval for console changes or production deployment.
- `docs/operations/production-readiness.md`: owner checklist, validation, deployment, and rollback requirements.
- `.ai/workflows/plan-existing-system-change.md`: requires a delta impact plan and approval before the new production scope.

## Related Tests

- Existing: Analytics configuration and consent unit tests; fake-config Analytics E2E; Privacy and security-header E2E; lint, typecheck, unit, build, production preflight, cross-browser, and Lighthouse commands.
- Required production evidence: isolated candidate diff, tests from the candidate, exact App Hosting rollout/build ID, live consent/network behavior, and GA4 Realtime or DebugView receipt.

## Potential Impact Areas

- Direct: creation/linking of GA4 production resources, provider settings, production build configuration, and global optional browser measurement.
- Indirect: privacy disclosures, CSP, bundle/network cost after opt-in, traffic-report accuracy, and future retention/filter behavior.
- Operational: source reconstruction, deployment, rollout health, Realtime validation, and immutable rollback.
- Security/data: third-party script, page URL/referrer/title, device/browser metadata, approximate geography, pseudonymous Analytics identifiers after consent, and permanent loss of matching future events if a data filter is activated incorrectly.

## Brainstorming Record

- Assumption: the new GA4 property should be named `Hunpeo Labs`; reporting timezone and currency remain owner decisions.
- Unknowns: approved reporting timezone/currency and trusted public IP/CIDR for internal traffic.
- Alternative 1: deploy directly from the current checkout. Rejected because it would include 158 dirty paths and cannot support an analytics-only release claim.
- Alternative 2: wait for the whole worktree to be committed/released. Safer than direct deployment but unnecessarily couples Analytics activation to unrelated work.
- Smallest safe solution: reconstruct an isolated release candidate from the immutable current production archive, apply only the already approved Analytics hunks plus the true flag, validate its allowlisted diff, deploy that candidate with the explicit correct Firebase account, and keep the current build as rollback.
- Long-term solution: link App Hosting to a reviewed GitHub branch and deploy exact commits instead of anonymous local source uploads.
- Regression risks: duplicate page views, CSP blocking, consent timing, wrong GA4 property/account, unwanted advertising features, test traffic polluting reports, active filters permanently discarding traffic, and unrelated dirty-worktree leakage.
- Recommended direction: execute the isolated-candidate path only after delta approval and owner confirmation of timezone/currency; keep internal filtering in Testing until an approved IP/CIDR produces observable tagged traffic.

## Remaining Unknowns

- Owner must confirm the GA4 reporting timezone and currency before property creation.
- Owner must supply the trusted public IP/CIDR if an internal-traffic rule is required now; otherwise internal traffic remains documented and unactivated.
- The implementation cycle must construct and inspect the analytics-only patch against the immutable production source before any deploy command.
