# HUNPEOLABS-BLOG-001 — Blog CMS, plan v2

Status: PROPOSED — awaiting explicit approval; implementation and production deployment are not approved by this document.

## Mục tiêu và phạm vi

Cho phép chủ website viết, gán tác giả/chuyên mục/tags, duyệt và xuất bản bài trên HunpeoLabs mà không sửa source hoặc build lại cho từng bài. Giữ URL chính `/resources/blog` và `/resources/blog/[slug]`.

Giả định để duyệt: người dùng muốn trang quản trị trực quan tại `/admin/blog`; giao diện quản trị tiếng Việt, bài viết hỗ trợ tiếng Việt hoặc tiếng Anh, giữ ngôn ngữ của các trang marketing hiện tại. “Gán” được hiểu là gán tác giả, người phụ trách và phân loại. Chưa có xác nhận đây là hệ thống giao việc biên tập nhiều cấp.

## Hiện trạng đã kiểm chứng

- HEAD `3d53e1b8201251cb28e02dbd2052ad36b1d67fec`, nhiều WIP có sẵn; không được ghi đè hoặc gom vào commit của blog.
- Next.js 16.2.12 App Router, React 19.2.8, TypeScript 6.0.3, Firebase client 12.17.0; package khai báo Node >=24 và pnpm 11.9.0.
- `content/blog.ts`: schema viết bằng TypeScript, danh sách bài trống, chỉ cho phép trạng thái `reviewed` có tác giả, ngày và nguồn tham khảo.
- Đã có index, article, TOC, RSS, Article/Breadcrumb JSON-LD; sitemap bỏ blog khi chưa có bài. Index lấy dữ liệu ở module scope nên phải thay khi chuyển sang dữ liệu runtime.
- Chưa có module quản trị/auth/content database/media trong phạm vi `app`, `lib`, `content` đã khảo sát. Firebase hiện được dùng cho analytics; cấu hình App Hosting tồn tại nhưng không chứng minh Auth, Firestore hoặc Storage đã được provision.
- `next.config.ts` có CSP và COOP chặt; auth và ảnh CMS cần điều chỉnh origin có chủ đích. Không mở wildcard chung hoặc bỏ security headers.
- Chưa có bằng chứng production trong lượt này.

## Phương án và quyết định đề xuất

| Phương án | Lợi ích | Đánh đổi | Quyết định |
| --- | --- | --- | --- |
| Markdown/MDX trong Git | Ít backend, lịch sử Git | Cần quy trình commit/build, khó cho người viết không dùng Git | Không đáp ứng tốt mục tiêu quản trị trực quan |
| Sanity Studio + Next.js | CMS có sẵn, preview và workflow biên tập | Thêm nhà cung cấp, dataset, quyền truy cập và vận hành riêng | Phương án thay thế nếu ưu tiên CMS có sẵn |
| Firebase + quản trị Next.js + Tiptap | Tích hợp UI HunpeoLabs, tận dụng nền Firebase trong source | Tự chịu trách nhiệm auth, revisions, publish, upload và backup | Đề xuất cho phạm vi này |

Đây là đánh giá kiến trúc cho repository, không phải khẳng định Firebase rẻ hơn. Chi phí cloud và gói dịch vụ chưa được xác minh.

Nguồn chính thức đã tra cứu:

- [Tiptap với Next.js](https://tiptap.dev/docs/editor/getting-started/install/nextjs): editor React tích hợp Next.js; khởi tạo phía client, tránh lỗi hydration.
- [Firebase session cookies](https://firebase.google.com/docs/auth/admin/manage-cookies): phiên phía server, kiểm tra thu hồi, cookie và bảo vệ CSRF.
- [Firestore server security](https://firebase.google.com/docs/firestore/security/insecure-rules): Admin SDK bỏ qua client Security Rules; bắt buộc kiểm tra quyền ở server và IAM.
- [Sanity App Router visual editing](https://www.sanity.io/docs/nextjs/visual-editing-with-next-js-app-router): phương án CMS có sẵn với preview/Draft Mode.

## Trải nghiệm hoàn chỉnh trong v1

1. Đăng nhập bằng tài khoản được cấp quyền; không mở tự đăng ký editor. Đề xuất email/password để tránh thay đổi COOP phục vụ popup OAuth; bootstrap owner bằng quy trình operator riêng.
2. Dashboard liệt kê nháp, chờ duyệt, đã đăng, lưu trữ; tìm theo tiêu đề, lọc chuyên mục/tags, phân trang.
3. Soạn bài: tiêu đề, slug, tóm tắt, tác giả, người phụ trách, ngôn ngữ, chuyên mục, tags, ảnh bìa, SEO. Nội dung có heading, paragraph, link, list, quote, code block, ảnh/caption/alt và nguồn tham khảo.
4. Tự lưu có trạng thái đang lưu/đã lưu/lỗi; cảnh báo rời trang khi chưa lưu. Không báo đã lưu trước khi server xác nhận. Xung đột nhiều tab trả 409 và giữ nội dung cục bộ để người viết xử lý.
5. Preview riêng tư; gửi duyệt; publisher xuất bản hoặc cập nhật bài. Sửa bài đã đăng tạo bản nháp riêng, không đổi bản public cho đến khi bấm cập nhật.
6. Lịch sử các lần lưu có ý nghĩa/xuất bản và khôi phục thành bản nháp. Gỡ bài, lưu trữ, khôi phục; không có xóa vĩnh viễn trong UI v1.
7. Trang đọc responsive với TOC, thời gian đọc tính tự động, tác giả, ngày, ảnh bìa, code, bài liên quan, nút copy link và chia sẻ bằng Web Share khi hỗ trợ.
8. Danh sách public có phân trang, lọc chuyên mục/tags; tìm kiếm tiêu đề/tóm tắt/tags bằng token tiếng Việt chuẩn hóa, phạm vi khớp từ được giải thích rõ. Không hứa full-text/ranking toàn bộ nội dung.
9. Canonical, OG/Twitter, JSON-LD, sitemap, RSS phản ánh cùng một bản published; admin/preview noindex và không xuất hiện trong feed/discovery.
10. Export JSON kèm manifest media và hướng dẫn backup/restore; restore chỉ trong môi trường thử nghiệm ở giai đoạn triển khai local.

Ngoài v1: lịch đăng tự động, newsletter, AI tự viết/tự đăng, cộng tác realtime, dịch tự động, import URL ngoài, full-text search provider. Có thể bổ sung theo delta plan riêng.

## Bổ sung v2: bình luận và chia sẻ (yêu cầu trực tiếp của người dùng)

Bình luận và chia sẻ là tiêu chí nghiệm thu bắt buộc của bản đầu tiên. v2 thay thế v1; các chức năng quản trị và xuất bản đã nêu giữ nguyên. Việc bổ sung yêu cầu chưa phải phê duyệt implementation của toàn bộ kế hoạch.

### Bình luận

- Đọc bình luận công khai không cần đăng nhập. Đề xuất đăng ký tài khoản độc giả bằng email/password và xác minh email trước khi bình luận; tài khoản độc giả tuyệt đối không tự có quyền editor/admin. Đây là giả định sản phẩm để duyệt.
- Gửi bình luận, trả lời một cấp, sửa và xóa nội dung của mình; hiển thị tên công khai, ngày, nhãn tác giả/moderator được xác định bằng server. Email/UID nội bộ không trả ra public.
- Nội dung plain text 1–2.000 ký tự; không cho HTML, ảnh hoặc upload trong comment. Có phân trang 20 mục và cursor ổn định; replies phân trang riêng, không tải thread không giới hạn.
- Mặc định mọi bình luận mới hoặc đã sửa phải được duyệt. Trạng thái pending/approved/rejected/hidden/deleted; chỉ approved được public. Khi sửa, ẩn bản cũ cho đến khi bản mới được duyệt; UI nói rõ điều này.
- Người viết nhìn được trạng thái bình luận của mình trong khu vực riêng. Author không có quyền moderator mặc định; publisher/admin được duyệt, ẩn, đánh dấu spam và khóa bình luận theo từng bài.
- Báo cáo bình luận cần đăng nhập, có lý do giới hạn độ dài; mỗi người chỉ có một report đang mở cho một comment. Report riêng tư, không tự động ẩn bình luận chỉ theo số report để tránh lạm dụng.
- Xóa nội dung của mình thay bằng tombstone khi còn replies; public không giữ tên hoặc nội dung đã xóa. Admin hide khác với yêu cầu xóa dữ liệu; runbook phải có thời hạn purge private records/backups và quy trình xóa tài khoản trước production.
- Parent phải là bình luận top-level cùng bài và còn hợp lệ; khi moderator ẩn parent, replies cũng bị ẩn. Parent do người dùng xóa có thể giữ replies dưới tombstone không chứa PII.
- Rate limit bền vững và atomic theo UID + HMAC của địa chỉ mạng từ proxy tin cậy; không lưu raw IP. Đề xuất 5 submissions/10 phút/UID, 30/giờ/network; hash luân phiên, TTL tối đa 24 giờ. Hạn mức cấu hình được và kiểm thử nhiều instance; thêm throttle đăng ký/login, honeypot và phát hiện gửi trùng, không chỉ dựa vào memory process.
- Mutations kiểm session, email verified, owner/moderator, CSRF, trạng thái published và commentsEnabled trong transaction. expectedRevision ngăn hai moderator/owner ghi đè; operationId tránh duplicate khi retry.
- Gỡ bài phải chặn cả comment read/write. API public không được tiết lộ sự tồn tại của draft qua comment count hoặc permalink. Hiển thị đếm approved nhất quán sau approve/hide/delete, cập nhật atomic; không đưa comment vào RSS bài viết.

### Chia sẻ bài

- Thanh chia sẻ đầu/cuối bài: Copy link, Facebook, LinkedIn, X, email và nút mở bảng chia sẻ của thiết bị. Zalo hoặc ứng dụng khác có thể được chọn khi thiết bị cung cấp; không hứa một nút Zalo chuyên dụng chưa xác minh.
- Chia sẻ URL canonical của bản published, title và summary; không đưa token, query tracking hoặc URL preview. Có link tới bình luận đã duyệt bằng fragment để chia sẻ thảo luận.
- Open Graph/Twitter metadata và ảnh chia sẻ theo bài; ảnh mặc định khi chưa có cover. Preview trên nền tảng ngoài cần kiểm thử thật và có thể bị cache bởi nền tảng đó.
- Web Share chỉ chạy từ click trên trình duyệt hỗ trợ HTTPS; người dùng hủy thì đóng nhẹ nhàng, không báo lỗi hoặc đã chia sẻ. Clipboard bị chặn thì hiện URL để chọn/copy thủ công. Tham khảo [MDN Web Share](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share).
- Dùng liên kết/hộp thoại do người đọc chủ động mở; không nhúng social SDK hoặc tự đăng lên tài khoản. URL tích hợp Facebook/LinkedIn/X phải được xác minh theo tài liệu chính thức và thử thủ công trước khi đánh dấu hoàn tất.
- Không hiện số lượt share giả hoặc coi mở share dialog là đã đăng. Nếu thêm đo lường, chỉ ghi share_click/copy_link theo consent analytics hiện có; không lưu nội dung comment hoặc danh tính người dùng vào analytics.

### Data và allowlist bổ sung

- `blogComments/{id}` chứa postId, parentId, private owner UID, public displayName snapshot, text, revision, status và timestamps. `blogCommentReports/{id}` private; `blogReaderProfiles/{uid}` private, projection công khai tối thiểu. Rate limits nằm collection riêng với TTL. Bổ sung index theo postId/status/parentId/time/id.
- Public repository dùng projection allowlist rõ ràng; không trả nguyên Firestore document. Moderator audit giữ action/status/id, không lưu bản sao nội dung bị xóa. Comment export tách khỏi export nội dung blog, chỉ admin được quyền lấy dữ liệu riêng tư.
- File mới: `lib/blog/comments.ts`, `comment-validation.ts`, `comment-repository.ts`, `rate-limit.ts`, `share.ts`; các hàm createComment/editOwnComment/deleteOwnComment/listApprovedComments/moderateComment/reportComment/buildShareLinks.
- Route mới: `app/api/blog/session/route.ts`, `app/api/blog/comments/route.ts`, `app/api/blog/comments/[id]/route.ts`, `app/api/blog/comments/[id]/report/route.ts`, `app/api/admin/blog/comments/route.ts`, `app/api/admin/blog/comments/[id]/moderate/route.ts`, `app/api/admin/blog/comment-reports/route.ts`.
- UI mới: `components/blog-comments/*`, `components/blog-share.tsx`, `app/blog-account/page.tsx`, `app/admin/blog/comments/page.tsx`; session module dùng chung với admin nhưng quyền được kiểm riêng, không tạo hai cơ chế auth trái nhau.
- Mở rộng schema bài với commentsEnabled; thêm `app/resources/blog/[slug]/opengraph-image.tsx`; cập nhật privacy, rules/indexes, styles và runbook đã nằm trong scope.
- Test mới: `tests/unit/blog-comments.test.ts`, `blog-share.test.ts`, `tests/integration/blog-comments.test.ts`, `tests/e2e/blog-comments.spec.ts`, `blog-share.spec.ts`.

### Nghiệm thu bổ sung

1. Reader đăng ký/xác minh → bình luận pending → moderator approve → visitor thấy; reply/edit/re-review/delete/report/lock hoạt động trên desktop/mobile.
2. Không đọc được pending/rejected/hidden qua list/detail/count/permalink, không sửa comment của người khác, không giả moderator, reader không gọi admin API. Kiểm revoked session, unverified email, CSRF/XSS, parent khác bài và bài chưa công khai.
3. Retry không nhân đôi; đồng thời approve/edit/delete không lost update; pagination không lặp; lỗi mạng giữ nội dung người dùng và không báo thành công sai; rate limit chạy đúng qua nhiều server instances.
4. Unpublish/lock trong lúc gửi được kiểm atomically; comment/reply count đúng sau moderation và deletion; private fields không lọt vào SSR, hydration, API hoặc analytics.
5. Copy/share đúng canonical, tiếng Việt được encode đúng; cancel không toast success; clipboard denied có fallback, native share unsupported vẫn dùng được link. Unit/E2E chỉ chứng minh link và UI; live share card/provider được ghi riêng, không tự đăng bài để kiểm thử.

## Dữ liệu, quyền và tính nhất quán

- `blogPosts/{id}`: private working copy, schemaVersion, revision, owner/assignee UID, authorId, body JSON, metadata, workflow state, server timestamps.
- `blogPosts/{id}/revisions/{revision}`: snapshots bất biến, người thao tác, lý do; autosave debounce, tạo snapshot theo mốc thay vì mọi phím gõ; giới hạn kích thước request/document và số revisions được đọc.
- `blogPublished/{id}`: snapshot sạch chỉ chứa trường được công khai. `blogSlugs/{slug}` giữ reservation duy nhất, không cho đụng slug đang tồn tại hoặc slug cũ.
- `blogAuthors`, `blogCategories`, `blogTags`, `blogMembers`: tài nguyên riêng; email và membership không được đưa vào payload công khai.
- `blogMedia/{id}`: MIME, byte size, dimensions, alt, caption, owner, trạng thái private/public, object key.
- `blogAudit/{eventId}`: actor/action/post/revision/time/result; không lưu manuscript, token hoặc cookie vào log vận hành.
- Reader chỉ đọc published qua server. Author sửa bài được giao/thuộc quyền và gửi review. Publisher duyệt, publish/unpublish. Admin quản lý membership và taxonomy; mỗi mutation kiểm tra session và membership hiện hành.
- Firestore/Storage client rules mặc định deny; Next.js server dùng Admin SDK với IAM tối thiểu. Tất cả quyền phải kiểm tra lại trên API, không dựa vào nút ẩn hoặc layout.
- Session HttpOnly/Secure/SameSite, giới hạn thời gian, kiểm tra revoked/disabled, logout và CSRF + strict same-origin cho mutations. Login ID token cần recent authentication; không dùng client-provided UID/role làm quyền.
- Publish dùng transaction: kiểm tra expectedRevision, slug, dữ liệu đủ điều kiện; ghi public snapshot, trạng thái, audit atomically. Retry cùng operationId không tạo hai lần xuất bản.
- Media upload private; kiểm MIME bằng bytes, giới hạn size/dimensions, chỉ JPEG/PNG/WebP, bỏ EXIF, không SVG/HTML. Media chỉ phục vụ qua route kiểm tra private session hoặc reference đang published; không cấp permanent public URL cho ảnh nháp. Nếu chuẩn bị media thất bại, không publish; object dư có thể dọn sau theo runbook.
- Nội dung JSON chỉ dùng schema node/mark allowlist; render thành React elements, không chạy MDX/JS hoặc HTML tự do. Validate URL, nguồn, real calendar dates, heading IDs, locale và giới hạn nesting/size ở server.
- Nguồn tham khảo vẫn bắt buộc theo gate hiện tại; thay chính sách này cần quyết định rõ, không nới ngầm. Người duyệt xác nhận tác giả/claims, hệ thống chỉ kiểm dữ liệu và quyền.
- Khóa slug sau lần xuất bản đầu trong v1 để tránh broken link; sửa slug nháp được phép. Đổi URL bài đã xuất bản cần phương án redirects riêng.

## Đọc public, cache và lỗi

Khởi đầu dùng đọc server động không cache dữ liệu bài trên Next/CDN để tránh lộ phiên bản đã gỡ. Có giới hạn page size, cursor và query indexes; response admin/preview/media-private luôn private no-store. Chỉ tối ưu cache sau khi có dữ liệu tải và test invalidation. Tránh tải toàn bộ collection về lọc; search token index được tính từ bản published.

Index, metadata, detail, RSS, sitemap và llms dùng cùng repository published. Không dùng `generateStaticParams` để cố định bài tại build. Phân biệt bài không tồn tại (404) với backend lỗi (503 hoặc error boundary), không biến outage thành danh sách rỗng. Khi gỡ bài, lần request tiếp theo phải không còn nội dung trên mọi surface; nội dung người đọc đã tải trước đó không thể thu hồi từ thiết bị của họ.

## File-by-file implementation plan

| File/module | Thay đổi/hàm chính |
| --- | --- |
| `lib/blog/schema.ts`, `validation.ts`, `search.ts` (mới) | schema v1, parseDraft, validatePublish, normalizeSearchTokens, deriveReadingTime |
| `lib/blog/repository.ts`, `firestore-repository.ts` (mới) | listPublished/getPublished/getDraft/saveDraft/publish/unpublish/restoreRevision; transaction và cursors |
| `lib/firebase-admin.ts`, `lib/blog/auth.ts` (mới) | server-only init, requireSession/requireRole/canEditPost; environment fail-closed |
| `lib/blog/media.ts`, `audit.ts`, `export.ts` (mới) | validateUpload, resolveMediaAccess, recordAudit, exportArchive; streams/limits |
| `app/api/admin/blog/session/route.ts` (mới) | CSRF/session create/revoke, rate limit bền vững |
| `app/api/admin/blog/posts/route.ts`, `[id]/route.ts`, `[id]/publish/route.ts`, `[id]/unpublish/route.ts`, `[id]/revisions/route.ts`, `[id]/restore/route.ts` (mới) | authenticated CRUD + workflow, operationId/expectedRevision |
| `app/api/admin/blog/media/route.ts`, `taxonomy/route.ts`, `authors/route.ts`, `members/route.ts`, `export/route.ts` (mới) | quyền theo tài nguyên, pagination, limits, audit |
| `app/api/blog/media/[id]/route.ts` (mới) | kiểm published reference/session; trả media an toàn |
| `app/admin/blog/layout.tsx`, `page.tsx`, `login/page.tsx`, `new/page.tsx`, `[id]/page.tsx`, `[id]/preview/page.tsx`, `settings/page.tsx` (mới) | dashboard, soạn bài, preview, author/member/taxonomy UI, noindex |
| `components/blog-editor/*`, `components/blog-admin/*` (mới) | lazy Tiptap editor, save state, revisions, upload, field validation, keyboard/focus |
| `content/blog.ts` | giữ adapter legacy + fixtures có chủ đích; public production chuyển sang repository, không hai nguồn dữ liệu song song |
| `components/blog-article.tsx`, `components/blog-content.tsx` (mới) | schema renderer, dates theo locale, TOC, share, published media |
| `app/resources/blog/page.tsx`, `[slug]/page.tsx` | async data/metadata, filters/search/cursors, remove module-scope snapshot |
| `app/resources/blog/feed.xml/route.ts`, `app/sitemap.ts`, `app/llms.txt/route.ts` | published-only discovery; RSS creator hợp chuẩn, escape XML, timestamps |
| `app/robots.ts`, `app/resources/page.tsx` | admin/preview crawl policy và link blog; noindex vẫn không thay auth |
| `styles/blog.module.css`, `styles/blog-admin.module.css` (mới), `styles/globals.css` | UI theo ngôn ngữ thiết kế hiện tại, scoped CSS, responsive và reduced motion |
| `next.config.ts` | exact auth origin CSP; giữ security headers; không remote image wildcard |
| `package.json`, `pnpm-lock.yaml` | firebase-admin, Tiptap React/PM/StarterKit/Image, schema validator, server-only; reuse Next sharp khi phù hợp hoặc khai báo sharp trực tiếp cho pipeline ảnh; pin version sau compatibility check |
| `.env.example`, `firebase.json`, `firestore.rules`, `firestore.indexes.json`, `storage.rules`, `scripts/validate-blog-env.mjs` | emulator/test config, deny client rules, queries, preflight; không provision/deploy |
| `scripts/blog-bootstrap-owner.mjs`, `scripts/blog-backup.mjs` (mới) | runbook-driven operator tools, explicit target env, no automatic production execution |
| `tests/unit/blog*.test.ts`, `tests/integration/blog*.test.ts`, `tests/e2e/blog*.spec.ts`, `tests/e2e/site.spec.ts`, `tests/unit/seo.test.ts`, `tests/unit/structured-data.test.ts`, `playwright.config.ts` | meaningful auth/workflow/privacy/SEO regression và emulator isolation |
| `docs/blog-editor-guide.md`, `docs/operations/blog-runbook.md`, `docs/operations/production-readiness.md`, `app/privacy/page.tsx` | authoring, backup/restore, retention proposal, auth/media privacy disclosure theo hành vi thực tế |

Các file ngoài allowlist hoặc thay kiến trúc cần delta approval. Không chỉnh CI/release hoặc `apphosting.yaml` trong scope implementation này; cấu hình production được đề xuất riêng trước launch.

## Trình tự, nghiệm thu và evidence

1. Sau duyệt: ghi approval record hợp lệ; chụp baseline/hash WIP và chạy baseline lint/typecheck/unit/build. Xác định lỗi có sẵn trước khi nhận lỗi vào scope.
2. Schema/repository/emulator + auth: test session thiếu/hết hạn/thu hồi, UID/role giả, truy cập draft người khác, CSRF, payload XSS, forbidden URL, client DB/Storage deny.
3. Admin/editor/media: E2E tạo → viết → upload → autosave → reload → preview → submit → publish; keyboard, mobile, empty/loading/error, mất mạng và 409 giữ bản soạn. Test member removal có hiệu lực ở server.
4. Public/discovery: browser ẩn danh thấy đúng bản published; sửa draft không đổi public; unpublish biến mất khỏi detail/index/search/RSS/sitemap/llms/media. Test database outage khác empty/404, XML/JSON-LD injection, tiếng Việt, metadata và pagination không trùng/mất bài.
5. Consistency: concurrent slug claims, hai tab ghi cùng revision, retry publish, media failure giữa bước chuẩn bị/publish, restore thành draft, export/restore trong emulator, bounded query/read/write.
6. Regression: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, core E2E desktop/mobile và cross-browser smoke. Auth/editor/code/media accessibility check và screenshot review thực tế. Không coi mock/emulator là live provider PASS.
7. Final implementation review skill: review → fix → verify → review; render report và manual editor guide. Bài ví dụ chỉ fixture/draft, không bịa tác giả hay tự đưa lên public.

Profiles: universal, typescript-javascript, web-app, frontend-html-css, api, database, concurrency, seo-geo, visual-design, human-writing; animation-motion nếu thêm motion. Rủi ro tổng thể HIGH vì bổ sung auth/authorization, lưu nội dung riêng tư và public publishing; UI riêng lẻ MEDIUM.

## Vận hành, rollout và rollback

- Server logs có correlation ID, operation type và safe error code; theo dõi publish failure, save conflict, denied access, DB latency và storage failures. Không log nội dung, cookie, token hoặc email.
- Local/emulator trước, staging có tài khoản thực tiếp theo. Production cần xác minh owner UID, enabled Auth provider/domains, Firestore location/indexes, Storage bucket/IAM, runtime service account, retention/backups và ngân sách/cảnh báo.
- Đề xuất retention để owner duyệt trước launch: revisions 90 ngày, audit 180 ngày, private media mồ côi 30 ngày. Chưa bật cron hoặc cleanup tự động trong v1.
- Không deploy, cấp IAM, bật billing, bootstrap owner production, publish bài thực hoặc trả phí trong scope local approval.
- Rollback code phải giữ khả năng đọc public snapshots đã xuất bản; không rollback về blog trống sau khi có bài thật. Có phương án disable mutations và restore revision tốt gần nhất; không xóa collection/bucket. Backup phải có restore evidence trước launch.

## Trạng thái bàn giao kế hoạch

Nghiên cứu/source mapping/plan: COMPLETE. Implementation: NOT_STARTED, chờ duyệt v2. Production: NOT_READY. Câu trả lời tùy chọn về cách soạn bài còn chờ; nếu không có phản hồi thì dùng đề xuất admin trực quan để duyệt, không coi im lặng là approval.
