# HUNPEOLABS-CONTACT-001 — Contact form completion

Status: Awaiting human approval. No application edits made.

## Verified evidence
Repository Intelligence Gate READY: CodeGraph and CocoIndex current and healthy. CodeGraph locates ProjectBriefForm and its ContactPage caller. CocoIndex locates the delivery contract and apphosting.yaml omission. Source verified in components/project-brief-form.tsx, app/contact/page.tsx, lib/contact.ts, app/api/contact/route.ts, tests/unit/contact.test.ts, tests/e2e/site.spec.ts, docs/operations/production-readiness.md and apphosting.yaml.
The form disables submission without four reviewed webhook configuration values. Hosting explicitly omits these. The public email link already points to support@hunpeolabs.com. No mailbox receipt has been verified.

## Recommended scope
Enable the form to prepare an email to the existing public contact address when server delivery is unavailable. The button must say “Continue in email”; after validation, open an encoded mailto containing name, reply email, company, project type and brief. Clearly state that the visitor must send from their email app. Do not claim delivery or clear entered values. Provide a copy-brief action and direct email link for visitors without an email handler. Keep configured webhook submission working, with a fallback email option on failure. No new provider, dependency, database, secret, deployment or automatic outgoing email.

## File/function plan
- components/project-brief-form.tsx: submitBrief email fallback, bounded inputs consistent with server contract, accurate states, copy fallback and email link; preserve webhook behavior.
- app/contact/page.tsx: pass canonical public contact email and replace configuration-oriented visitor copy with practical contact instructions.
- lib/contact-email.ts (new, browser-safe): deterministic plain-text brief and encoded mailto builder, separate from server crypto module.
- tests/unit/contact-email.test.ts (new): encoding, special characters, content boundaries.
- tests/e2e/site.spec.ts: update disabled-form expectations; validate fallback, retained input, copy and configured success/error paths with intercepted requests.
- docs/operations/production-readiness.md: document email handoff limitations and unchanged server configuration gate.

## Impact and risk
Medium: visitor contact details are handed to their local email application on explicit submit or clipboard on explicit copy; no new server storage or logging. Mailto support and URL size vary across email clients, so copying the brief remains available. Existing webhook security controls remain intact. No provider receipt, live inbox or production readiness claims. Preserve unrelated dirty worktree changes.
Alternative: automatic server email delivery requires a chosen verified provider, credentials, sender domain, retention policy and separately approved integration scope. Email handoff is the smallest useful change with existing verified public contact information.

## Validation and completion
Read installed Next.js guides and matching TypeScript/frontend quality profiles before implementation. Run focused unit tests, lint, typecheck and relevant desktop/mobile browser checks. Perform the mandatory fresh final implementation review and record review cycles and completion evidence. No deployment or external test email in this scope. Rollback only scoped edits without reverting existing WIP.
