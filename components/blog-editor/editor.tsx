"use client";
import { progressFetch } from "@/lib/ui/action-progress";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Post, Draft } from "@/lib/blog/schema";
import { request, message } from "@/components/blog-admin/client";
import {
  Avatar,
  Cover,
  BlogIcon,
  StatusBadge,
} from "@/components/blog-admin/ui";
import { BlogDialog } from "@/components/blog-admin/dialog";
import { bodyText, titleSlug } from "@/lib/blog/schema";
const RichEditor = dynamic(
  () => import("./rich-editor").then((m) => m.RichEditor),
  { ssr: false },
);
const subscribe = () => () => {};
export function Editor({
  initial,
  authors,
  publisher,
  members,
  categories,
}: {
  initial: Post;
  authors: { id: string; name: string }[];
  publisher: boolean;
  members: { id: string; name: string }[];
  categories: string[];
}) {
  const router = useRouter();
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [modal, setModal] = useState<
    "history" | "seo" | "publish" | "unpublish" | "archive" | null
  >(null);
  const [post, setPost] = useState(initial);
  const [sourceText, setSourceText] = useState(
    initial.sources.map((s) => `${s.title} | ${s.url}`).join("\n"),
  );
  const [tagText, setTagText] = useState(initial.tags.join(", "));
  const [notice, setNotice] = useState("");
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<Post[]>([]);
  const current = useRef(post);
  const manualSlug = useRef(Boolean(initial.slug));
  const saving = useRef(false);
  const generation = useRef(0);
  const conflicted = useRef(false);
  const file = useRef<HTMLInputElement>(null);
  const resolveUpload = useRef<((value: string | null) => void) | null>(null);
  const [coverUpload, setCoverUpload] = useState(false);
  useEffect(() => {
    const input = file.current;
    const cancel = () => {
      resolveUpload.current?.(null);
      resolveUpload.current = null;
    };
    input?.addEventListener("cancel", cancel);
    return () => input?.removeEventListener("cancel", cancel);
  }, []);
  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    generation.current++;
    if (key === "slug") manualSlug.current = true;
    setPost((p) => {
      const n = {
        ...p,
        [key]: value,
        ...(key === "title" && !manualSlug.current && !p.publishedSlug
          ? { slug: titleSlug(String(value)) }
          : {}),
      };
      current.current = n;
      return n;
    });
    setDirty(true);
  }
  const save = useCallback(
    async (state?: "review" | "archived") => {
      if (saving.current || conflicted.current) return null;
      saving.current = true;
      setBusy(true);
      const start = generation.current;
      setNotice("Đang lưu…");
      try {
        const saved = await request<Post>(
          `/api/admin/blog/posts/${initial.id}`,
          "PUT",
          { draft: current.current, revision: current.current.revision, state },
        );
        current.current = {
          ...current.current,
          revision: saved.revision,
          state: saved.state,
        };
        setPost((p) => ({
          ...p,
          revision: saved.revision,
          state: saved.state,
        }));
        if (start === generation.current) setDirty(false);
        setNotice("Đã lưu.");
        return saved;
      } catch (e) {
        if (e instanceof Error && e.message === "REVISION_CONFLICT")
          conflicted.current = true;
        setNotice(message(e));
        return null;
      } finally {
        saving.current = false;
        setBusy(false);
      }
    },
    [initial.id],
  );
  useEffect(() => {
    if (!dirty) return;
    const timer = setTimeout(() => {
      void save();
    }, 1800);
    return () => clearTimeout(timer);
  }, [post, dirty, save]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  async function publish(action: "publish" | "unpublish") {
    const before = generation.current;
    const saved = dirty ? await save() : current.current;
    if (!saved || generation.current !== before) {
      setNotice("Bạn vừa sửa thêm nội dung. Lưu lại trước khi đăng.");
      return;
    }
    setBusy(true);
    try {
      await request(`/api/admin/blog/posts/${post.id}/${action}`, "POST", {
        revision: saved.revision,
        operationId: crypto.randomUUID(),
      });
      if (generation.current === before) window.location.reload();
      else
        setNotice("Đã cập nhật bài đăng. Phần vừa sửa thêm vẫn là bản nháp.");
    } catch (e) {
      setNotice(message(e));
    } finally {
      setBusy(false);
    }
  }
  async function upload(f: File) {
    const r = await progressFetch(`/api/admin/blog/media?postId=${post.id}`, {
      method: "POST",
      headers: { "x-blog-request": "1", "Content-Type": f.type },
      body: f,
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error);
    return data as { id: string; url: string };
  }
  async function openHistory() {
    try {
      setHistory(
        await request<Post[]>(`/api/admin/blog/posts/${post.id}/revisions`),
      );
      setModal("history");
    } catch (e) {
      setNotice(message(e));
    }
  }
  const authorName =
    authors.find((a) => a.id === post.authorId)?.name ?? "Chưa chọn tác giả";
  return (
    <main className="editor-shell">
      <fieldset className="editor-frame" disabled={!ready}>
        <header className="editor-top">
          <div className="flex">
            <Link
              href="/admin/blog"
              onClick={async (e) => {
                if (!dirty && !busy) return;
                e.preventDefault();
                if (busy) return;
                const before = generation.current;
                const saved = await save();
                if (saved && generation.current === before)
                  router.push("/admin/blog");
              }}
              className="icon-button"
              aria-label="Trở về bài viết"
            >
              <BlogIcon name="back" />
            </Link>
            <span className="desktop-only small">Bài viết</span>
            <StatusBadge state={post.state} />
            <span className="saved">
              <BlogIcon name={busy ? "clock" : "check"} size={13} />
              <span>
                {busy
                  ? "Đang lưu…"
                  : dirty
                    ? "Chưa lưu thay đổi"
                    : "Đã lưu bản nháp"}
              </span>
            </span>
          </div>
          <div className="flex">
            <button
              className="icon-button"
              disabled={busy}
              aria-label="Lưu bản nháp"
              title="Lưu bản nháp"
              onClick={() => void save()}
            >
              <BlogIcon name="check" size={16} />
            </button>
            <button
              className="icon-button desktop-only"
              aria-label="Lịch sử phiên bản"
              onClick={() => void openHistory()}
            >
              <BlogIcon name="history" size={16} />
            </button>
            <a
              className="button"
              href={`/admin/blog/${post.id}/preview`}
              target="_blank"
              rel="noopener"
              aria-disabled={busy}
              onClick={async (e) => {
                e.preventDefault();
                if (busy) return;
                const preview = window.open("about:blank", "_blank");
                if (!preview) {
                  setNotice(
                    "Hãy cho phép cửa sổ bật lên để xem trước bài viết.",
                  );
                  return;
                }
                preview.opener = null;
                const before = generation.current;
                const saved = dirty ? await save() : current.current;
                if (!saved || generation.current !== before) {
                  preview.close();
                  if (saved)
                    setNotice(
                      "Bạn vừa sửa thêm nội dung. Mở xem trước lại nhé.",
                    );
                  return;
                }
                preview.location.href = `/admin/blog/${post.id}/preview`;
              }}
            >
              <BlogIcon name="eye" size={15} />
              Xem trước
            </a>
            {publisher ? (
              <button
                className="button primary"
                disabled={busy}
                onClick={() => setModal("publish")}
              >
                {post.publishedAt ? "Cập nhật" : "Xuất bản"}
                <BlogIcon name="arrow" size={14} />
              </button>
            ) : (
              <button
                className="button primary"
                disabled={busy}
                onClick={() => void save("review")}
              >
                Gửi duyệt <BlogIcon name="arrow" size={14} />
              </button>
            )}
          </div>
        </header>
        {notice && (
          <p
            className={`save-notice ${notice === "Đã lưu." ? "success" : ""}`}
            role="status"
          >
            {notice} {dirty ? "Có thay đổi chưa lưu." : ""}
          </p>
        )}
        <div className="editor-layout">
          <section className="editor-canvas">
            <div className="editor-page">
              <div className="editor-breadcrumb">
                JOURNAL &nbsp; / &nbsp;{" "}
                {post.category || "CHƯA CHỌN CHUYÊN MỤC"}
                <span className="desktop-only" style={{ float: "right" }}>
                  Chưa đăng <BlogIcon name="shield" size={12} />
                </span>
              </div>
              <div className="editor-cover">
                <Cover id={post.coverId} />
                <button
                  className="button small"
                  onClick={() => {
                    setCoverUpload(true);
                    file.current?.click();
                  }}
                >
                  <BlogIcon name="image" size={13} />
                  {post.coverId ? "Đổi ảnh bìa" : "Chọn ảnh bìa"}
                </button>
              </div>
              <textarea
                className="editor-title"
                aria-label="Tiêu đề"
                placeholder="Tiêu đề bài viết"
                rows={1}
                ref={(el) => {
                  if (el) {
                    el.style.height = "0px";
                    el.style.height = el.scrollHeight + "px";
                  }
                }}
                value={post.title}
                maxLength={180}
                onChange={(e) => update("title", e.target.value)}
              />
              <textarea
                className="editor-summary"
                aria-label="Tóm tắt"
                placeholder="Giới thiệu ngắn về bài viết…"
                rows={1}
                ref={(el) => {
                  if (el) {
                    el.style.height = "0px";
                    el.style.height = el.scrollHeight + "px";
                  }
                }}
                value={post.summary}
                maxLength={500}
                onChange={(e) => update("summary", e.target.value)}
              />
              <div className="editor-author">
                <Avatar name={authorName} className="dark" />
                <span>{authorName}</span>
                <span>·</span>
                <span>
                  {Math.max(
                    1,
                    Math.ceil(
                      bodyText(post.body).split(/\s+/).filter(Boolean).length /
                        220,
                    ),
                  )}{" "}
                  phút đọc
                </span>
              </div>
              <RichEditor
                body={initial.body}
                onChange={(b) => update("body", b)}
                onImage={() =>
                  new Promise((resolve) => {
                    setCoverUpload(false);
                    resolveUpload.current = resolve;
                    file.current?.click();
                  })
                }
              />
              <input
                ref={file}
                type="file"
                hidden
                accept="image/jpeg,image/png,image/webp"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  try {
                    const m = await upload(f);
                    if (coverUpload) update("coverId", m.id);
                    else resolveUpload.current?.(m.url);
                    setNotice("Đã tải ảnh lên.");
                  } catch (e) {
                    setNotice(message(e));
                    resolveUpload.current?.(null);
                  } finally {
                    e.target.value = "";
                    resolveUpload.current = null;
                  }
                }}
              />
              <div className="editor-foot">
                <span>
                  {post.language === "vi" ? "Tiếng Việt" : "English"} ·{" "}
                  {bodyText(post.body).split(/\s+/).filter(Boolean).length} từ
                </span>
                <span>Phiên bản {post.revision}</span>
              </div>
              <details className="editor-extra" open>
                <summary>Nguồn tham khảo & ý chính</summary>
                <div className="field">
                  <label>
                    Nguồn tham khảo — mỗi dòng: tên | URL
                    <textarea
                      value={sourceText}
                      onChange={(e) => {
                        setSourceText(e.target.value);
                        update(
                          "sources",
                          e.target.value
                            .split("\n")
                            .filter(Boolean)
                            .map((s) => {
                              const [title, ...url] = s.split("|");
                              return {
                                title: title.trim(),
                                url: url.join("|").trim(),
                              };
                            }),
                        );
                      }}
                    />
                  </label>
                </div>
                <div className="field">
                  <label>
                    Ý chính
                    <textarea
                      value={post.answer}
                      onChange={(e) => update("answer", e.target.value)}
                    />
                  </label>
                </div>
              </details>
            </div>
          </section>
          <aside className="editor-settings">
            <div className="settings-head">
              <span className="active">Thiết lập bài viết</span>
              <button onClick={() => void openHistory()}>Lịch sử</button>
            </div>
            <div className="field">
              <label>
                Tác giả
                <select
                  aria-label="Tác giả"
                  value={post.authorId}
                  onChange={(e) => update("authorId", e.target.value)}
                >
                  <option value="">Chọn tác giả</option>
                  {authors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="field">
              <label>
                Người phụ trách
                <select
                  aria-label="Người phụ trách"
                  value={post.assignee}
                  disabled={!publisher}
                  onChange={(e) => update("assignee", e.target.value)}
                >
                  <option value="">Chưa giao</option>
                  {!members.some((m) => m.id === post.assignee) &&
                    post.assignee && (
                      <option value={post.assignee}>
                        Người phụ trách hiện tại
                      </option>
                    )}
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="field">
              <label>
                Chuyên mục
                <input
                  list="blog-categories"
                  value={post.category}
                  onChange={(e) => update("category", e.target.value)}
                />
              </label>
            </div>
            <div className="field">
              <datalist id="blog-categories">
                {categories.map((c) => (
                  <option value={c} key={c} />
                ))}
              </datalist>
              <label>
                Tags (phân cách bằng dấu phẩy)
                <input
                  value={tagText}
                  onChange={(e) => {
                    setTagText(e.target.value);
                    update(
                      "tags",
                      e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    );
                  }}
                />
              </label>
            </div>
            <div className="field-rule" />
            <div className="field">
              <label>
                Đường dẫn bài viết
                <input
                  aria-label="Slug"
                  value={post.slug}
                  disabled={Boolean(post.publishedSlug)}
                  onChange={(e) => update("slug", e.target.value)}
                />
              </label>
              <small>
                /resources/blog/{post.slug || "duong-dan-bai-viet"}
                {post.publishedSlug && " · Đã khóa sau xuất bản"}
              </small>
            </div>
            <div className="field">
              <label>
                Ngôn ngữ
                <select
                  aria-label="Ngôn ngữ"
                  value={post.language}
                  onChange={(e) =>
                    update("language", e.target.value as "vi" | "en")
                  }
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </label>
            </div>
            <div className="field-rule" />
            <label className="toggle-row">
              Cho phép bình luận
              <input
                className="toggle"
                aria-label="Bình luận"
                type="checkbox"
                checked={post.commentsEnabled}
                onChange={(e) => update("commentsEnabled", e.target.checked)}
              />
            </label>
            <p className="private-note">
              Bình luận chỉ hiện sau khi được duyệt.
            </p>
            <div className="field-rule" />
            <div className="between small">
              <strong>Chuẩn bị xuất bản</strong>
              <span className="badge">
                {
                  [
                    Boolean(post.title && post.summary),
                    Boolean(post.authorId),
                    post.sources.length > 0,
                  ].filter(Boolean).length
                }{" "}
                / 3
              </span>
            </div>
            <div className="checklist">
              {[
                [Boolean(post.title && post.summary), "Có tiêu đề và tóm tắt"],
                [Boolean(post.authorId), "Đã chọn tác giả"],
                [post.sources.length > 0, "Đã thêm nguồn tham khảo"],
              ].map(([ok, label]) => (
                <div key={String(label)}>
                  <BlogIcon name={ok ? "check" : "clock"} size={12} />
                  {label}
                </div>
              ))}
            </div>
            <button
              className="button small"
              style={{ width: "100%", marginTop: 20 }}
              onClick={() => setModal("seo")}
            >
              <BlogIcon name="search" size={13} />
              Xem trước SEO & chia sẻ
            </button>
            <div className="field-rule" />
            <div className="editor-secondary-actions">
              <button
                className="button small"
                disabled={busy}
                onClick={() => void save("review")}
              >
                Gửi duyệt
              </button>
              {post.coverId && (
                <button
                  className="button small"
                  onClick={() => update("coverId", "")}
                >
                  Bỏ ảnh bìa
                </button>
              )}
              {publisher && post.publishedAt && (
                <button
                  className="button small"
                  disabled={busy}
                  onClick={() => setModal("unpublish")}
                >
                  Gỡ bài
                </button>
              )}
              <button
                className="button small"
                disabled={busy}
                onClick={() => setModal("archive")}
              >
                Lưu trữ
              </button>
            </div>
          </aside>
        </div>
      </fieldset>
      {modal && (
        <BlogDialog
          title={
            modal === "history"
              ? "Lịch sử bài viết"
              : modal === "seo"
                ? "Ấn tượng đầu tiên."
                : modal === "unpublish"
                  ? "Gỡ bài viết?"
                  : modal === "archive"
                    ? "Lưu trữ bản nháp?"
                    : "Xuất bản bài viết"
          }
          onClose={() => setModal(null)}
        >
          {modal === "history" ? (
            <>
              <p>
                Khôi phục tạo một bản nháp mới. Lưu thay đổi hiện tại trước khi
                khôi phục.
              </p>
              {history.length === 0 && <p>Chưa có phiên bản trước đó.</p>}
              {history.map((h) => (
                <div className="member" key={h.revision}>
                  <span>
                    Phiên bản {h.revision}
                    <small className="muted" style={{ display: "block" }}>
                      {new Date(h.updatedAt).toLocaleString("vi")}
                    </small>
                  </span>
                  <button
                    className="button small"
                    disabled={dirty || busy}
                    onClick={async () => {
                      setBusy(true);
                      try {
                        await request(
                          `/api/admin/blog/posts/${post.id}/restore`,
                          "POST",
                          { revision: post.revision, target: h.revision },
                        );
                        window.location.reload();
                      } catch (e) {
                        setNotice(message(e));
                        setModal(null);
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    Khôi phục
                  </button>
                </div>
              ))}
            </>
          ) : modal === "seo" ? (
            <>
              <p>Thiết lập nội dung cho tìm kiếm và liên kết chia sẻ.</p>
              <div className="field">
                <label>
                  Tiêu đề SEO
                  <input
                    value={post.seoTitle}
                    onChange={(e) => update("seoTitle", e.target.value)}
                  />
                </label>
              </div>
              <div className="field">
                <label>
                  Mô tả SEO
                  <textarea
                    value={post.seoDescription}
                    onChange={(e) => update("seoDescription", e.target.value)}
                  />
                </label>
              </div>
              <div className="seo-preview">
                /resources/blog/{post.slug}
                <strong>{post.seoTitle || post.title}</strong>
                {post.seoDescription || post.summary}
              </div>
              <p className="private-note">
                Bố cục xem trước. Kết quả thực tế có thể khác theo nền tảng.
              </p>
            </>
          ) : (
            <>
              <p>
                {modal === "publish"
                  ? "Bài viết sẽ xuất hiện trên blog. Bạn vẫn có thể sửa sau khi đăng."
                  : modal === "unpublish"
                    ? "Bài viết và bình luận sẽ được ẩn. Bạn vẫn giữ bản nháp."
                    : "Gỡ bài khỏi blog trước khi lưu trữ."}
              </p>
              <div className="mod-context">
                <strong>{post.title || "Bài chưa đặt tên"}</strong>
                <div className="muted small">
                  {authorName} · {post.category}
                </div>
              </div>
              <button
                className="button primary"
                disabled={busy}
                onClick={() => {
                  const action = modal;
                  setModal(null);
                  if (action === "archive") void save("archived");
                  else
                    void publish(
                      action === "unpublish" ? "unpublish" : "publish",
                    );
                }}
              >
                {modal === "publish" ? "Xuất bản ngay" : "Xác nhận"}
                <BlogIcon name="arrow" size={14} />
              </button>
            </>
          )}
        </BlogDialog>
      )}
    </main>
  );
}
