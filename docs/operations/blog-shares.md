# Article sharing actions

Approved in the current Codex chat on 2026-10-02. Public metadata displays a small shares total after the views component. Counts start at rollout; no historical totals are fabricated.

## Metric

Count deliberate selection of Facebook, LinkedIn, X or Email, successful clipboard copying, and a resolved navigator.share call. Merely opening the Share dialog, a rejected clipboard operation, or rejected/cancelled device API calls do not count. Top, bottom and sidebar controls all use the article's stable ID. Previews pass no ID and never record.

This measures website actions, not confirmed social publication or unique people. Email/social links have no publication callback. Device API resolution semantics differ by platform and do not prove delivery or posting. Successful copied links count even if never pasted. External/public share totals outside these controls are unavailable. Tooltip explains the metric.

## Storage and API

GET /api/blog/shares?postId=ID returns only {shares} for a published article. POST accepts exactly {postId,eventId,channel}; ID and UUID bounded, six channels allowlisted, body limited to 1 KiB. Existing sameOrigin requires exact configured origin and x-blog-request=1. Client Firestore rules remain deny-all.

blogPostShares/{postId} holds the aggregate independently of blogPostStats view-counter writes and publication snapshots. blogShareEvents/{HMAC(postId:eventId)} holds only expiresAt. Each action has a new random ID; identical retry requests use the same receipt. One transaction checks published status, receipt expiry and aggregate before writing; concurrent identical requests increment once. Changing channel on an existing event does not count again. Expired receipts can count again after 24 hours, regardless of TTL cleanup delay. Invalid/overflow counts fail closed rather than overwrite statistics.

Network HMAC limits recording to 60 requests per ten minutes. Production requires BLOG_RATE_LIMIT_SECRET and BLOG_TRUSTED_IP_HEADER overwritten at trusted ingress. Raw network addresses, raw event IDs, names, account IDs and emails are never retained by share stats. This does not prove the client really completed a share; rate limits bound abuse rather than eliminate it. GETs incur reads; duplicate POSTs still incur limiter writes and transaction reads. No new dependencies or real-time listeners.

## Failure and lifecycle

Sharing remains immediate: anchors retain normal navigation, telemetry uses keepalive and a ten-second timeout without awaiting it. Copy success is shown before best-effort recording. Device API rejection/cancellation is handled before telemetry. When stats fail, the action succeeds but the total may undercount. Failed initial reads hide share text only; article/views continue independently. Local update events refresh the matching article counter. A maximum rule prevents a slow GET or out-of-order action response from moving displayed totals backward. Abort and listener cleanup protects navigation.

## Production and rollback

No production deployment or database mutation authorized or performed. Operator must verify exact-origin ingress and secret configuration, Firestore budget and contention, privacy requirements and TTL on blogShareEvents.expiresAt. Without TTL, expired receipts accumulate. No backfill, new rules, IAM or index changes needed for document lookups. Popular posts may need separately approved distributed counters. Rollback by removing the BlogShares mount and postId from BlogShare invocations; preserve aggregate data unless separately authorized.

## Local validation

Tests use an isolated cached Firestore emulator at 127.0.0.1:18081, demo-hunpeolabs-blog-shares-031, and local app 127.0.0.1:3143. Social navigation is prevented and clipboard/device outcomes are mocked; no email/social messages sent. Server transactions and HTTP routes run against the actual emulator. Browser coverage includes all four network choices, copy/device success, rejected/cancelled operations, dialog-only exclusion, all three control locations, reload, mobile/desktop screenshots, six concurrent duplicate events, input/origin/body bounds, network failure and slow-response races. Unit coverage adds expiry, configuration, throttling/database errors, corrupt/overflow counters, and unchanged view stats. Local evidence does not verify live social posting, production ingress or deployed behavior.

Latest validation, 2026-10-02: 13 focused share-counter unit tests passed within 133 full-workspace passing tests (one pre-existing skip). Four browser/emulator scenarios passed in 12.8 seconds. Typecheck and scoped/full ESLint passed with one unrelated pre-existing warning. Both supported webpack compilation and the original pnpm build (Turbopack) passed. Turbopack initially replayed a cached sandbox port failure; the generated build cache was preserved under the ignored task evidence directory and the original build passed with fresh cache. No source or build configuration was changed for this recovery.
