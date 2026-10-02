# Implementation Approval Record

Plan ID/version: HUNPEOLABS-RELEASE-003-v1

Repository intelligence gate status: READY — verified 2026-08-04

Approval status: APPROVED

Approver: User in the current Codex task

Approval timestamp or task reference: Current Codex task on 2026-08-04; the
user replied `Approved` directly to the approval request for
`HUNPEOLABS-RELEASE-003-v1`.

Approved scope:

- Prepare stable patch release `v0.2.1` from clean authoritative GitHub
  `main@e28331d79fc27842224192ef9f3397e6be80a8b3`.
- Apply only the verified consent-based Firebase Analytics release candidate
  and the release metadata/evidence defined by the approved plan.
- Create and push `agent/analytics-v0.2.1`, open a ready-for-review pull request,
  require green checks, and merge the scoped PR to `main`.
- Create and push annotated tag `v0.2.1`, require the GitHub Release workflow
  and published GitHub Release to succeed, then deploy the exact tagged source
  to Firebase App Hosting backend `hunpeolabs` in project `hunpeolabs-prod`.
- Verify GitHub commit/tag/release, Firebase build/rollout/source, production
  routes/security/privacy/consent behavior, and GA4 Realtime receipt.

Approved paths:

- `.ai/proposals/HUNPEOLABS-RELEASE-003-*.md`
- `.env.example`
- `.github/workflows/ci.yml`
- `.github/workflows/release.yml`
- `README.md`
- `app/layout.tsx`
- `app/privacy/page.tsx`
- `apphosting.yaml`
- `components/analytics-consent.tsx`
- `components/site-footer.tsx`
- `docs/operations/production-readiness.md`
- `docs/releases/v0.2.1.md`
- `lib/firebase-analytics.ts`
- `next.config.ts`
- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `scripts/validate-production-env.mjs`
- `styles/globals.css`
- `tests/e2e/analytics.spec.ts`
- `tests/e2e/privacy.spec.ts`
- `tests/e2e/smoke.spec.ts`
- `tests/unit/firebase-analytics.test.ts`

Constraints:

- Do not stage, commit, push, merge, tag, or deploy unrelated dirty-worktree
  content from `beaus-dev`.
- GitHub repository actions use authenticated GitHub account
  `phamhungptithcm`; Firebase/GA4 production actions use Google account
  `hunpeo97@gmail.com` and Firebase project `hunpeolabs-prod` only.
- Preserve explicit opt-in, fail-closed configuration, two-month retention,
  page views/history changes only, disabled Signals/user-provided data/Ads,
  denied ads personalization, and Internal Traffic in Testing with IP pending.
- Do not add secrets, contact-provider activation, custom events, User-ID, user
  properties, database/API/auth changes, or an active permanent traffic filter.
- Stop before promotion when a required local, PR, GitHub Release, Firebase, or
  live verification gate fails. Do not move an existing public tag or
  force-push shared history.
- Preserve `build-2026-08-04-001` as the runtime rollback target and `v0.2.0` as
  the source rollback target.

Approval evidence is limited to this exact plan and constraints. Any material
scope expansion requires a new delta approval.
