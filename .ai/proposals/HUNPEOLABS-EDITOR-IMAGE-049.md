# HUNPEOLABS-EDITOR-IMAGE-049 v1
Status: Awaiting human approval. Risk: medium (persistent image dimensions and public rendering).

## Source evidence
Current Tiptap Image extension defaults resize=false; installed package supports resize handles with locked aspect ratio. RichEditor handles only one file drop and pure file clipboard without text; HTML/URL-only external image drags/pastes bypass upload handling. Existing async upload uses mapped selection bookmark and insertion dialog. validateBody retains only src/alt/title and rejects non-owned media URLs; dimensions are currently stripped. BlogContent renders all image figures full-width via BlogImageViewer. Preserve current media upload validation, ownership, publisher and revision safeguards; do not permit arbitrary image URLs in stored body.

## Approved-intent design
Click image shows compact contextual image controls: width 50%,75%,100%, automatic fit and description. Resize using corner handles with aspect ratio locked; keyboard-accessible percentage presets provide equivalent behavior. Default center, maximum content width, intrinsic ratio and no forced crop; small images do not enlarge unnecessarily. Selected size persists through save, reopen, preview and public reading. Public zoom viewer continues to show original image.

## Implementation boundaries
- components/blog-editor/rich-editor.tsx: configure existing resize extension; contextual image controls; robust File/DataTransferItem extraction for clipboard/drop including image file with incidental filename text. Preserve ordinary rich-text paste and internal image moves. Map async insertion position through edits; clear pending state on upload failure/cancel/unmount. Do not silently discard multiple images; give clear bounded feedback or queue serially with correct insertion.
- lib/blog/editor-image.ts (new): shared safe numeric dimension normalization and transfer classification helpers. Do not persist CSS/style or arbitrary attrs. Bounds finite positive integers <=10000; content CSS caps viewport.
- lib/blog/schema.ts: validate optional width/height attributes and retain valid bounded values; existing image URL ownership restrictions unchanged; legacy images without dimensions remain valid.
- components/blog-content.tsx: use validated optional dimensions to render centered proportional figure in public/preview; no changes to Mermaid viewer or public zoom behavior.
- styles/blog-design.css: scope resize/node-view styles and contextual controls to editor; centered responsive public figures, reduced-motion/focus/touch support.
- tests/unit/blog-editor-image.test.ts and schema tests: dimensions validation, round trip, old image compatibility and unsafe attrs/URLs; transfer item extraction and rejection of unsupported/oversized files.
- tests/e2e/editor-images.spec.ts: isolated real editor with mocked upload only; clipboard screenshot/file, desktop file drop, filename clipboard, resize/presets, selected position after concurrent typing, undo/redo, rejected upload/retry,320px layout, preview/public figure sizing.

## External website image behavior
For clipboard/drop HTML containing a single remote image but no file: attempt browser-side HTTPS fetch with credentials omitted, a timeout and streamed5MB limit, then existing authorized upload. No server-side URL fetch/proxy (avoids SSRF/backend expansion). If browser CORS prevents download, show short actionable error to save/drag the image file instead. Never hotlink remote images or persist base64/blob/remote URLs. Mixed article HTML+text keeps normal text paste; embedded unsupported remote images must not silently appear as saved owned media.

## Quality and rollout
No dependency, media backend, auth, infra, production deployment or migration changes. Bounded additive body attrs need coordinated editor and reader rollout; legacy behavior defaults remain centered fit. Verify installed Tiptap API and Next local docs; use universal,TypeScript,web,HTML/CSS,accessibility,security/API/data-integrity profiles. Run unit/browser,typecheck,lint,build and final implementation review. Live storage/auth/deployment remain NOT TESTED. Preserve current worktree baseline (33aabdd29c75bcf464bd3dc800b9f872b2910062) and unrelated changes.
