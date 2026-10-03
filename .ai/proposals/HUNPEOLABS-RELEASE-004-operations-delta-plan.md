# RELEASE-004 operations delta (reviewable, not executed)

Status: PENDING HUMAN APPROVAL / owner decisions. Original RELEASE-004 approval
remains valid; this extends its verify-only monitoring scope and excluded retention changes.
Alert recipient confirmed by the user: hunpeo97@gmail.com.

## Concrete monitoring change

Create or reuse one Google Cloud Monitoring email channel for that recipient,
one public HTTPS uptime check for https://hunpeolabs.com/api/health, and one
alert policy. Check every 300 seconds from three supported regions, timeout 10
seconds, require valid TLS, exact HTTP200 and JSON status=ok. Alert when at least
two checker locations fail for 300 seconds. No cookies, authorization headers,
request body, customer identifiers or new logging sink. Existing Monitoring
metric retention remains provider-managed; no application/user-data retention
is introduced. Reuse matching resources; no duplicate alerts. Read back exact
resources and require recipient-channel verification and delivery acceptance;
configuration success alone does not prove an email was received.

Provider monitoring/probe charges remain possible. No billing-plan change,
new budget charge authorization or uncontrolled call volume. Preserve current
service capacity. Disable only newly created owned alert/check resources for
rollback; preserve historical metrics and unrelated alerts.

## Owner retention / backup decisions needed

Prior proposal: revisions90d, moderation audit180d, orphan private media30d,
rate-limit identifiers<=24h. These are not accepted by providing an email.
Recommend a daily Firestore backup with14d retention as a starting proposal,
plus private Storage/Auth/access-policy coverage with the same recovery window.
Confirm recovery objectives and approved private restore destination before
any export. No production personal data goes to local Git/artifacts/logs. No
automatic destructive cleanup or restoration over the live database. First
verify that restored access policy preserves revocations and one-time seed
marker, published/draft privacy, subcollections and media linkage.

## Ingress boundary remains separate and blocking

Current Cloud Run ingress is all. Do not set BLOG_TRUSTED_IP_HEADER to raw XFF.
RELEASE-004-v1 explicitly requires stopping when trust cannot be established.
A reviewed ingress diagnostic/design must demonstrate provider-owned header
semantics, forged-prefix rejection and direct-backend bypass rejection on the
actual App Hosting path before enabling CMS. Do not change ingress, enable
Compute API, expose a public diagnostic endpoint or introduce an edge service
under this monitoring delta. Those would require a concrete additional impact
plan after provider evidence. No source rollout is authorized by a monitoring
configuration alone.

## Validation and rollout consequence

Validate Monitoring schemas/filters using official API docs, read back channel,
check and policy, inspect emitted checker metrics, and confirm email delivery.
Preserve the existing deployment. Required frozen install/green CI, live Google
acceptance, ingress and DR gates must pass before main/tag/release/rollout.
