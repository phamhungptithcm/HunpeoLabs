# Analytics Patch Release Change-Impact Plan

Plan ID/version: `HUNPEOLABS-RELEASE-003-v1`

Status: `APPROVED — user confirmed in the current Codex task on 2026-08-04`

## Repository Intelligence Gate

- CodeGraph status: installed, healthy, current
- CocoIndex status: installed, healthy, current
- Repository commit: `3d53e1b8201251cb28e02dbd2052ad36b1d67fec`
- Indexed commit: current working index verified on 2026-08-04
- Brief path or summary:
  `.ai/proposals/HUNPEOLABS-RELEASE-003-repository-intelligence-brief.md`

## Problem Statement And Business Outcome

Consent-based Firebase Analytics is live and verified in Firebase App Hosting,
but GitHub `main` and the latest GitHub Release remain at `v0.2.0` without the
Analytics source. Publish a traceable patch release whose tagged source matches
the production product, without absorbing unrelated dirty-worktree changes.

## Current Behavior And Verified Execution Flow

- GitHub `main`, tag `v0.2.0`, and the latest GitHub Release resolve to
  `e28331d79fc27842224192ef9f3397e6be80a8b3`.
- Production runs verified Analytics build `build-2026-08-04-001`, reconstructed
  from `build-2026-07-30-001` plus the approved Analytics-only delta.
- The local branch is `beaus-dev` at `3d53e1b...` with extensive unrelated tracked
  and untracked WIP; it is not a release source.
- GitHub CLI is authenticated as `phamhungptithcm`, which matches repository owner
  `phamhungptithcm/HunpeoLabs`. Firebase production actions remain restricted to
  `hunpeo97@gmail.com` and project `hunpeolabs-prod`.

## Root Cause Or Capability Gap

`HUNPEOLABS-ANALYTICS-002-v1` explicitly excluded Git commit, push, tag, and
release. A new stable tag also requires a package version and reviewed release
notes that do not yet exist.

## In Scope

- Prepare `v0.2.1` from a clean isolated worktree based on authoritative
  `origin/main@e28331d79fc27842224192ef9f3397e6be80a8b3`.
- Apply only the content-changing paths from the verified Analytics candidate.
- Bump `package.json` to `0.2.1`, add `docs/releases/v0.2.1.md`, and make the
  GitHub Release title version-neutral so it is not mislabeled as `v0.2.0`
  Product Stories and Principles.
- Create scoped release approval/completion evidence.
- Validate, commit, push an `agent/analytics-v0.2.1` branch, open a ready-for-review
  PR, require green CI, merge to `main`, create and push annotated tag `v0.2.1`,
  require the Release workflow and GitHub Release to succeed, deploy the exact tag
  to Firebase App Hosting, and verify GitHub/Firebase/live/GA4 evidence.

## Out Of Scope

- Every unrelated change currently present on `beaus-dev`.
- AI Agent Kit migration and its generated adapters or governance drift.
- New product, Principles, Privacy, contact, content, design, media, or dependency
  work beyond the already verified Analytics candidate.
- Google Ads, Signals, user-provided data, audiences, key events, custom events,
  User-ID, user properties, active internal traffic exclusion, or IP discovery.
- Database, API, authentication, contact-provider, secret, or production-data
  changes.

## Change Area Boundary

Runtime/source delta copied from the verified Analytics candidate:

- `.env.example`
- `.github/workflows/ci.yml`
- `README.md`
- `app/layout.tsx`
- `app/privacy/page.tsx`
- `apphosting.yaml`
- `components/analytics-consent.tsx`
- `components/site-footer.tsx`
- `docs/operations/production-readiness.md`
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

Release-only delta:

- `.github/workflows/release.yml`
- `docs/releases/v0.2.1.md`
- `.ai/proposals/HUNPEOLABS-RELEASE-003-*.md`

## Impact Boundary

- Application: optional client Analytics after explicit consent.
- Dependency: pinned `firebase@12.17.0`, already installed, tested, deployed, and
  accepted under the scoped existing Next.js dependency risk statement.
- CI/release: validates Analytics tests and publishes the matching stable tag.
- Production: a new immutable App Hosting build with the same verified runtime
  behavior plus source version/release metadata.

## Areas Requiring Developer Review Before Touching

- Any candidate difference outside the explicit paths above.
- Any dependency/version change other than package version `0.2.1` and the already
  approved pinned Firebase dependency.
- Any CI, release, Firebase, GA4, or live verification failure.

## Reason No Other Area Is Changed

The isolated candidate/content audit found the listed paths are the complete
Analytics content delta from `origin/main`; all other apparent candidate
differences were timestamps or excluded build/dependency artifacts.

## Proposed Solution

1. Create a clean isolated Git worktree from the fetched authoritative `main` SHA.
2. Reconfirm the candidate manifest SHA-256
   `7f564c3df2dd4ffd6a17658b30c531dfca7b87b7d07f63f375d653928697eeeb`.
3. Copy only the explicit Analytics paths and audit the resulting diff.
4. Prepare `v0.2.1` package/release metadata and a generic release workflow title.
5. Run approval validation, dependency install with scripts disabled, release and
   application checks, and the mandatory final implementation review.
6. Commit only explicit paths, push the scoped branch, open a ready PR, and merge
   only after required checks pass.
7. Tag the merge commit `v0.2.1`; require the tag Release workflow and published
   GitHub Release to succeed.
8. Deploy that exact tag source to App Hosting and verify rollout metadata, live
   routes/security/privacy, consent behavior, and Realtime receipt.

## Alternatives And Trade-Offs

- Reuse or move `v0.2.0`: rejected because it rewrites an existing public release.
- Tag the dirty checkout: rejected because it includes unrelated unreviewed WIP.
- Publish GitHub only and leave the current Firebase source: smaller operational
  change, but preserves source/deployment drift.
- Recommended exact-tag redeploy: one additional App Hosting build, but provides
  authoritative source parity and a clean rollback boundary.

## Expected File/Module/Class/Function Changes

- Analytics implementation: no new behavior beyond the verified candidate.
- `package.json`: version `0.2.0` to `0.2.1`; retain pinned toolchain and dependency
  versions.
- `.github/workflows/release.yml`: use a stable generic release title while keeping
  tag validation and reviewed-notes publishing unchanged.
- `docs/releases/v0.2.1.md`: document consent, measurement boundary, validation,
  compatibility, costs, and rollback.
- Release proposal records: preserve approval and completion traceability.

## Callers, Consumers, Contracts, Data, And Integrations

- Browser consent UI and local-storage preference remain the only activation path.
- GA4 receives aggregate page views only after opt-in.
- No contact-form fields, query values, free text, identifiers, or custom events
  are added.
- GitHub Actions consumes the tag, package version, and release-note path.
- Firebase App Hosting consumes the exact reviewed source archive.

## Existing Behavior To Preserve

- All `v0.2.0` public pages, product stories, Principles, contact fail-closed
  behavior, security headers, SEO/indexing files, and runtime health.
- Analytics remains fail-closed for missing/invalid config and before consent.
- Two-month retention, page views/history changes only, ads personalization denied,
  Signals off, Ads links absent, and internal filter Testing/pending.

## Security, Privacy, Transaction, Concurrency, And Data Integrity

- Public Firebase Web configuration is validated but is not a secret.
- No secrets or credentials enter Git history, logs, release notes, or deployment
  source.
- No persistent server data, transactions, migrations, or concurrency-sensitive
  flows are introduced.
- Consent revocation must stop subsequent collection in the controlled browser.

## Performance And Capacity

Firebase Analytics remains dynamically loaded only after consent. App Hosting
runtime limits remain unchanged. GA4 itself has no separate charge; Firebase App
Hosting remains on Blaze and may incur usage charges beyond its no-cost quotas.

## Backward Compatibility

Patch release with no API, route, database, or persisted application-state break.
Browsers without consent retain the pre-Analytics behavior.

## Failure, Timeout, Retry, And Rollback

- Stop before tag creation if local, PR, or main CI fails.
- If tag validation fails transiently, rerun the failed workflow; do not move or
  overwrite the published tag.
- If a non-transient defect is found after tagging, fix forward with a new patch
  version rather than rewriting `v0.2.1`.
- If deployment or live verification fails, retain or roll back to verified
  Analytics build `build-2026-08-04-001`.
- Source rollback remains GitHub `v0.2.0`; do not delete releases or force-push.

## Test And Regression Strategy

- Repository Intelligence Gate and implementation approval validator.
- `pnpm install --frozen-lockfile --ignore-scripts`.
- `pnpm release:build v0.2.1`.
- Analytics unit tests and `pnpm test:e2e:analytics`.
- `pnpm check`.
- Production Chromium desktop/mobile E2E and Firefox/WebKit smoke coverage.
- Lighthouse CI and `pnpm firebase:preflight`.
- Candidate diff/secret/excluded-artifact audit.
- Mandatory fresh final implementation review after fixes.
- GitHub PR CI, tag Release workflow, release/tag/SHA verification.
- Firebase rollout/build/source verification, critical live routes, security
  headers, consent allow/revoke, and controlled GA4 Realtime verification.

## Detected Stack And Quality Profiles

- Languages and versions: TypeScript 6.0.3, JavaScript/ES modules, YAML, Markdown.
- Application/platform/domain: public Next.js marketing website, GitHub Actions,
  Firebase App Hosting, Google Analytics for Firebase/GA4.
- Frameworks and runtimes: Next.js 16.2.12, React 19.2.8, Node.js 24+.
- Build tools and package managers: pnpm 11.9.0, Vitest 4.1.10, Playwright 1.62.0,
  Lighthouse CI.
- Selected `.ai/quality-profiles/`: universal, TypeScript/JavaScript, frontend
  HTML/CSS, web app, DevOps, infrastructure, SEO/GEO.
- Code-quality checks required after implementation: lint, typecheck, unit, build,
  browser regression, release workflow, production preflight, and final review.

## Code Quality Risks To Review

- Preserve lazy client-only initialization and dependency-failure handling.
- Preserve CSP and public environment validation.
- Ensure no duplicate automatic/manual page-view collection.
- Ensure release title, notes, package version, tag, commit, and deployed source
  resolve to the same release identity.
- Ensure the source diff contains no WIP, build output, credentials, reports, or
  local caches.

## Documentation, Specification, And Diagram Updates

Add `docs/releases/v0.2.1.md` and the release approval/completion records. Update
the release workflow title only; no architecture diagram change is needed.

## Deployment Or Migration Steps

No database migration. Merge reviewed source, tag the exact merge SHA, wait for
the GitHub Release workflow, deploy that tag source to Firebase App Hosting
backend `hunpeolabs` in project `hunpeolabs-prod`, then record rollout/build/source
and rollback evidence.

## Assumptions, Unknowns, And Risks

- Assumption: `v0.2.1` is the intended next stable version.
- Unknown: internal IP/CIDR remains pending and excluded.
- Risk: App Hosting build/runtime may incur charges under the existing Blaze plan.
- Risk: GitHub `main` has no branch protection; the scoped PR and explicit SHA
  checks provide the release boundary for this task.

## Approval Decision Requested

Approve `HUNPEOLABS-RELEASE-003-v1` to authorize the exact file scope, package
version `0.2.1`, clean release branch/PR/merge, annotated tag `v0.2.1`, GitHub
Release, exact-tag Firebase App Hosting redeploy, and post-release verification.

Approval phrase:

`Approved HUNPEOLABS-RELEASE-003-v1`
