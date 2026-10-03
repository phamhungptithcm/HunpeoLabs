# Reader login redesign — LOGIN-UI-01

Status: APPROVED by the user in this chat on 2026-10-02 (message: approved).

## Outcome and proposed design

Center the reader sign-in content horizontally and vertically within the website content area. Use a compact, responsive column (maximum width 380px), a 32px heading, restrained neutral text, and a 52px Google button. Keep the existing website typeface and blue accent. Retain the short invitation, Google action, and subdued centered back/privacy links.

Remove the decorative comment icon, uppercase HUNPEOLABS / JOURNAL label, repeated email reassurance, and footer divider from the embedded reader view. Render an error only when it exists, with a clear retry action; never hide an actual authentication failure. Preserve the status announcement for accessibility without reserving visible space for an empty error.

## Repository intelligence brief

- Gate initially DEGRADED: both CodeGraph and CocoIndex health checks passed but indexes referenced commit 3d53e1b rather than current 01ae2cac. One bounded refresh attempted. Conclusions below are based on targeted source inspection, not index completeness.
- Verified entry: app/blog-account/page.tsx renders Login with embedded=true when the reader has no session; signed-in account and delete-account views use other components.
- components/blog-admin/login.tsx is shared with app/admin/blog/login/page.tsx. Apply reader-only markup conditions and CSS scoped to .auth-embedded to preserve Studio.
- styles/blog-design.css currently centers the panel horizontally but not its internal content; the decorative symbol, eyebrow, reassurance, reserved status space, and split footer create visual clutter.
- Existing stack: Next.js 16.3.8, React 19.2.8, TypeScript 6, pnpm 11.9, Vitest and Playwright. Local Next use-client guide inspected. Shared context map remains a placeholder; commands verified against package.json.
- Tests inspected: tests/unit/blog-reader-language.test.ts and tests/unit/blog-account-ui.test.ts. Related Google tests and E2E exist.

## File-by-file implementation

1. components/blog-admin/login.tsx: omit reader decorations/reassurance for embedded mode; retain Google SVG, busy/connecting labels, live status and retry; add presentation hooks only if needed.
2. styles/blog-design.css: replace embedded reader overrides with centered layout, compact spacing, responsive padding, centered footer, visible focus and readable error treatment. Do not alter shared Studio selectors.

## Impact and constraints

Low-risk visual change with a shared-component regression risk. OAuth popup, Firebase initialization, session POST, sign-out, returnTo validation, roles, data storage, API contracts, account deletion, and production configuration remain outside scope. No new dependency, migration or deployment. The screenshot's real failure is an existing authentication notice; its cause is not established and is not solved by visual redesign.

## Validation after approval

Run lint and typecheck, relevant reader-language/account/Google unit tests, and inspect desktop/mobile reader views including normal, connecting, busy and error/retry states. Verify keyboard focus, no overflow, and Studio's existing presentation. Record unavailable live OAuth evidence explicitly. Complete repository quality gates and fresh final implementation review before handoff. Rollback consists of reverting the two scoped application files.

## Alternatives and approval

A bordered card adds unnecessary framing for a one-action flow; a simple centered column fits the current website. Approve LOGIN-UI-01 to authorize the two application files and proportional validation. Memory candidates: None. Token/cost totals unavailable.
