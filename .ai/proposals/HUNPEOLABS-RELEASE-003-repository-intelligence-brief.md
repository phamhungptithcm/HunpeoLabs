# Repository Intelligence Brief

## Gate Status

- CodeGraph: installed, healthy, current
- CocoIndex: installed, healthy, current
- Repository commit: `3d53e1b8201251cb28e02dbd2052ad36b1d67fec`
- Indexed commit: current working index verified on 2026-08-04
- Gate result: `READY`

## Task Context

- Business outcome: publish the already deployed consent-based Firebase Analytics
  implementation as a traceable GitHub source release and realign production to
  that exact tagged source.
- Request or work item: user request `Release sản phẩm` after completion of
  `HUNPEOLABS-ANALYTICS-002-v1`.
- Scope: an isolated patch release based on authoritative GitHub `main`, containing
  only the verified Analytics candidate plus release metadata.
- Constraints: do not publish the dirty `beaus-dev` checkout; preserve unrelated
  governance, product-page, Principles, Privacy, and other local WIP; use GitHub
  account `phamhungptithcm` for repository operations and Firebase account
  `hunpeo97@gmail.com` for production operations.

## Indexed Facts

- CodeGraph structural facts: Analytics is client-only and consent-gated through
  `app/layout.tsx`, `components/analytics-consent.tsx`, and
  `lib/firebase-analytics.ts`; consent helpers are covered by the Firebase Analytics
  unit test and consumed only by the consent UI.
- CocoIndex semantic/documentation facts: production readiness requires an exact
  reviewed source, Analytics owner checks, Firebase preflight, live verification,
  and immutable App Hosting rollback. The tag workflow requires reviewed release
  notes matching the tag.

## Source-Code Verified Facts

- Exact paths/sections opened: `.github/workflows/release.yml`,
  `scripts/verify-release-version.mjs`, `package.json`,
  `docs/releases/v0.2.0.md`, `apphosting.yaml`, the Analytics approval and
  completion report, and the isolated release candidate.
- Verified behavior: `v0.2.0` already exists and points to
  `e28331d79fc27842224192ef9f3397e6be80a8b3`; package version and tag must match;
  the release workflow creates the GitHub Release only after its validation job;
  production Analytics build `build-2026-08-04-001` is already verified and is the
  correct rollback target for this source release.

## Relevant Modules

- Module: Analytics client and consent UI.
- Why relevant: this is the only new runtime behavior in the patch release.
- Module: GitHub release workflow and release metadata.
- Why relevant: the existing workflow title is specific to `v0.2.0` and the
  version verifier rejects a new tag without a matching package version and notes.
- Module: Firebase App Hosting configuration and runbook.
- Why relevant: production must be redeployed from the exact tagged source after
  the GitHub release succeeds.

## Entry Points And Call Paths

- Entry point: root layout passes public Firebase configuration into
  `AnalyticsConsent`.
- Main callers/callees: consent UI parses configuration, reads or writes consent,
  and dynamically enables or disables Firebase Analytics.
- Downstream consumers: GA4 Web stream `G-7N5K4TXCTL`, only after explicit consent.

## Data Stores And Contracts

- Tables, views, migrations, or datafixes: none.
- APIs, events, schemas, or external contracts: browser local storage consent key,
  public Firebase Web App configuration, GA4 aggregate page-view measurement,
  Git tag/release, and Firebase App Hosting rollout.

## Related Specifications And ADRs

- Path: `docs/operations/production-readiness.md`
- Summary: defines Analytics privacy, production validation, deployment, and
  rollback boundaries.
- Path: `.ai/proposals/HUNPEOLABS-ANALYTICS-002-completion-report.md`
- Summary: records passed checks, production build, live Realtime evidence, and
  current limitations.

## Related Tests

- Existing tests: Firebase Analytics unit tests; Analytics, Privacy, core site,
  mobile, Firefox, and WebKit E2E coverage; deterministic release build.
- Missing regression tests: none required for unchanged runtime behavior; release
  workflow execution and live provider checks remain operational evidence.

## Potential Impact Areas

- Direct: source version, release notes, GitHub workflow title, Analytics client,
  consent UI, CSP, App Hosting environment, dependency lockfile, and tests.
- Indirect: GitHub Actions, public source history, Firebase build/rollout, and GA4
  Realtime traffic.
- Operational: a new tag and GitHub Release; a no-behavior-change App Hosting
  rollout from the exact tag.
- Security/data: no secrets, contact data, User-ID, custom events, Ads, Signals,
  or internal IP filter activation.

## Brainstorming Record

- Assumptions: the next stable patch is `v0.2.1`; the already verified Analytics
  candidate remains the intended product state.
- Unknowns: none that block planning. GitHub `main` is not branch-protected, so the
  plan adds a PR/CI review boundary rather than relying on direct push.
- Alternative solutions: commit without a tag would not create a product release;
  reuse `v0.2.0` is impossible and would rewrite published history; tag the current
  dirty checkout risks shipping unrelated WIP.
- Smallest safe solution: rebuild from `origin/main@e28331d`, apply only the exact
  verified Analytics content delta, add `v0.2.1` metadata, validate, merge through
  a scoped PR, tag, then deploy that tag.
- Potential long-term solution: make release titles derive from versioned release
  metadata and link App Hosting deployments directly to reviewed Git commits.
- Regression risks: accidental WIP inclusion, source/production drift, misleading
  release title, tag/version mismatch, or consent/measurement regression.
- Recommended direction: `HUNPEOLABS-RELEASE-003-v1`.

## Remaining Unknowns

- Unknown: internal IP/CIDR.
- How to resolve: keep the GA4 Internal Traffic filter in Testing; it is excluded
  from this release and is not a blocker.
