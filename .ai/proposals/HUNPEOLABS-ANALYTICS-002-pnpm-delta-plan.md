# Firebase Dependency Build-Script Delta Plan

Plan ID/version: `HUNPEOLABS-ANALYTICS-002-PNPM-DELTA-v1`

Status: APPROVED in the current Codex task on 2026-08-04 by explicit user
message `Approved HUNPEOLABS-ANALYTICS-002-PNPM-DELTA-v1`.

## Evidence

The isolated Analytics candidate adds `firebase@12.17.0`. With the repository's
declared `pnpm@11.9.0`, dependency installation requires an explicit decision
for two newly introduced transitive install scripts:

- `@firebase/util@1.15.2` writes optional Firebase auto-initialization defaults
  into its installed package. The application supplies and validates its own
  explicit public Web configuration, so this mutation is not required.
- `protobufjs@7.6.5` only checks a dependency version convention and may print a
  warning. It does not build an artifact needed by this application.

Without an explicit policy entry, pnpm reports `ERR_PNPM_IGNORED_BUILDS`; the
production App Hosting dependency install therefore cannot be treated as
release-ready.

## Smallest Safe Change

Add only these two deny entries to the candidate's existing
`pnpm-workspace.yaml` `allowBuilds` map:

```yaml
'@firebase/util': false
protobufjs: false
```

This keeps dependency lifecycle scripts fail-closed, avoids install-time
network/config mutation, and leaves the already approved Firebase runtime
integration unchanged. Re-run frozen/offline install evidence, lint,
typecheck, unit tests, Analytics/Privacy E2E, and the production build after the
change.

## Scope And Rollback

The only additional release path is `pnpm-workspace.yaml`. No application code,
GA4 setting, dependency version, Git state, or production resource changes.
Rollback remains immutable App Hosting build `build-2026-07-30-001`.

## Exact Approval Requested

Approve `HUNPEOLABS-ANALYTICS-002-PNPM-DELTA-v1` to add the two explicit
`allowBuilds: false` entries above to the isolated release candidate, validate
the resulting dependency installation, and continue the already approved
deployment workflow.

## Approval Record

Approved paths: the isolated release candidate's `pnpm-workspace.yaml` only,
plus this evidence record. Approved values are exactly
`'@firebase/util': false` and `protobufjs: false`. The same user message also
accepted the scoped, existing Next.js dependency risk for this Analytics
rollout; it did not approve a dependency upgrade or vulnerability remediation.
