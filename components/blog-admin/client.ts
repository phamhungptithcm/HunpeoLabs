import { readerText } from "@/lib/blog/reader-copy";
import { beginProgress } from "@/lib/ui/action-progress";

export async function request<T = unknown>(
  url: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const finish = beginProgress();
  try {
    const response = await fetch(url, {
      method,
      credentials: "same-origin",
      headers: {
        "x-blog-request": "1",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? "SERVICE_UNAVAILABLE");
    return result as T;
  } finally {
    finish();
  }
}
export function message(error: unknown, language: "vi" | "en" = "vi") {
  const code =
    error instanceof TypeError
      ? "SERVICE_UNAVAILABLE"
      : error &&
          typeof error === "object" &&
          "code" in error &&
          typeof error.code === "string"
        ? error.code
        : error instanceof Error
          ? error.message
          : "SERVICE_UNAVAILABLE";
  const text = (
    (
      {
        "auth/popup-closed-by-user": "Bạn đã đóng cửa sổ đăng nhập.",
        "auth/cancelled-popup-request":
          "Một cửa sổ đăng nhập đang mở. Hãy hoàn tất ở cửa sổ đó.",
        "auth/popup-blocked":
          "Trình duyệt đã chặn cửa sổ Google. Cho phép cửa sổ bật lên cho website rồi thử lại.",
        "auth/unauthorized-domain":
          "Tên miền đăng nhập chưa được cấu hình. Vui lòng liên hệ quản trị viên.",
        "auth/operation-not-allowed":
          "Đăng nhập Google chưa được bật. Vui lòng liên hệ quản trị viên.",
        "auth/network-request-failed":
          "Không kết nối được Google. Kiểm tra mạng và thử lại.",
        GOOGLE_ACCOUNT_REQUIRED: "Hãy dùng tài khoản Google để đăng nhập.",
        IDENTITY_CHANGED:
          "Quyền của tài khoản cần được quản trị viên xác minh lại.",
        "auth/invalid-credential":
          "Chưa đăng nhập được. Hãy thử lại với Google.",
        "auth/too-many-requests": "Có quá nhiều lần thử. Vui lòng thử lại sau.",
        "auth/email-already-in-use": "Hãy đăng nhập bằng tài khoản Google này.",
        AUTH_UNAVAILABLE: "Chưa kết nối được dịch vụ đăng nhập. Hãy thử lại.",
        SESSION_EXPIRED: "Phiên đăng nhập đã hết. Bạn đăng nhập lại nhé.",
        NOT_FOUND: "Không tìm thấy nội dung này.",
        IMAGE_REQUIRED: "Hãy chọn một ảnh.",
        INVALID_IMAGE: "Không đọc được ảnh này. Hãy chọn ảnh khác.",
        IMAGE_TOO_LARGE: "Ảnh quá lớn. Hãy chọn ảnh dưới 5 MB.",
        TOO_MANY_IMAGES: "Bài viết đã có quá nhiều ảnh.",
        INVALID_LINK: "Liên kết chưa đúng. Hãy kiểm tra lại.",
        UNPUBLISH_FIRST: "Gỡ bài khỏi blog trước khi lưu trữ.",
        INVALID_INPUT: "Kiểm tra lại nội dung các trường trước khi lưu.",
        INVALID_LOGIN: "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.",
        RECENT_LOGIN_REQUIRED: "Vui lòng đăng nhập lại để tiếp tục.",
        MEMBER_NOT_FOUND: "Không tìm thấy tài khoản đã đăng ký với email này.",
        MEMBER_REQUIRED: "Nhập email hoặc mã tài khoản thành viên.",
        CANNOT_CHANGE_SELF: "Bạn không thể tự thay đổi quyền của mình.",
        SLUG_TAKEN: "Đường dẫn này đã được dùng. Hãy chọn đường dẫn khác.",
        REVISION_CONFLICT:
          "Bài đã thay đổi ở tab khác. Sao chép phần vừa viết trước khi tải lại.",
        SIGN_IN_REQUIRED: "Vui lòng đăng nhập.",
        VERIFY_EMAIL: "Vui lòng xác minh email rồi đăng nhập lại.",
        FORBIDDEN: "Tài khoản chưa được cấp quyền.",
        BLOG_NOT_CONFIGURED: "Blog chưa sẵn sàng. Hãy thử lại sau.",
        SERVICE_UNAVAILABLE:
          "Chưa kết nối được. Giữ trang này mở và thử lại nhé.",
        PUBLICATION_INCOMPLETE:
          "Cần tiêu đề, slug, tóm tắt, tác giả, chuyên mục, nội dung và nguồn tham khảo.",
        RATE_LIMITED: "Bạn thao tác quá nhanh. Vui lòng thử lại sau.",
        COMMENTS_CLOSED: "Bài viết đã đóng bình luận.",
        PUBLISHED_SLUG_LOCKED: "Không thể đổi URL bài đã xuất bản.",
        AUTHOR_REQUIRED: "Hãy chọn một tác giả đã được quản trị viên tạo.",
      } as Record<string, string>
    )[code] ?? "Chưa thực hiện được. Hãy thử lại."
  );
  return language === "en" ? readerText(text) : text;
}
