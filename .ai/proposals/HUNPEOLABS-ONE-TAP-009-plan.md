# ONE-TAP-009 approved configuration plan

Approval: user said "let enable it" after the concrete proposal to enable NEXT_PUBLIC_BLOG_ONE_TAP_ENABLED, configure the matching Firebase Google Web client ID, verify https://hunpeolabs.com origin, rebuild and deploy.

Intelligence: DEGRADED; bounded reads of components/google-one-tap.tsx, app/layout.tsx, apphosting.yaml and blog runbook. No complete indexed impact claim.

Observed: production flag false and client ID absent. Google provider enabled; partial-fields provider API identifies client 91549992622-llbeq0jidte2j539j7qiasi8b8jj79ad.apps.googleusercontent.com. No secret payload accessed.

Scope: apphosting.yaml flag true and public OAuth client ID BUILD/RUNTIME. Preserve Firebase identity, roles, session checks and all security controls. No OAuth scopes, client-secret, IAM or data changes. Verify authorized origin through provider UI/response; if missing, stop before unapproved OAuth client changes.

Validation: configuration validator, production build, public deployed GIS script/initialization and provider origin response. Real Google account acceptance requires owner interaction and remains distinct. Browser suppression/cooldown may prevent display.

Rollback: revert these two public environment entries and redeploy previous revision. Next.js public configuration requires rebuild.
