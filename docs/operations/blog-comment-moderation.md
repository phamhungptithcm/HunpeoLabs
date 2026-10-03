# Automatic blog comment moderation

Verified-email readers can publish ordinary comments immediately. Verification confirms control of the sign-in email, not that a reader is human or their content is safe. Existing same-origin, verified identity, length/honeypot validation and account/network or global rate limits remain in force. No AI or external moderation provider is called.

Policy version 1 holds comments when any of these apply:

- Same normalized text from the same account among its last 20 submissions within 24 hours, across posts. Editing the same comment is excluded from comparison. Normalization handles Unicode compatibility characters, whitespace, case and common invisible separators.
- At least two HTTP(S)/www links; accounts with three currently manually approved distinct comments and no active restriction can include two links, but three still require review.
- Narrow direct advertising phrases (buy/order now, guaranteed profit, earn money fast and Vietnamese equivalents).
- The account has a comment marked hidden/rejected under this policy. Restoring that comment through manual approval removes its restriction. Deleting a restricted comment preserves the history.

Safe edits remain public; suspicious edits return to pending, including removal of the whole root thread from the public count while its children remain stored. Every edit removes the trust credit for its previously reviewed content. Automatic approvals never earn trust credits. Moderator approval grants at most one credit per comment; repeat approvals do not add credits. Reports do not automatically hide content or penalize accounts; the moderator retains control. Normal deleted roots still expose approved replies.

The pending queue includes readable reasons visible only to authorized moderators. Public and own-comment responses omit UID, reputation, fingerprints and reasons; submission/edit responses return the resulting status. Reader and editor copy explains automatic checks and occasional review.

## Storage and operations

`blogCommentReputation/{SHA256(uid)}` is server-only under existing deny-all Firestore client rules. It stores counters and up to 20 fingerprints/comment IDs/timestamps, no email, network identity or duplicate comment text. Fingerprints older than 24 hours are ignored and pruned on the next create/edit; inactive accounts' stored records are not automatically deleted. Include these records in account erasure procedures. Existing moderation history is not backfilled; reputation starts with actions taken after this change.

Create/edit/moderation transactions atomically maintain reputation, comment status, parent approved-reply count and draft/published public count. Retried creates use the original account+operation ID; parallel submissions serialize on the account reputation document. Existing revision conflicts and permissions remain enforced. Failed transactions commit no partial changes. Version/reasons are stored with automatic decisions; edit audit events carry the decision version/reasons without comment text. No new composite index, migration or configuration is required. Existing pending comments remain pending until processed or edited.

Before rollout, run policy and isolated emulator tests and the existing CMS suite in its configured local Firebase environment. Observe pending reasons, false positives, moderator workload and reported missed spam before adjusting policy. This change has not been deployed or validated against live authentication/production data. Rollback by reverting the application change restores pending-on-create/edit; existing already approved comments remain published unless individually moderated. The new optional fields and reputation records do not break the old application.

## Limits

These deterministic heuristics can miss paraphrased spam, bare-domain advertising, or coordinated accounts, and can hold legitimate multi-link/reference comments. They do not perform malware URL reputation checks or assess general toxicity. The bounded history does not catch duplicates outside its last 20 entries/24-hour window. Manual override remains for exceptions. There is no claimed spam detection accuracy or production workload reduction. Turnstile or provider moderation would need a separate scoped integration.

Local tests:

```sh
pnpm exec vitest run tests/unit/comment-moderation.test.ts
BLOG_COMMENT_EMULATOR=true FIRESTORE_EMULATOR_HOST=127.0.0.1:18082 pnpm exec vitest run tests/unit/comment-moderation-emulator.test.ts
```

The second command requires an isolated emulator for `demo-hunpeolabs-comment-auto-037`, never a production or shared data reset.
