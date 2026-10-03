"use client";
import { openSavedPreview } from "@/lib/blog/open-preview";
import { TaxonomyFields } from "./taxonomy-fields";
import { parseRecovery, recoveryKey } from "@/lib/blog/draft-recovery";
import { validScheduleTime } from "@/lib/blog/schedule-time";
import { BlogToast } from "@/components/blog-admin/toast";
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
  viewerUid,
  authors,
  publisher,
  members,
  categories,
  canCreateCategory,
}: {
  initial: Post;
  viewerUid: string;
  authors: { id: string; name: string }[];
  publisher: boolean;
  members: { id: string; name: string }[];
  categories: string[];
  canCreateCategory: boolean;
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
  const [recovery, setRecovery] = useState<ReturnType<typeof parseRecovery>>(null);
  const [recoveryGeneration, setRecoveryGeneration] = useState(0);
  const [sourceText, setSourceText] = useState(
    initial.sources.map((s) => `${s.title} | ${s.url}`).join("\n"),
  );
  const [notice, setNotice] = useState("");
  const [taxonomyToastRevision, setTaxonomyToastRevision] = useState(0);
  const dismissNotice = useCallback(() => setNotice(""), []);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  useEffect(() => {
    if (!publisher) return;
    void request<{ dueAt: string | null; error: string | null }>(`/api/admin/blog/posts/${initial.id}/schedule`).then(r => { setScheduledAt(r.dueAt); if (r.error) setNotice(`Bài chưa được đăng theo lịch. ${message(new Error(r.error))}`); }).catch(() => {});
  }, [initial.id, publisher]);
  async function schedulePublication() {
    const time = new Date(scheduleDate).getTime();
    if (!Number.isFinite(time) || !validScheduleTime(new Date(time).toISOString())) { setNotice("Chọn giờ đăng sau hiện tại ít nhất một phút."); return; }
    const before = generation.current;
    const saved = dirty ? await save() : current.current;
    if (!saved || generation.current !== before) return;
    setBusy(true);
    try {
      const r = await request<{ dueAt: string }>(`/api/admin/blog/posts/${post.id}/schedule`, "POST", { revision: saved.revision, dueAt: new Date(time).toISOString() });
      setScheduledAt(r.dueAt); setModal(null); setNotice("Đã lên lịch đăng bài.");
    } catch (e) { setNotice(message(e)); } finally { setBusy(false); }
  }
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<Post[]>([]);
  const current = useRef(post);
  const manualSlug = useRef(Boolean(initial.slug));
  const saving = useRef(false);
  const pendingSave = useRef<Promise<void> | null>(null);
  const savedGeneration = useRef(0);
  const previewLock = useRef(false);
  const [openingPreview, setOpeningPreview] = useState(false);
  const categoryPending = useRef(false);
  const generation = useRef(0);
  const conflicted = useRef(false);
  const file = useRef<HTMLInputElement>(null);
  const resolveUpload = useRef<((value: string | null) => void) | null>(null);
  const [coverUpload, setCoverUpload] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (dirty) return;
      try {
        const key = recoveryKey(viewerUid, initial.id);
        const backup = parseRecovery(localStorage.getItem(key), viewerUid, initial.id);
        if (backup && JSON.stringify(backup.draft) !== JSON.stringify(parseRecovery(JSON.stringify({ uid: viewerUid, postId: initial.id, revision: initial.revision, at: backup.at, draft: initial }), viewerUid, initial.id)?.draft)) setRecovery(backup);
        else localStorage.removeItem(key);
      } catch { /* Storage may be disabled; server autosave still works. */ }
    }, 0);
    return () => clearTimeout(timer);
  }, [viewerUid, initial, dirty]);
  useEffect(() => {
    if (!dirty) return;
    try { localStorage.setItem(recoveryKey(viewerUid, initial.id), JSON.stringify({ uid: viewerUid, postId: initial.id, revision: post.revision, at: Date.now(), draft: post })); }
    catch { /* A private/full storage must never interrupt editing. */ }
  }, [dirty, post, viewerUid, initial.id]);
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
  function restoreRecovery() {
    if (!recovery) return;
    manualSlug.current = true;
    for (const key of Object.keys(recovery.draft) as (keyof Draft)[]) update(key, recovery.draft[key]);
    setSourceText(recovery.draft.sources.map(s => `${s.title} | ${s.url}`).join("\n"));
    setRecovery(null); setRecoveryGeneration(n => n + 1);
    if (recovery.revision !== initial.revision) {
      conflicted.current = true;
      setNotice("Bản trên máy chủ đã thay đổi. Sao chép nội dung phục hồi trước khi tải lại để đối chiếu.");
    }
  }
  const save = useCallback(
    async (state?: "review" | "archived") => {
      if (saving.current || conflicted.current || categoryPending.current) return null;
      saving.current = true;
      let finishSave!: () => void;
      pendingSave.current = new Promise<void>((resolve) => { finishSave = resolve; });
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
        savedGeneration.current = start;
        if (start === generation.current) {
          setDirty(false);
          try { localStorage.removeItem(recoveryKey(viewerUid, initial.id)); } catch { /* Optional local backup. */ }
        }
        setNotice("Đã lưu.");
        return saved;
      } catch (e) {
        if (e instanceof Error && e.message === "REVISION_CONFLICT")
          conflicted.current = true;
        setNotice(message(e));
        return null;
      } finally {
        saving.current = false;
        pendingSave.current = null;
        finishSave();
        setBusy(false);
      }
    },
    [initial.id, viewerUid],
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
              aria-busy={openingPreview}
              onClick={async (e) => {
                e.preventDefault();
                if (previewLock.current) return;
                if ((busy && !saving.current) || categoryPending.current) {
                  setNotice("Đang xử lý thay đổi. Bạn thử xem trước sau ít giây nhé.");
                  return;
                }
                previewLock.current = true;
                setOpeningPreview(true);
                try {
                  await openSavedPreview({
                    url: `/admin/blog/${post.id}/preview`,
                    open: () => {
                      const tab = window.open("about:blank", "_blank");
                      if (tab) {
                        tab.opener = null;
                        try {
                          tab.document.title = "Đang mở bản xem trước…";
                          const text = tab.document.createElement("p");
                          text.textContent = "Đang chuẩn bị bản xem trước…";
                          tab.document.body.append(text);
                        } catch { /* The browser may restrict placeholder access. */ }
                      }
                      return tab;
                    },
                    prepare: async () => {
                      await pendingSave.current;
                      if (conflicted.current) {
                        setNotice("Bài đã thay đổi ở nơi khác. Lưu bản đang sửa trước khi xem trước.");
                        return false;
                      }
                      const before = generation.current;
                      const saved = savedGeneration.current === before ? current.current : await save();
                      if (!saved) return false;
                      if (generation.current !== before) {
                        setNotice("Bạn vừa sửa thêm nội dung. Mở xem trước lại nhé.");
                        return false;
                      }
                      return true;
                    },
                    navigate: (url) => router.push(url),
                    onError: (error) => setNotice(message(error)),
                  });
                } finally {
                  previewLock.current = false;
                  setOpeningPreview(false);
                }
              }}
            >
              <BlogIcon name="eye" size={15} />
              {openingPreview ? "Đang mở…" : "Xem trước"}
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
        {notice && <BlogToast key={taxonomyToastRevision} text={notice} onClose={dismissNotice} />}
        {scheduledAt && <div className="notice">Đăng lúc {new Date(scheduledAt).toLocaleString("vi")} <button type="button" disabled={busy} onClick={async () => { setBusy(true); try { await request(`/api/admin/blog/posts/${post.id}/schedule`, "DELETE"); setScheduledAt(null); setNotice("Đã hủy lịch đăng."); } catch(e) { setNotice(message(e)); } finally { setBusy(false); } }}>Hủy lịch</button></div>}
        {recovery && <div className="notice" role="status">
          Có nội dung chưa lưu trên thiết bị này.{recovery.revision !== initial.revision ? " Bản trên máy chủ đã thay đổi; kiểm tra kỹ trước khi lưu." : ""}
          <button type="button" disabled={dirty || busy} onClick={restoreRecovery}>Phục hồi</button>
          <button type="button" onClick={() => { try { localStorage.removeItem(recoveryKey(viewerUid, initial.id)); } catch {} setRecovery(null); }}>Bỏ bản tạm</button>
        </div>}
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
                key={recoveryGeneration}
                body={post.body}
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
                accept="image/jpeg,image/png,image/webp,image/gif"
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
            <TaxonomyFields
              category={post.category}
              categories={categories}
              canCreate={canCreateCategory}
              tags={post.tags}
              onCategory={(name) => update("category", name)}
              onTags={(tags) => update("tags", tags)}
              notify={(text) => { setNotice(text); setTaxonomyToastRevision((value) => value + 1); }}
              onPending={(pending) => { categoryPending.current = pending; }}
            />
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
              <ol className="revision-timeline">
              {[...history].sort((a, b) => b.revision - a.revision).map((h) => (
                <li className="revision-timeline__item" key={h.revision}>
                  <span>
                    <strong>Phiên bản {h.revision}</strong>
                    <time dateTime={h.updatedAt}>{new Date(h.updatedAt).toLocaleString("vi")}</time>
                  </span>
                  <button
                    className="revision-restore"
                    aria-label={`Khôi phục phiên bản ${h.revision}`}
                    title={dirty ? "Lưu thay đổi hiện tại trước khi khôi phục" : `Khôi phục phiên bản ${h.revision}`}
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
                    <BlogIcon name="history" size={15} />
                  </button>
                </li>
              ))}
              </ol>
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
              {modal === "publish" && <div className="field"><label>Lên lịch đăng <input type="datetime-local" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} /></label><small>Giờ địa phương của bạn. Lịch chỉ đăng phiên bản đã lưu này.</small><button type="button" className="button small" disabled={busy || !scheduleDate} onClick={() => void schedulePublication()}>Lên lịch</button></div>}
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
