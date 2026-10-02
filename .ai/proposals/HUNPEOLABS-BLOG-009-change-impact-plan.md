# HUNPEOLABS-BLOG-009 v1 — In-page account and Google sign-in

Status: PENDING human approval. No protected application edits made.
User goal: click Tài khoản to open a dialog with blurred background; complete
authentication through a working session without sending the reader to a separate page.

## Repository intelligence brief and current evidence

HEAD 3d53e1b8201251cb28e02dbd2052ad36b1d67fec; extensive unrelated WIP retained.
Initial gate DEGRADED: both indexes stale, both health checks passed. One bounded
refresh completed. Planning conclusions verified by targeted source reads.

- `app/resources/blog/page.tsx`: Tài khoản link navigates to /blog-account.
- `components/blog-comments/comments.tsx`: unsigned comment flow links to that
  same page; reader session inferred from authenticated own-comment request.
- `components/blog-admin/login.tsx`: initializes Firebase Auth, launches Google
  popup in click gesture, exchanges token via POST /api/blog/session, clears SDK
  credentials, then navigates to account or Studio.
- `components/blog-admin/account.tsx`: greeting, staff Studio link and logout.
- `components/blog-admin/dialog.tsx`: native showModal dialog, close/Escape and
  existing blur backdrop; suitable reusable pattern.
- `lib/blog/firebase-client.ts`: in-memory Firebase persistence, guarded demo
  emulator support. Server auth verifies Google claims/revocation and role.
- `app/api/blog/session/route.ts`: same-origin mutation checks, recent Google
  auth, rate limit, HttpOnly session cookie, server-authoritative access, logout.
- `next.config.ts`: only separate login/account routes currently receive exact
  Firebase frame/connect allowlist and same-origin-allow-popups. Blog modal needs
  equivalent scoped popup compatibility; global security must remain intact.
- Current preview :3120: blog HTTP 200; anonymous session GET HTTP 401 as expected.
- Current read-only production preflight: Firebase CLI 14.19.1; authentication /
  project discovery failed; App Hosting availability unverified. This does not
  prove resources absent or real Google sign-in functional.
- Shell env validator returned Blog disabled; this is shell-only, not evidence
  that the running preview lacks its own environment configuration.

## Risk and scope

High-risk category because the flow touches authentication and browser security
headers. Existing server identity, permission, CSRF, cookies and rate-limit
contracts remain authoritative. No new login provider, membership entitlement,
password flow, dependencies or schema. Production deployment/IAM/billing/secret
changes excluded. Real Google account selection is performed by the human in
the Google popup; no collection of passwords, codes or token values in reports.

## Concrete implementation

1. New `components/blog-account-dialog.tsx`: client trigger opens reusable native
   BlogDialog; read session with GET /api/blog/session, distinguish anonymous
   from service failure, show login or account state without route navigation.
   Support backdrop blur, close button/Escape, focus return, scroll containment,
   responsive layout and reduced motion. Do not treat failed auth service as a
   successful session or expose email/UID unnecessarily in public UI.
2. `components/blog-admin/login.tsx`: reusable embedded presentation and success
   callback; retain standalone/admin defaults. Successful embedded login reads
   back the actual server session, updates account state and closes the dialog
   while preserving current URL, scroll and draft. Failures remain retryable;
   popup cancellation, block, provider errors and session failure visible.
   Closing/unmounting during an attempt must not cause stale UI mutation.
3. `components/blog-admin/account.tsx`: embedded account/logout behavior using
   callbacks while preserving standalone presentation and staff access checks.
4. `app/resources/blog/page.tsx`: replace the account-page link with dialog trigger.
5. `components/blog-comments/comments.tsx`: same dialog for unsigned composer;
   on authenticated success refresh signed/private state without dropping draft.
6. `styles/blog-design.css`: scoped compact account dialog and blur backdrop,
   readable desktop/mobile layout, 44px controls, no global styling changes.
7. `next.config.ts`: exact existing auth headers on /resources/blog and its article
   routes, preserving CSP allowlists and all unrelated routes/headers. Update
   header contract tests where existing tests assert old route behavior.
8. `tests/e2e/blog-google.spec.ts`, new `tests/e2e/blog-account-dialog.spec.ts`, and
   applicable existing `tests/unit/*.test.ts` security-header tests: verify dialog
   URL preservation, focus/Escape/blur, busy/retry/error states, authenticated
   readback, reload/session persistence, logout, reader/staff distinction,
   composer draft retention, stale-session failure and desktop/mobile behavior.
9. `docs/operations/blog-runbook.md`: scoped auth-header and real-provider setup /
   acceptance steps; task evidence in `.ai/proposals/HUNPEOLABS-BLOG-009-*`.

## Verification and live acceptance

Read matching bundled Next.js documentation and TypeScript/frontend/motion/
security profiles before edits. Run focused lint, full typecheck, relevant unit
contracts and browser modal checks. Use existing isolated demo Firebase emulators
for actual SDK credential/session exchange, not a fabricated success screen.
Retest existing standalone admin login and server authorization boundaries.
Run mandatory final implementation review and record cycles/findings.

Real Google acceptance requires an authenticated Firebase operator context and
verified matching project, Google provider, Firebase authorized domains, OAuth
origins/handler and runtime environment. Do read-only discovery first. If CLI
auth remains unavailable, report exact human action (`firebase login --reauth`)
and preserve that gate as BLOCKED. Do not infer or print credentials. Any concrete
production/provider configuration mutation needs its own reviewed scope before
execution. After prerequisites are available, human completes Google popup and
agent verifies authenticated session readback, refresh persistence and logout
without reporting raw identity tokens or private data.

## Trade-offs, preserved behavior and rollback

Use existing popup/session system and native dialog instead of a new auth stack.
Google popup remains a provider window; website login/account no longer replaces
the reader page. Existing /blog-account and /admin/blog/login remain available
as direct-entry fallback. A confirmed account session alone must not grant Studio
rights. Runtime security configuration changes are limited to blog auth-enabled
surfaces. Preserve navbar NAV-002 and all unrelated WIP. Rollback task hunks only.
Local/emulator success does not establish live Google acceptance or production
readiness; final status cannot claim the whole user goal complete until actual
Google sign-in is verified.

## Approval requested

Approve BLOG-009 v1 application, scoped auth-header, regression-test and document
changes above. No production deployment, secret/IAM/billing changes authorized.
