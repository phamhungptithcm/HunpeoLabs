# Ask HunpeoLabs operations

Approved scope: HUNPEOLABS-ASK-001. Public pages outside admin/Studio have a floating composer and viewport-bounded conversation panel matching the capsule width, with a transparent 4px-blurred page backdrop. Published company, founder, services, pricing conditions, and delivery answers run without a model. Founder answers show the owner-supplied Hung Pham photograph and verified public profile links. JPEG private metadata was removed; encoded image scans and orientation are preserved. No invented prices, availability, qualifications, or experience are included.

## Cost controls

Gemini is disabled by default. The optional adapter uses only `gemini-2.5-flash-lite`, a 12,000-byte prompt ceiling, 256 output tokens, zero thinking budget, no search/tools/audio, and no automatic model retry. Common published answers never invoke Gemini. The provider may classify an otherwise unmatched question into a strict approved topic/service enum; final customer wording always comes from approved sources.

The owner budget is $15–25/month for the whole project. Plan an AI allocation of $3–5 inside that total; this is a planning allowance, not guaranteed expenditure. Official Standard model rates checked on 2026-10-03 are $0.10 per million input tokens and $0.40 per million output tokens. For example, 1,000 calls at 2,000 input and 200 output tokens cost about $0.28 for the model alone. Firebase hosting, database, networking, taxes and existing workloads are separate. Source: https://cloud.google.com/vertex-ai/generative-ai/pricing

Server-side paid reservations are shared through Firestore: at most 1,000/month, 50/day, 5/minute globally and 6/hour per pseudonymous session. Configuration may lower the monthly limit but cannot raise it above 1,000. Failed or canceled reservations remain spent; rotating the session HMAC secret cannot reset global counters. These request ceilings are not a guaranteed project-wide dollar cap. Budget alerts do not stop billing, and provider spend caps may take time to enforce: https://firebase.google.com/docs/projects/billing/spend-caps and https://firebase.google.com/docs/projects/billing/budget-alerts

## Explicit activation prerequisites

Keep `ASK_AI_ENABLED` unset/false until the owner approves activation and provider checks pass. `ASK_ENABLED=false` disables the whole interface/API. Configuration requires production mode, `ASK_GEMINI_MODEL=gemini-2.5-flash-lite`, `ASK_MONTHLY_REQUEST_LIMIT` (1–1000), `ASK_FIREBASE_PROJECT_ID`, `ASK_FIREBASE_APP_ID`, `ASK_GEMINI_LOCATION`, and `ASK_RATE_LIMIT_SECRET` (at least 32 characters). Use ADC with minimal Vertex inference and counter-store permissions. Never expose credentials in browser variables.

Browser App Check configuration uses `NEXT_PUBLIC_ASK_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_ASK_FIREBASE_API_KEY`, `NEXT_PUBLIC_ASK_FIREBASE_APP_ID`, and `NEXT_PUBLIC_ASK_RECAPTCHA_ENTERPRISE_SITE_KEY`. Use the exact same registered app identity on the server. Missing/invalid App Check or unavailable shared counters falls back to published guidance without calling Gemini. Production origin checks use `NEXT_PUBLIC_SITE_URL` when set; keep it canonical. Development permits loopback origins only on the current port.

Current site CSP does not yet allow all reCAPTCHA Enterprise dependencies. Activation needs a separately reviewed, minimal CSP change, IAM/billing verification, allowed-domain registration, retention review and a controlled live-provider test. No CSP, cloud IAM, billing, or production change was made by this task. Genkit optional telemetry exporter/dynamic module bundling warnings require deployment-environment assessment; no telemetry exporter is configured here.

Firestore collection `askRateLimits` stores shared aggregate counts and hashed session keys, never questions or answers. Existing browser deny-by-default rules cover this collection; administrative access must be minimal. Configure TTL on `expiresAt` before activation; expiry fields alone do not delete documents. No remote collection, TTL policy, or IAM configuration was created during local validation.

## Privacy and failure behavior

Conversation lives in component memory only: maximum twelve displayed exchanges and six preceding answered questions per request. Close/reopen retains the current mounted conversation; reload clears it. No chat database, localStorage, question analytics, or provider response logs are added. Paid classification sends a bounded question history and approved public source snippets to Google; provider retention must be confirmed before activation. The privacy page explains this conditional processing without promising zero retention.

Abort, timeout, malformed/truncated streams and provider failures are bounded. Stop/close aborts active output; late replies cannot alter a newer conversation. Retrying is a visitor action. Questions survive errors, with retry and contact links. Contact opens the normal contact page; conversation prefill is deferred pending its separate transfer approval.

Knowledge entries have owner, revision, approval, effective, review and expiry dates. Expired sources are excluded and unknown commercial facts route to confirmation. Review sources before expiry. Model output cannot create arbitrary URLs, HTML, prices or biography.

## Validation limits

Local unit/API/counter tests use provider and Firestore fixtures. Desktop and mobile browser tests exercise the actual local API and rendered interface. No live Gemini, App Check, Firestore transaction, deployed CSP, total Firebase bill, authenticated contact delivery or production release is certified. Deployment and paid activation remain NOT_READY.

## Motion and reading position

Owner-directed follow-up replaces fullscreen chat with a panel up to 920px high on desktop, preserving mobile safe-area margins. Opening reveals the panel upward from its composer in 360ms; closing masks it back into that composer in 320ms without scaling text. Hiding the idle capsule shrinks/fades toward the bottom-right reopen pill. Native modal focus remains active until close finishes. Reduced-motion users skip travel; finite animations and hide timers are canceled on unmount. Transcript and approved answer trees are memoized so typing does not reconcile the entire response. Footer suggestions retain their space while busy. Only a newly submitted question scrolls into position; answer/status arrival preserves the reading position.

Motion handoff is synchronized: backdrop fades over 320ms, idle hide shrinks/fades over 320ms and reopen pill begins its 180ms entrance after 140ms so the two states overlap rather than disappear between frames. A rapid close reads the current animated clip/transform before reversing. The resume action sits above the idle composer so its bottom anchor does not shift when returning.

The collapsed launcher is a 56px circular icon with accessible label and tooltip. An adjacent Ask Anything hint briefly reveals individual letters after 5 seconds, then every 22 seconds while visible. Reduced motion disables automatic hint cycles; timers are cleared when opening or unmounting.

Recognized published FAQs use the same expiry-checked pure source builder locally, before transport, so API cold starts or outages cannot block company/founder/service/pricing guidance. Unknown questions retain the bounded server flow. The blue circular launcher has a white chat icon and soft shadow; the occasional invitation includes one finite 3px attention nudge, disabled under reduced motion.

Backdrop pointer down/up collapses only the open panel to its input, retaining conversation. An inside-to-outside drag is ignored. Outside clicks never hide the idle input; hiding to icon requires its X button.

Home/services load only the lightweight server configuration guard; the API loads the Genkit provider only after paid authorization, with the module load covered by the same deadline. This prevents the optional AI runtime from being loaded by ordinary published FAQ pages. Corrupt local Next generated cache was preserved under /private/tmp and regenerated through the framework.

## Approved content expansion

Timeline, public work and general handover are deterministic published topics in both languages. No numeric pricing/delivery ranges, client outcomes, ownership transfer or support-duration commitments have been approved. Work uses current public product/open-source descriptions and maturity labels, with allowlisted product links; it does not imply client case studies. General handover asks for the operating/support preference; timeline asks for desired first-release date and features. Update owner/source/revision/review/expiry metadata with approved factual changes. No paid activation or new storage is required.

## Public routing and catalog source

Ask has one root-layout mount on public UI pages. The client pathname gate excludes /admin and /studio segments; blog index/detail starts as a circular launcher with no full-input spacer. Navigating to a different pathname resets the page-scoped conversation and aborts pending work/cleans native dialog and timers. Studio/auth implementation is unchanged. Public profiles come only from the products already published in content/site.ts; named product answers and selected-work summaries use the same catalog. No external repo version or capability is inferred. Owner resumed production publication for v3.3.0; ASK_AI_ENABLED is explicitly false. The route gate waits for the browser URL to avoid inert Ask on private global 404 pages.

## v3.3.0 release boundary

Production release contains published answers only. Genkit/OpenTelemetry audit reports three high and one moderate transitive advisories, retained without suppression. No exporter/preload is configured and the provider stays behind the disabled configuration/authorization path. Compatible dependency remediation and live provider acceptance are required before activation. Release checks and deployed revision are recorded in the task completion report; authenticated CMS, OAuth and paid model acceptance are not implied by public smoke checks.
