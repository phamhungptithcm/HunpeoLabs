# Blog reliability

## Scheduled publication
App Hosting runtime sets BLOG_SCHEDULER_SERVICE_ACCOUNT and BLOG_SCHEDULER_AUDIENCE. Cloud Scheduler calls the worker each minute with Google OIDC. Tokens must match the configured audience and exact verified service-account email. The account requires no Firestore role: the App Hosting server retains its existing database identity.

A schedule pins a saved revision. The worker rechecks the Google user and current publisher/admin grant; missing permission or a changed draft stops publication and records a visible failure. Publication and queue removal share a transaction and an idempotent receipt. Cancellation or replacement invalidates the old operation. Transient failures leave jobs queued for the next minute. Due-time precision is roughly a minute plus processing/retry latency; exact-second delivery is not guaranteed.

## Abuse limits
Production explicitly uses BLOG_RATE_LIMIT_MODE=global. Account limits remain five comments per ten minutes. All readers also share a conservative cap of thirty comment submissions per hour; other supported actions share one hundred per hour. Caller-supplied IP headers cannot change this shared budget. This deliberately trades capacity for safety until a trusted network identity is verified. Do not switch to an arbitrary forwarded header.

## Editor recovery
The editor retains an unsaved local draft keyed by verified viewer UID and post ID, with a seven-day validity window. Recovery is explicit; invalid, oversized or expired backups are ignored. A changed server revision blocks autosaving recovered content: copy it and compare with the current server draft. A successful save without concurrent edits removes the backup. Local storage is optional and may be unavailable; server autosave and unload warnings still apply. Local backups are device-local and are not a cross-device backup service.

## Evidence boundaries
Unit and Firestore emulator checks cover validation, rate budgets, concurrent scheduled publication, cancellation/version conflicts, and moderation privacy. They do not prove rendered editor interactions, live Google user sessions, image uploads, or real production publication. Production scheduler activation must additionally have provider execution evidence. Do not create a real public canary without separate publication authorization.
