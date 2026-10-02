# Production Release Plan

Plan ID/version: `HUNPEOLABS-RELEASE-002-v1`

Status: Approved in the current Codex task

## Outcome

Publish the complete reviewed website work as stable release `v0.2.0`, push the
exact release commit to GitHub `main`, create a GitHub tag and release, deploy
that same source revision to Firebase App Hosting production, and verify the
live site.

## Approved release scope

- All intentional tracked and untracked application source, tests,
  configuration, public media, product documentation, design evidence, and
  approval records currently present in the repository worktree.
- Release metadata for `v0.2.0`.
- Production configuration hardening needed to exclude local output from the
  release and Firebase source archive.

## Explicit exclusions

- `output/`, `.next/`, `playwright-report/`, `test-results/`, `.lighthouseci/`,
  coverage, caches, local environment files, credentials, tokens, and secrets.
- Contact-provider activation or any new production secret.

## Release sequence

1. Set package and documentation version to `0.2.0`.
2. Run lint, typecheck, unit, production build, browser, Lighthouse, Firebase
   preflight, and repository-intelligence gates.
3. Review the staged file list and confirm excluded artifacts are absent.
4. Create one Conventional Commit and push its exact SHA to GitHub `main`.
5. Create and push annotated tag `v0.2.0`.
6. Require the GitHub release workflow and published release to succeed.
7. Deploy the tagged source revision to Firebase App Hosting backend
   `hunpeolabs` in project `hunpeolabs-prod`.
8. Verify the rollout, canonical site, backend origin, critical routes, health,
   indexing files, and production Principles experience.

## Risk and rollback

- Application risk is limited to public website behavior; there is no database
  or persistent application state.
- Contact delivery remains disabled.
- Source rollback is `v0.1.0`.
- Runtime rollback uses the previous successful Firebase App Hosting rollout.

## Approval evidence

The user explicitly requested “commit và push và release production tao tag,
release note...” and then confirmed the release scope as “toàn bộ code”.
