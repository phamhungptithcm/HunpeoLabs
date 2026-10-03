# CMS readiness delta — HUNPEOLABS-CMS-008-v1

Status:APPROVED. Risk:HIGH (abuse policy, operational retention and live Auth).
Base: maincd2efa9 / releasedv3.0.0. Implementation authorized by direct owner reply.
Original RELEASE004 approval remains valid. User chose complete CMS before deployment.

## Verified facts and corrected evidence

Repository intelligenceDEGRADED; bounded source/Git/provider evidence used.
CMS flagtrue, no trusted header; requestLimits consumes UID then throws503.
Callers: Google session creation, comment create/edit and comment reports.
Source correction: comment deletion has no limiter call; existing authorized deletion
and logout behavior remain unchanged so quota exhaustion does not prevent removal.
Existing network key uses entire selected header, so raw client-supplied XFF is unsafe.
Cloud Run ingressall is not sufficient proof of bypass: current anonymous direct
health GET returns403; resource IAM policy has no public-invoker binding.
Do not change provider-managed ingress/IAM or infer exact IP hop semantics.
App Hosting load balancer/CDN is managed; no verified client-IP overwrite contract
has been established for this application's header selection.

## Proposed smallest application change

Use an explicit identity-global mode for CMS throttling without IP dependence.
Retain current UID caps: comments5 per10m, sessions/reports30 per10m.
Add shared action caps matching existing network cap values: comments30 perhour,
sessions/reports100 perhour across the whole site. This is more restrictive in
total allowed volume; changing headers/IPs/accounts cannot increase that cap.
Consume UID+shared buckets atomically in one Firestore transaction so an exhausted
bucket never partly consumes another budget. Retain HMAC secret, TTL24h,429 and
fail-closed503 on missing secret/mode/provider failure. Do not log IDs, token or IP.
No reliance on XFF/X-Real-IP/Host/forwarded headers and no IP pseudonyms stored in
this mode. Preserve Google-only identity, same-origin guard, session revocation,
editorial roles and private-media authorization.

Trade-off requiring explicit owner approval: one action's shared budget can be
exhausted by authenticated abuse, temporarily denying legitimate users. This
protects total application activity/cost but sacrifices some availability; it is
not a DDoS or direct Firebase Auth-endpoint protection. Do not silently raise limits.
A later verified edge-specific limiter can be separately designed if traffic needs it.

## Exact files / tests

- lib/blog/rate-limit.ts: typed action policy, atomic composite consumption and
  explicit mode; retain old behavior only under explicitly configured verified
  trusted-ingress mode, never guessed fallback.
- apphosting.yaml/.env.example: set documented identity-global mode; Secret
  Manager version1 runtime-only; existing project/bucket/capacity unchanged.
- scripts/validate-blog-env.mjs and validate-firebase-production.mjs: require
  mode+secret, conditionally require trusted header only for ingress mode; unknown
  modes fail closed. No production env or secret values printed.
- tests/unit/blog-rate-limit.test.ts, firebase-preflight.test.ts and focused
  emulator concurrency checks: budget boundaries, atomicity/retry, spoof headers
  cannot change key/budget, malformed input, missing mode/key, denied writes and
  database failures. Update CMS E2E fixtures only where mode explicitly required.
- docs/operations/blog-runbook.md and production-readiness.md: new policy,
  limits, availability risk, exact scopes and corrected direct403 evidence.
- Fresh review/report records. No unrelated UI/auth/dependency changes.

## Operations requiring owner decisions / approval

Approve the existing RELEASE004 monitoring proposal: public HTTPShealth every300s,
valid TLS/HTTP200/JSONok, alert on two failing regions for300s, recipient already
confirmedhunpeo97@gmail.com; bounded provider charges, no new application payload logs.

Proposed retention: revisions90d; moderation audit180d; orphan private media30d;
rate-limit<=24h. Daily Firestore backup retention14d; targetRPO24h/RTO24h as an
initial proposal. Verify provider/storage/Auth coverage separately: Firestore backup
does not include Storage or Firebase Auth. No destructive retention cleanup is
authorized by this plan; accepting policy alone does not delete private data.

Prepare a protected cloud-only recovery destination and controlled synthetic
CMS acceptance/restore scope covering access policy/revocation, revisions, media
and Auth/session behavior. No production PII/token/Auth export to local files,
Git or logs. No restore into the live database; no production seed reset; no
public synthetic articles. Stop if meaningful DR needs unrelated IAM/billing or
private-data access outside this expressly reviewed scope.

Live owner sign-ins must be performed by the real account holders; never fabricate
Google claims or treat emulator tokens as live evidence. Both initial admin and
outsider/private/revocation paths require real acceptance before readinessPASS.

## Validation, source identity and deployment

Use newestmain in isolated worktree. Run lint/type/unit/build, config validators,
CMS emulator/browser workflows, Analytics, desktop/mobile, Firefox/WebKit and
Lighthouse; require green exactheadCI and fresh finalreview. Verify anonymous
direct backend403 and normal AppHosting path; no header-based key to spoof in
identity-global mode. Record every finding/fix/reverify cycle.

Never move existing publicv3.0.0 tag. If approved fixes change source, prepare
a separately identified patched candidate (proposedv3.0.1) and reviewed release
notes; tag/release only after its source checks. Production rollout uses only
the exact reviewed candidate after operational gates. Preserve data/IAM and
current revision for rollback; disable CMS rather than weaken authorization.

## Approval requested

Approve HUNPEOLABS-CMS-008-v1 identity-global throttling and its availability
trade-off; confirm monitoring and proposed retention/recovery targets (or supply
changes). This is a behavioral/operational delta, not a request to reapprove
the existing deployment authorization. Existing-system workflow step15 requires
reviewed-plan approval before implementation.
