# HunpeoLabs.com — nghiên cứu đa ngôn ngữ

Ngày: 2026-10-02. Trạng thái: đề xuất nghiên cứu, chưa được duyệt triển khai.

## Kết luận

Khuyến nghị khởi đầu en + vi, tiếng Anh là mặc định. Giữ URL tiếng Anh hiện tại (/about, /products…), thêm /vi (/vi/about, /vi/products…). Dùng next-intl với localePrefix: as-needed và localeDetection: false để URL quyết định ngôn ngữ, tránh tự chuyển trang theo trình duyệt/cookie. Phiên bản thư viện và khả năng tương thích Next 16.3.8 cần được xác nhận trong bước thử nghiệm sau duyệt; chưa cài dependency.

Không dùng bản dịch chạy trong trình duyệt làm kiến trúc chính. Nội dung cần có HTML từ server và URL riêng cho từng ngôn ngữ. Chưa có dữ liệu thị trường để khuyến nghị ngôn ngữ thứ ba.

## Bằng chứng hiện trạng

Repository Intelligence Gate ban đầu DEGRADED do indexes stale; đã refresh một lần và kiểm tra lại READY. CodeGraph explore createPageMetadata/RootLayout/SiteHeader và CocoIndex search blog language/locale, sau đó đối chiếu source. Commit: 3d53e1b8201251cb28e02dbd2052ad36b1d67fec; working tree có nhiều WIP sẵn có, phải giữ nguyên. Index có thể stale lại khi tài liệu này được thêm; kết quả READY áp dụng cho snapshot trước tài liệu.

- package.json: Next 16.3.8, React 19.2.8, TypeScript 6.0.3, pnpm 11.9.0, Node >=24; chưa có next-intl.
- app/layout.tsx: html lang=en, WebSite inLanguage=en; header/footer và skip link dùng tiếng Anh.
- app/seo.ts createPageMetadata: canonical có sẵn, chưa có alternates.languages hay locale cho Open Graph.
- app/sitemap.ts: URL đơn ngôn ngữ; lấy bài qua listDiscoveryPosts.
- content/site.ts, product-catalog.ts, product-pages.ts và JSX chứa nội dung; chỉ dịch một file dictionary sẽ không đủ.
- lib/blog/schema.ts: Draft.language là vi/en. Chưa có trường liên kết nhóm bản dịch trong schema đã đọc.
- lib/blog/repository.ts: getPublished tìm theo slug; listPublished chưa có bộ lọc language; blogSlugs dùng slug làm khóa duy nhất toàn cục. Giữ quy tắc này trong giai đoạn đầu.
- app/resources/blog/layout.tsx cố định lang=vi, trong khi JSON-LD bài viết dùng post.language. feed.xml cố định language=en. Đây là các điểm cần sửa theo ngôn ngữ thực tế.
- components/project-brief-form.tsx: nhãn và trạng thái tiếng Anh, gọi /api/contact. Localize hiển thị mà giữ enum/payload/API ổn định.
- next.config.ts: CSP riêng cho /admin/blog/login và /blog-account; không đưa các route này vào rewrite locale khi chưa có thiết kế riêng.

Đã mở trang chủ live qua web; đây chỉ là kiểm tra trang công khai có giới hạn, không chứng minh source local bằng deployment hay kiểm thử runtime đa ngôn ngữ.

## Lựa chọn

| Phương án | Lợi ích | Chi phí/rủi ro | Kết luận |
|---|---|---|---|
| next-intl + URL riêng | Routing/navigation, ICU, số nhiều, định dạng ngày; phù hợp mở rộng | Thêm dependency, thay layout và liên kết | Khuyến nghị, cần thử build với bản Next đang dùng |
| Dictionary TypeScript thuần | Ít dependency, hợp nội dung server đơn giản | Tự quản lý navigation, SEO, pluralization, client context | Phương án dự phòng |
| Dịch bằng widget trong browser | Nhanh thử nghiệm | Khó kiểm soát copy, SSR/SEO và trạng thái form | Không chọn làm nền tảng |

## Thiết kế đề xuất

1. Namespace messages cho navigation/common/contact/consent/account; nội dung marketing dài giữ module có kiểu theo locale. Giữ ID sản phẩm, slug, mã enum và định danh dữ liệu độc lập với bản dịch.
2. Các trang public dùng app/[locale]; layout locale sở hữu html lang và context. Root layouts cho route public và route tài khoản/admin phải được thiết kế rõ để không trùng html/body. API, /_next, media, sitemap, robots, feed và file discovery giữ route chuyên dụng; không chuyển cả app một cách máy móc.
3. Header có nút English / Tiếng Việt, dùng tên ngôn ngữ; đổi sang trang tương ứng, giữ query/hash phù hợp. Trang chưa có bản dịch: hiển thị trạng thái rõ hoặc quay về index ngôn ngữ đã chọn kèm thông báo, không giả lập bản dịch.
4. Chỉ phát hành trang có copy đầy đủ đã duyệt. Không phục vụ nguyên nội dung tiếng Anh ở URL /vi rồi khai báo đó là bản dịch tiếng Việt. Tách registry availability để switcher, sitemap, metadata dùng chung.
5. canonical tự trỏ về URL cùng ngôn ngữ; hreflang en/vi hai chiều chỉ cho bản dịch đã xuất bản; x-default trỏ phiên bản mặc định của trang tương ứng khi phù hợp. SEO title/description, Open Graph, breadcrumb và JSON-LD theo locale. Với blog đơn ngôn ngữ, giữ URL cũ và khai báo ngôn ngữ thực tế, không tạo alternate giả.
6. Nội dung dịch qua quy trình biên tập: bản nháp → duyệt thuật ngữ/giọng văn/claim → xuất bản. Không tự động xuất bản bản dịch máy. Kiểm tra typography/font tiếng Việt, wrap CTA và mobile.
7. Cookie lựa chọn chỉ dùng nếu có nhu cầu cụ thể; URL vẫn quyết định nội dung. Ngày/số theo Intl; không thay đơn vị tiền tệ, timezone nghiệp vụ hay điều kiện dịch vụ bằng suy đoán locale.

## Phạm vi và kế hoạch thay đổi

Rủi ro: trung bình–cao ở routing/layout/SEO; cao hơn nếu thay schema CMS và dữ liệu. Đề nghị duyệt từng giai đoạn.

### Giai đoạn 1 — website public

- Thử tích hợp next-intl/Next 16.3.8 trên local: package.json, pnpm-lock.yaml, next.config.ts; xác nhận static rendering và build.
- Thêm i18n/routing.ts, request.ts, navigation.ts; proxy.ts với matcher chỉ route public và loại trừ admin/account/API/assets/discovery. Không dùng proxy làm thay thế authorization.
- Tái cấu trúc app/layout.tsx và các public page/layout sang subtree locale; bảo toàn route admin/blog, blog-account, API và security headers. Kiểm tra redirect /company/about và /work/[slug] cùng locale.
- Tách copy trong content/site.ts, product-catalog.ts, product-pages.ts và tất cả public page/component thuộc inventory; mỗi route chỉ bật tiếng Việt khi hoàn tất.
- Localize site-header, site-footer, brand links, services chrome, product detail, form, skip link, loading, error, not-found và consent UI cần thiết. Xử lý link pathname-active sau prefix.
- Mở rộng app/seo.ts createPageMetadata với locale/availability; cập nhật sitemap, structured-data, opengraph-image, manifest và llms.txt theo chính sách đã duyệt. RSS giữ URL cũ và language phản ánh tập nội dung, chưa tạo feed locale nếu chưa lọc dữ liệu.
- Blog public vẫn giữ URL bài cũ trong giai đoạn này; bảo đảm html/article lang theo bài. Không nhân bản bài sang /vi khi chưa có bản dịch. Trang index blog cần quyết định trải nghiệm mixed-language rõ ràng.
- Giữ payload contact, auth/session, cookie bảo mật, bình luận và API; thông báo API được ánh xạ sang copy locale có fallback an toàn.

### Giai đoạn 2 — blog dịch theo cặp

- Thiết kế translationGroupId tùy chọn, nối các bài en/vi với slug riêng và giữ mỗi bài một published snapshot; không đổi uniqueness slug toàn cục.
- Duyệt delta plan cho schema, publication transaction, editor, repository queries, indexes và migration/backfill. Kiểm tra không liên kết nhầm bài, không lộ draft, xuất bản/thu hồi bản dịch độc lập.
- Filter language ở truy vấn trước pagination; cursor có phạm vi locale/filter, không lọc sau limit. Chuẩn bị Firestore indexes từ query thực tế.
- Alternate/switcher chỉ đọc cặp đã published; sitemap và feed locale dựa trên dữ liệu thực. Giữ URL cũ và redirect map nếu sau này đổi URL.
- Admin/Studio đa ngôn ngữ là phạm vi riêng, có thể triển khai sau public và CMS translation.

## Tiêu chí nghiệm thu sau triển khai

- URL tiếng Anh cũ hoạt động; /vi chỉ hiện trang Việt đã hoàn tất, locale không hỗ trợ trả 404; không có redirect loop hay duplicate /en canonical.
- HTML response có lang, copy, title, canonical đúng locale trước hydration. Hreflang hai chiều và sitemap chỉ chứa bản dịch published.
- Chuyển ngôn ngữ đúng trang, mobile/keyboard hoạt động, không mất query cần thiết; kiểm tra deep links, breadcrumbs và active navigation.
- Các tình huống loading/error/404/empty/form failure dịch đúng; enum/payload gửi contact không đổi.
- API/admin/account và CSP/auth hiện tại giữ đúng hành vi; kiểm thử Google login/One Tap trên môi trường được phép vì route/layout thay đổi có thể ảnh hưởng UI.
- Blog language đúng, không lộ draft, pagination không mất/trùng bài; feed và metadata nhất quán.
- pnpm lint, typecheck, test, build; mở rộng tests/unit/seo.test.ts, structured-data.test.ts, content.test.ts; E2E site/smoke/services/products/privacy/analytics/blog theo tác động. Chạy mobile và cross-browser hợp lý; giữ consent/analytics gating.

## Rollout / rollback

Phát hành theo nhóm trang hoàn chỉnh, ưu tiên home/about/services/contact rồi products/work/resources/careers/principles/privacy. Trước deploy xác nhận redirect map, sitemap, CSP, monitoring 404 và dữ liệu Search Console nếu có quyền. Không deploy trong nhiệm vụ nghiên cứu. Rollback giai đoạn 1 bằng revert thay đổi routing/copy theo release đã duyệt; CMS giai đoạn 2 ưu tiên field bổ sung tương thích ngược, backup và kế hoạch rollback riêng.

## Giả định và quyết định cần chốt

Giả định đề xuất: chỉ en/vi, tiếng Anh mặc định, không tự redirect theo ngôn ngữ browser, chưa dịch Studio trong giai đoạn 1. Chưa biết phân bố khách hàng/ngôn ngữ traffic, ngân sách biên tập, danh sách bài cần dịch, chủ sở hữu bản dịch và thời hạn. Chưa thể ước lượng công sức đáng tin khi chưa kiểm kê copy đầy đủ; không dùng số lượng route làm công sức dịch.

## Nguồn chính thức

- Next local: node_modules/next/dist/docs/01-app/02-guides/internationalization.md (đã đọc bản package đang dùng).
- https://nextjs.org/docs/app/guides/internationalization
- https://next-intl.dev/docs/routing/configuration
- https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites
- https://developers.google.com/search/docs/specialty/international/localized-versions

## Báo cáo hoàn tất nghiên cứu

Đã hoàn tất khảo sát nguồn, đối chiếu tài liệu chính thức, phương án, impact plan và acceptance criteria. Chỉ thêm tài liệu nghiên cứu này; không sửa ứng dụng/dependency/DB và không deploy. Không chạy build/test vì chưa có implementation. Final implementation review: NOT_APPLICABLE (nghiên cứu, chưa có thay đổi production-relevant); đã kiểm tra nội dung đề xuất, giới hạn bằng chứng, tương thích URL và ranh giới dữ liệu. Production readiness của đa ngôn ngữ: NOT_IMPLEMENTED / NOT_TESTED. WIP hiện có không thuộc nhiệm vụ này. Memory candidates: None. Token usage / billed cost: Unavailable.

Theo .ai/workflows/plan-existing-system-change.md bước 15 và AGENTS.md, triển khai cần explicit human approval của kế hoạch; nghiên cứu này không phải approval evidence.
