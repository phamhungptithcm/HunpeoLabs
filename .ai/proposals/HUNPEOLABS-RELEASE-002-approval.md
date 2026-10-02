# Implementation Approval Record

Plan ID/version: HUNPEOLABS-RELEASE-002-v1

Repository intelligence gate status: READY

Approval status: APPROVED

Approver: User in the current Codex task

Approval timestamp or task reference: Current Codex task on 2026-07-29

Approval evidence: The user explicitly requested “commit và push và release
production tao tag, release note...” and confirmed the intended repository
scope with “toàn bộ code”.

Approved scope:

- Prepare and verify stable website release `v0.2.0`.
- Include all intentional source, configuration, tests, public media,
  documentation, design evidence, and governance records in the current
  worktree.
- Push the exact release commit to GitHub `main`.
- Create the `v0.2.0` tag and GitHub Release from reviewed release notes.
- Deploy the exact release source to Firebase App Hosting backend `hunpeolabs`
  in project `hunpeolabs-prod`.
- Verify GitHub, Firebase, canonical production routes, and rollback evidence.

Approved paths:

- `.ai/proposals/**`
- `.firebaserc`
- `.github/workflows/*.yml`
- `.gitignore`
- `README.md`
- `app/**`
- `apphosting.yaml`
- `components/**`
- `content/**`
- `docs/**`
- `firebase.json`
- `next-env.d.ts`
- `next.config.ts`
- `package.json`
- `playwright.config.ts`
- `pnpm-workspace.yaml`
- `public/**`
- `scripts/**`
- `styles/**`
- `tests/**`

Constraints:

- Exclude local output, build caches, reports, environment files, credentials,
  tokens, and secrets.
- Keep contact delivery disabled.
- Do not add a runtime dependency, database migration, secret, or production
  data change.
- Stop the release if any required quality, GitHub, Firebase, or live
  verification gate fails.
