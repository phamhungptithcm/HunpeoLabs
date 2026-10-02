# BLOG-003 — kết quả kiểm tra

Ngày 2026-10-02. Trạng thái: hoàn tất phần triển khai và kiểm tra cục bộ; **BLOCKED / chưa đủ bằng chứng để xác nhận production ready**. Không deploy hoặc thay đổi dữ liệu production.

## Đã hoàn thành

- Google-only Firebase Authentication; server xác minh provider, email và phiên đăng nhập. Hai admin ban đầu theo đúng yêu cầu. Quyền thêm/sửa/thu hồi lưu trong Firestore, kiểm tra lại mỗi request; không tự khôi phục người đã bị xóa quyền. Chặn tự hạ quyền và xử lý thay đổi chéo bằng transaction.
- Editor: tiêu đề, slug tự động, định dạng, ảnh và mô tả ảnh, undo/redo, tự lưu, xem trước nội dung mới nhất, đăng/gỡ bài. Giữ nội dung khi lỗi mạng hoặc xung đột phiên bản; lưu khi quay lại danh sách.
- Bình luận, trả lời, chỉnh sửa, xóa, báo cáo và kiểm duyệt; bài nháp/ảnh riêng không xuất hiện qua API công khai. Chia sẻ bằng icon tròn, nút sao chép nhỏ trong ô liên kết, chỉ một dấu X để đóng.
- Câu chữ ngắn, tự nhiên trong đăng nhập, editor, quản lý và thông báo lỗi. Ví dụ: “Đã lưu.”, “Viết bình luận…”, “Chưa có bài viết.”
- Giữ thiết kế đã duyệt và tích hợp vào website hiện tại. Tách dữ liệu demo dùng để xem giao diện khỏi dữ liệu chạy E2E.
- Sửa lỗi mất thao tác trước hydration, reload sau thay đổi quyền, focus ảnh chiếm thao tác nhập tiếp theo; cập nhật dependency có advisory và thêm kiểm thử phân biệt phiên không hợp lệ với Firebase tạm lỗi.

Editor đủ cho quy trình viết blog thông thường đã kiểm tra. Chưa có slash command, bảng, kéo thả block, cộng tác thời gian thực hay lịch đăng bài; không gọi đây là editor tương đương Notion. Đánh giá sử dụng dựa trên viết bài qua UI, chưa phải nghiên cứu với người dùng độc lập.

## Bằng chứng

Tệp log nằm tại `.ai/local/blog-003/evidence/`:

| Kiểm tra | Kết quả | Tệp |
| --- | --- | --- |
| Root lint / TypeScript | PASS | root-lint.log / root-typecheck.log |
| Unit | 56/56, 10 files | root-unit.log |
| Blog desktop/mobile | 12/12 | blog-release-e2e.log |
| Website production build desktop/mobile | 74/74 | production-core-final.log |
| Analytics consent | 4/4 | analytics-final.log |
| Firefox / WebKit smoke | 2/2 | cross-browser-final.log |
| Build Next.js | PASS | release-build.log |
| Production dependency audit | 0 known advisories | audit-final.json |
| Cấu hình hợp lệ/sai | 6/6 | config-validation.log |
| Responsive | 20 ảnh, không tràn ngang hoặc page error trong lượt chụp | visual-final.log |
| Archive và snapshot | 184 file khớp hash, đóng gói lặp lại cùng hash | package-verification.log |
| Firebase live preflight | BLOCKED: CLI auth/project discovery | live-preflight-final.log |

Không cộng các suite thành số ca độc lập: một số CMS regression được chạy lại trong suite website. Lượt rộng đầu tiên có 3 lỗi hợp đồng test; đã sửa harness theo UI hiện tại, giữ assertions về consent/boundary/navigation và chạy lại toàn bộ 74 ca thành công. Ảnh responsive được chụp trước hai chỉnh sửa câu chữ cuối; kiểm tra build và source áp dụng bản cuối.

Google popup được kiểm tra với Firebase Emulator. Script công khai Google được lấy bằng Playwright HTTP transport do iframe loader bị treo trong môi trường này; không mock provider claims hoặc API phiên. Đây không phải bằng chứng đăng nhập Google thật. Analytics sử dụng endpoint test. Kiểm tra website dùng trạng thái từ chối analytics lưu sẵn, consent first-visit được kiểm tra riêng.

## Đóng gói

`output/blog-release/hunpeolabs-blog-source.tar.gz`

SHA-256: `926179a8c737279ce7d2d7b97ce01f5b3bb5c440e5b9f105b97a534a31da8d1a`

184 tệp, manifest từng tệp nằm cùng thư mục. Bao gồm nguồn website tích hợp hiện tại; không chứa runtime session, secret môi trường, dữ liệu emulator hoặc node_modules. `next-env.d.ts` được Next.js tạo lại. Đã xác nhận toàn bộ file nguồn trong archive khớp snapshot dùng để kiểm tra. Root lint/typecheck bỏ qua bản sao trong output và artifact cục bộ, vẫn kiểm tra toàn bộ application source.

## Review và phần còn lại

- Cycle 1: BLOCKED. Ghi nhận dependency advisory, hydration/settings, focus editor, share hydration và thiếu xác minh Firebase thật. Các lỗi cục bộ đã sửa và chạy lại.
- Cycle 2: rà lại auth/access, public/private boundary, lỗi phiên, editor, copy, config, source package và bằng chứng hồi quy. Các finding cục bộ đã FIXED. Quyết định vẫn BLOCKED vì readiness production chưa được kiểm chứng.
- Repository intelligence DEGRADED; dùng đọc source, diff, compiler và test có phạm vi. Không tuyên bố kiểm tra toàn bộ rủi ro ngoài phạm vi này.
- Cần chủ dự án chạy `firebase login --reauth` với tài khoản có quyền vào `hunpeolabs-prod`. Sau đó chạy lại preflight, xác minh Google provider/domain, IAM, bucket, indexes/rules, secret rate limit, header do ingress ghi đè, OAuth thật trên desktop/mobile, giám sát và backup/restore trước rollout được duyệt.
- Backup/restore của candidate này, production load, live OAuth và live operations: NOT TESTED. Bằng chứng restore cũ không dùng để phê duyệt bản này.
- `apphosting.yaml` hiện chưa bật blog/cấu hình provider; cần cấu hình môi trường thật và build lại trước rollout. Không tự đoán cấu hình hoặc credentials.
- Giữ nguyên WIP ngoài phạm vi; worktree chưa sạch, HEAD `3d53e1b8201251cb28e02dbd2052ad36b1d67fec`. Chưa commit/push/deploy.

Tiến độ tiêu chí: 4/5 xác minh trong phạm vi local; tiêu chí production còn BLOCKED. Đây không phải mức bảo đảm 80% production.
Token usage: Unavailable. API-equivalent estimate và actual billed cost: Unavailable. Memory candidates: None.
