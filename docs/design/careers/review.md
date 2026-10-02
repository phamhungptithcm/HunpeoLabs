# Design proposal review — v1

Scope: static design artifact only; approval for application implementation is pending.

Cycle 1: reviewed desktop 1440px and mobile 390px full-page screenshots. No horizontal overflow at either viewport (Playwright DOM measurement). One h1, clear no-role disclosure, existing public email recipient, no application form or invented vacancy. Visual inspection: text and CTA readable; mobile content stacks without clipping. Preview header/footer are illustrative; production must reuse existing shared components.

Known limitation: hiring status follows the hero panel and requires scrolling on mobile. Production may shorten that panel if faster status discovery is preferred. Preview internal site links are route specifications, not a running application; only email/anchor behavior is standalone. Email delivery was not tested. No application test, build, deployment or final implementation review is claimed.

Decision: design ready for human review; implementation BLOCKED pending plan approval. Production readiness: NOT READY.

Repository evidence: DEGRADED due to stale CodeGraph/CocoIndex; one refresh timed out. Source-based scope documented in HUNPEOLABS-CAREERS-001-change-impact-plan.md.

Token usage: Unavailable. Billed cost: Unavailable. Memory candidates: None.

## Revision v2 — shared vision
User clarified that the purpose is to find like-minded people to join and build the team. Updated prototype and proposal accordingly. Primary action now invites a conversation; product discovery is secondary. No cofounder title, equity allocation, salaried vacancy or unpaid work commitment is implied. Working terms are explicitly a subject for agreement before work begins. Regenerated desktop/mobile screenshots; Playwright overflow checks remain false at 1440px and 390px. Application files remain unchanged; v2 implementation approval is pending.
