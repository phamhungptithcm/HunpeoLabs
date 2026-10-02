# GA4 Activation And Production Deployment Delta Plan

Plan ID/version: `HUNPEOLABS-ANALYTICS-002-v1`

Status: proposed; no external mutation or deployment is authorized by this document.

## Outcome

On the explicitly selected Google account `hunpeo97@gmail.com`, create/link the production GA4 property for Firebase project `hunpeolabs-prod`, configure a traffic-only privacy baseline, build an isolated Analytics release candidate from the exact current production source, enable the App Hosting flag, deploy to backend `hunpeolabs`, and verify consented page views in GA4 Realtime (DebugView may be used if an approved debug mechanism is available).

## Why A Delta Plan Is Required

`HUNPEOLABS-ANALYTICS-001-v1` approved the local opt-in integration but explicitly excluded Firebase/GA4 Console mutations and production deployment. Live verification on the correct account also disproved the prior assumption that a valid Web measurement ID meant GA4 was already linked: Firebase currently offers `Enable Google Analytics`.

The current checkout contains 158 changed/untracked paths. A direct `firebase deploy` from it would deploy unrelated work, so the release source must be isolated from the immutable active production archive.

## Verified Production Baseline

- Account: `hunpeo97@gmail.com`.
- Firebase project: `hunpeolabs-prod` (`Hunpeo Labs`, production label).
- Web App/backend/region: `hunpeolabs` / `hunpeolabs` / `us-central1`.
- Live build: `build-2026-07-30-001`.
- Cloud Build ID: `9ba0aeca-0ca6-4136-b60f-041521fd282f`.
- Source archive: `gs://firebaseapphosting-sources-91549992622-us-central1/hunpeolabs--2741-DBwA4VCXQv5t-.zip`.
- Source SHA-256: `bb758bb16adaebd8285f649e75d3b834ccdb1bc8a9be9d56f7cde740ddfb321a`.
- Rollback target: `build-2026-07-30-001`.
- Analytics state: Firebase Analytics not enabled/linked; current live source contains no Analytics integration.

## Required Owner Values

Property creation needs two reporting choices. Recommended defaults, based only on the current operating environment, are:

- Property name: `Hunpeo Labs`.
- Reporting timezone: `America/Chicago`.
- Currency: `USD`.

These are business-reporting settings, not facts inferred from the repository. Approval must either accept these values or provide replacements.

An internal-traffic rule also needs a trusted public IP address or CIDR. The plan will not discover or guess it. If none is supplied, internal-traffic filtering remains pending and no Active exclusion is created.

## Phase 1: Firebase And GA4 Console Configuration

All actions must be performed while the console visibly shows `Hung Pham (hunpeo97@gmail.com)` and project `hunpeolabs-prod`.

1. Select `Enable Google Analytics` in Firebase.
2. Create a dedicated GA4 property named `Hunpeo Labs` under the correct Analytics account, using the owner-approved timezone/currency. Do not link an unrelated existing property.
3. Link the Firebase Web App and confirm the resulting Web data stream corresponds to `hunpeolabs.com` and measurement ID `G-7N5K4TXCTL`. If the wizard proposes a different stream/measurement ID, stop for a delta review before changing repository configuration.
4. Minimize optional account/property data sharing; do not enable broad product sharing, benchmarking, support, or account-specialist access unless the owner explicitly requests it.
5. Set event/user data retention to 2 months and keep reset-on-new-activity off.
6. Enable enhanced measurement only for Page views, including browser-history changes. Disable scrolls, outbound clicks, site search, video engagement, file downloads, and form interactions in phase 1.
7. Keep Google Signals off, user-provided data collection off, Ads links absent, ads personalization disabled, and no audiences/key events created.
8. Review data filters:
   - keep Developer Traffic in `Testing` while verification runs; do not activate a permanent exclusion before observing expected behavior;
   - create/test an Internal Traffic rule only when the owner supplies an approved IP/CIDR;
   - do not set an Internal Traffic filter to `Active` in this plan, because Active filtering permanently prevents matching future events from being processed.
9. Capture read-only evidence of property, stream, retention, enhanced-measurement toggles, advertising/link state, and filter state before release activation.

## Phase 2: Isolated Release Candidate

Do not modify or deploy the current dirty checkout.

1. Re-download the immutable source object for `build-2026-07-30-001`, verify its SHA-256, and extract it to a new temporary release directory.
2. Construct an Analytics-only patch from the reviewed `HUNPEOLABS-ANALYTICS-001-v1` implementation. Do not wholesale-copy existing files that contain unrelated later changes.
3. Allow only these release-candidate changes:
   - add the pinned Firebase Web dependency and the minimum generated lockfile changes;
   - add `lib/firebase-analytics.ts` and `components/analytics-consent.tsx`;
   - mount the consent boundary and footer preference control;
   - add the reviewed Privacy disclosure and namespaced UI styles;
   - add only the exact observed Firebase/GA4 CSP origins;
   - add complete-or-absent production config validation;
   - add the Analytics unit/E2E coverage and narrowly related CI/runbook text;
   - add the correct public Firebase Web config and set `NEXT_PUBLIC_FIREBASE_ANALYTICS_ENABLED=true` in the candidate's `apphosting.yaml`.
4. Generate a manifest and diff against the immutable production archive. Stop if any file/hunk cannot be traced to the approved Analytics contract.
5. Keep contact delivery disabled and preserve every other active production setting.
6. Do not commit, push, tag, publish a GitHub release, or change the user's dirty checkout as part of this deployment.

## Phase 3: Candidate Validation

Run from the isolated candidate:

1. frozen dependency install;
2. lint and TypeScript checks;
3. unit tests;
4. production build with the exact approved public config;
5. Analytics E2E with intercepted fake endpoints, including zero Analytics requests before consent, allow/deny persistence, revoke behavior, no duplicate history page views, and blocked-network fallback;
6. Privacy/security-header regression tests;
7. production environment and Firebase preflight validation;
8. source-manifest/allowlist review, dependency audit, and final implementation review required by repository policy.

No production Analytics event is sent during candidate validation.

## Phase 4: Production Deployment

After every prior phase passes:

```bash
firebase deploy \
  --only apphosting:hunpeolabs \
  --project hunpeolabs-prod \
  --account hunpeo97@gmail.com \
  --non-interactive
```

Run this only from the isolated release candidate. Record the new rollout ID, build ID, source-object URI/hash, start/end time, and live domain. Do not treat CLI success as production verification.

## Phase 5: Live Verification

1. Confirm the new rollout is `Current`, successful, and derived from the isolated source upload.
2. Verify `https://hunpeolabs.com`, the App Hosting domain, `/api/health`, Privacy, headers, and critical navigation.
3. Before visitor consent, verify no Firebase/GA4 script, identifier, cookie, or collection request is created.
4. Select `Allow analytics` on one controlled browser, visit Home and Privacy through direct and client navigation, and verify only one initialization and expected automatic page views with no contact fields, free text, User-ID, user properties, or custom parameters.
5. Use GA4 Realtime as the default production proof. Confirm the controlled active user/page views appear in the correct `Hunpeo Labs` property/stream. Use Firebase DebugView only if a separately approved debug mechanism is available; do not add temporary production event code solely for DebugView.
6. Turn Analytics off through the preference control and confirm new collection stops for that browser.
7. Record screenshots/snapshots of the exact property, Realtime/DebugView receipt, rollout, and network/privacy evidence.

## Rollback And Stop Conditions

Stop before deployment if the Firebase wizard produces a different measurement ID, any advertising feature cannot be kept off, an allowlisted patch cannot be isolated, a required test fails, the logged-in account/project changes, or the active rollback target becomes unavailable.

For a post-deploy incident, immediately roll App Hosting back to immutable build `build-2026-07-30-001`, then verify the flag-disabled/no-Analytics behavior and critical routes. Do not delete the GA4 property or collected data autonomously. Provider-side data deletion is a separate destructive owner action.

## Risk And Compatibility

- Risk: high operational/privacy impact because this creates a production analytics destination and changes a global runtime flag, but there is no database/schema/auth change.
- Compatibility: existing browser support remains; unsupported Analytics environments fail closed without breaking the site.
- Data integrity: basic opt-in means Realtime represents consented traffic, not every request. App Hosting request metrics remain the source for total HTTP traffic.
- Performance: Firebase loads only after opt-in; production evidence must confirm content/navigation are unaffected when the third party is blocked.

## Exact Approval Requested

Approve `HUNPEOLABS-ANALYTICS-002-v1` to:

- create/link and configure the dedicated GA4 property under `hunpeo97@gmail.com` for `hunpeolabs-prod` using the approved timezone/currency;
- keep traffic-only retention/enhanced-measurement/advertising/filter settings described above;
- reconstruct an isolated candidate from the immutable current production source, apply only approved Analytics hunks, set the Analytics flag true, validate, and deploy it to the production App Hosting backend;
- verify via Realtime or DebugView and roll back to `build-2026-07-30-001` if required.

This approval does not authorize unrelated worktree content, Git commit/push/tag/release, Ads/Signals/user-provided data, custom events, active permanent traffic exclusions, discovery of the user's IP address, or provider-side data deletion.
