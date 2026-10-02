# Navbar account placement
User explicitly requests moving identity after Start a project and refining its appearance. Low-risk presentation-only change; no auth/data changes. Intelligence DEGRADED (stale indexes), inspected header, Services shell, account/session components, responsive styles and SSR tests.
Plan: split account identity from Studio link; place it after CTA in shared header and Services; compact pill with keyboard focus and avatar fallback, collapse name on narrow screens. Preserve role checks and menu behavior. Verify SSR placement/auth branches, lint, typecheck and unit suite. Browser visual verification remains unavailable following localhost tool policy rejection.

Approved follow-up: match account typography to current website navbar. Change only CSS: inherit family/weight/line height, use main navigation size and project color token, remove independent name typography. No behavior changes. Validate diff and existing account SSR tests; visual QA still blocked.
