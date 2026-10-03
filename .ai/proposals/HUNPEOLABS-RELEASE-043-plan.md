# Full production release v3.2.0

Authority: human in current chat explicitly requests all current work released to production, commit/push on main, tag and release notes. This authorizes integration conflicts, release metadata and deployment to existing hunpeolabs backend; no billing, secret reads or data migration.

Concrete scope: explicit46 app/test/content paths captured in temporary inventory, plus two existing feature commits b2779cf/21f1c5b. Retain main production Analytics/OneTap and identity-global rate limits, security dependency overrides, current release/browser/preflight tooling. Merge main with feature commits and reviewed WIP. Fix inaccurate pending-only privacy copy to reflect automatic checks and server-only anti-spam counters. Version3.2.0, matching notes, isolated build/test/review. Current live global rate-limit label is retained as a compatible alias of atomic identity-global budgets; validators accept both labels without relaxing quotas or authorization.

Intelligence DEGRADED: stale CodeGraph, failed CocoIndex health and one failed daemon-log refresh. Use bounded source/Git/compiler/test evidence.

Sequence: integrate clean main checkout; frozen dependencies; lint/typecheck/unit/build; core Chromium/mobile, Firefox/WebKit smoke and Lighthouse; Firebase provider preflight; scoped final review; commit integrated candidate; non-force push main/tag; GitHub source release; deploy exact clean source to existing Firebase App Hosting hunpeolabs/hunpeolabs-prod. Verify immutable source/rollout and live health/headers/canonicals/blog. Previous100% revision hunpeolabs-build-2026-10-03-003 captured for rollback. No DB/rules/IAM migration.

Caches, emulator logs, ignored local state and credentials are excluded. Original dirty checkout remains intact. Review/report claims bind to new integrated commit and include opt-in skips, emulator/live boundaries and provider cost unavailable.

Provider readback showed current production Analytics=false,OneTap=false,rate-limit=global and scheduler identity configured. Candidate preserves those activation flags; main enabled flags will not be reapplied. Atomic main rate-limit implementation retained with global compatibility alias.

Streaming contract validation: Next sends200 when browser not-found arrives after loading headers. Missing article metadata remains noindex. CMS raw reading checks verify a noindex missing page with no private manuscript, allowing the documented200/404 streaming status; API404 assertions remain strict. Installed Next not-found/loading docs confirm this framework contract. API404 contracts are unchanged.
