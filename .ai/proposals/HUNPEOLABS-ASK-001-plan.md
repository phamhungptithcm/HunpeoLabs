# Ask HunpeoLabs — design and implementation plan v1

Status: APPROVED for local implementation by subsequent human reply "approved". See HUNPEOLABS-ASK-001-approval.md for tracked scope and direct budget/portrait steering.
The original no-code request applied to the design stage; the approved implementation now follows that reviewed design. Paid activation and deployment remain outside scope.

## Outcome and visual contract

Help visitors understand HunpeoLabs, choose a relevant service, understand pricing conditions, and prepare a project brief. Match attachment 1's composer: centered bottom capsule, white surface, blue outline, subtle shadow, circular upward send arrow and close control. Attachments 2–3 define the spacious conversation layout, right-aligned question, real retrieval status, left-aligned response with source links, and persistent bottom composer. Preserve the existing website shell. Mobile keyboard, safe-area spacing, focus restoration, cancellation and reduced motion must work.

Preview: `/Users/hunpeo97/.codex/visualizations/2026/10/04/01a104df-5c1a-7a21-9462-b9ccb745e2fa/ask-hunpeolabs.html`.
Preview is a local scripted simulation, not application implementation or connected AI. Loading is simulated; answers are samples. It shows idle, focus suggestions, loading, company answer, founder card, pricing fallback, cancellation and close. Final implementation retains conversation context; preview shows one exchange at a time.

## Evidence and intelligence brief

Repository commit at analysis: `3f9997ea31670ffe7611cf280c98dd9e6eb5bfab`.
Gate: DEGRADED. CodeGraph current and healthy; CocoIndex stale and unhealthy after the preceding refresh attempt. No repeated indexing attempts. CodeGraph queries located HomePage (app/page.tsx:33), AboutPage (app/about/page.tsx:20), ProjectBriefForm (components/project-brief-form.tsx:28). Bounded source reads verified the facts below; no complete semantic coverage claim.

- `app/page.tsx`: public product/engineering homepage and existing contact/work actions.
- `components/site-header.tsx`: Services, Products, Blog, About, Careers navigation; shared account controls must remain isolated.
- `app/about/page.tsx`: independent product and engineering studio, founded by Hung Pham; public LinkedIn, Facebook and GitHub URLs.
- `content/site.ts`, `app/services/page.tsx`, `components/services-content.tsx`: six service groups, deliverables, scope and handover rules.
- `app/contact/page.tsx`, `components/project-brief-form.tsx`, `lib/contact.ts`: brief workflow and configured delivery/fallback distinction.
- `package.json`: Next 16.3.8, React 19.2.8, Firebase 12.17.0, Node >=24. No Genkit dependency currently declared. Read local Next documentation before approved coding.

Initial worktree already contained an unrelated next-env.d.ts modification; preserve it.

## Knowledge and answer contract

Approved public content only. Each record: ID, topic, language, approved text, source URL, owner, approval status, revision, effective date and review/expiry date. Unpublished, expired or conflicting commercial records are excluded. Human approval of this plan does not approve missing commercial facts.

Company intent: concise studio description, supported services, working process, source and relevant next action. Founder intent includes "founder", misspelling "fouder", "người sáng lập" and Hung Pham references in conversation context. Show a structured Hung Pham profile card, not merely a text mention. Card contains name, Founder · Hunpeo Labs, verified short description, source and these existing public links:

- LinkedIn: https://www.linkedin.com/in/hunpham/
- GitHub: https://github.com/phamhungptithcm
- Facebook: https://www.facebook.com/hawaihouu

These URLs are verified from current source, not live profile readback. Use HP initials until an approved portrait is provided. Do not invent biography, qualifications, employment, client history or experience duration. General company questions do not automatically expand the founder card; founder-specific questions do. Mixed questions may include both.

Service intent: recommend the best fit, explain relevant deliverables and boundaries, link to the actual service. Pricing intent: only quote an effective approved price record with currency, scope, exclusions and conditions. Without one, explain cost drivers and ask one useful scope question. Never invent prices, discounts, fixed delivery dates or availability.

Answers default to 80–150 words, direct first sentence, up to four useful points, linked sources and one next action. Respond in the visitor's language. No fabricated citations, hidden reasoning output, fake retrieval status or unsupported claims about successful submission. Outside-scope queries receive a short redirect to supported company/service topics.

## Proposed implementation surface — after separate approval

1. `content/ask-knowledge.ts` (new): typed, owner-reviewed public knowledge, founder card and source IDs; reuse service content rather than duplicate it. No pricing values until owner approval.
2. `lib/ask/contracts.ts` (new): bounded request/history and structured response schema; allowed sources, card IDs and action IDs. Client renders known components from validated IDs, never arbitrary model HTML or URLs.
3. `lib/ask/retrieval.ts` (new): topic retrieval over the small approved corpus, eligibility/expiry checks and deterministic commercial fields. Vector retrieval deferred.
4. `lib/ask/provider.ts` (new): server-side Genkit/Gemini generation, structured validation, bounded tokens/history, timeout, cancellation and safe fallback. Genkit dependency addition requires explicit approval in the implementation plan. Firebase AI Logic is an alternative, not an assumed server-side dependency.
5. `app/api/ask/route.ts` (new): request validation, server-enforced shared/session budgets, verified abuse controls, safe streaming events and request cancellation. Reject malformed/oversized requests; no unauthenticated database write capability.
6. `components/ask-hunpeolabs.tsx` and dedicated style file (new): idle/focused/loading/answer/error/stop/close states; accessible input/buttons, scroll restoration, source links and founder card. Maintain ephemeral session context. Initial scope: homepage and service pages only; no Studio/auth injection.
7. `app/page.tsx`, `app/services/layout.tsx`: mount only on the approved public surfaces; check nested service layouts for duplicate mounts. Avoid global shared-shell behavior changes.
8. Contact handoff: prefill a visitor-reviewed brief through a bounded transfer mechanism and reuse the existing form; exact transfer and affected files require approval before implementation. Sending remains an explicit visitor action.
9. Privacy and operations: review disclosure, retention, provider processing, configuration, IAM, App Check or equivalent verified abuse controls, budgets and kill switch before any live enablement. Deployment and paid provider calls are separate decisions.

No new database required for v1 public knowledge. No persistent chat transcript by default. Logs/analytics contain permitted operational metadata, never raw chat, email or briefs. Browser cannot supply privileged knowledge or override policy. App Check supplements rate limiting; it is not a hard spending cap.

## Risk, trade-offs and unknowns

Medium risk: public AI usage creates cost/abuse exposure and potential false commercial claims. Deterministic price/profile fields, server-controlled sources and strict schemas reduce it. Provider outages must preserve user input, support retry, and offer Contact. No SDK/billing/configuration change is authorized yet.

Unknown: approved price policy, approved portrait/expanded biography, project AI enablement, provider model/region/retention, live quotas, contact delivery and acceptable spend. Resolve these before implementation/launch as applicable. Existing profile identity confirmed from code only. Current official Firebase docs support web AI Logic streaming and Genkit data-grounded flows; choose model after evaluation, not from a stale name.

## Acceptance and validation plan

- Visual comparison against attachments at desktop/mobile; composer geometry, controls, keyboard and bottom spacing.
- Company, founder, typo, mixed-intent and follow-up tests; founder card links match the source.
- Approved pricing replay and missing/expired/conflicting-price refusal; no invented commercial values across an owner-reviewed evaluation set.
- Citation validity, multilingual answers, prompt injection, malformed output, out-of-scope queries.
- Empty/oversized input, provider timeout/failure, interrupted stream, stop, close/reopen, repeated send and retry; no accidental duplicate paid requests.
- Bounded history, distributed limits, token caps, kill switch; no sensitive conversation logging.
- Brief handoff/editing, delivery-disabled fallback and genuine successful delivery states.
- Relevant lint/typecheck/unit/build and focused Playwright checks once application implementation is approved. Live provider and production readiness require separate evidence.

## Completion of this design task

Preview verification: local headless Chromium passed company answer, founder card with three profile links, pricing fallback, loading, cancellation, close and 320px mobile overflow checks. No page errors observed. Script syntax and Git diff whitespace check passed. Desktop/mobile captures were inspected; standalone test omits the host-provided Lucide runtime, so icons are supplied only when rendered in the conversation preview. These checks certify only the scripted mockup, not application/provider behavior. Review cycle 1: verified source-bound founder content, no fabricated prices, preview-only labeling and preserved application scope; no actionable findings within this design review.

Design and source-bound knowledge proposal completed; runtime AI, application tests, billing and deployment NOT TESTED/NOT IMPLEMENTED. Final implementation review NOT APPLICABLE to this design-only task; application review remains mandatory after approved implementation. Usage/cost metadata unavailable. Memory candidates: None. Implementation approval remains pending; no application files changed.
