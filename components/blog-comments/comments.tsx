"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { request, message } from "@/components/blog-admin/client";
import { Avatar, BlogIcon, StatusBadge } from "@/components/blog-admin/ui";
import { BlogDialog } from "@/components/blog-admin/dialog";
type Comment = {
  id: string;
  name: string;
  text: string;
  status: string;
  revision: number;
  createdAt: string;
  badge: string;
};
type Page = {
  count?: number;
  items: Comment[];
  next: string | null;
  commentsEnabled: boolean;
};
export function Comments({ postId }: { postId: string }) {
  const [page, setPage] = useState<Page | null>(null),
    [own, setOwn] = useState<Comment[]>([]),
    [signed, setSigned] = useState(false),
    [text, setText] = useState(""),
    [parent, setParent] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [nonce, setNonce] = useState("");
  const [focused, setFocused] = useState<{
      parent: Comment;
      reply: Comment | null;
    } | null>(null),
    [editing, setEditing] = useState<Comment | null>(null),
    [editText, setEditText] = useState(""),
    [deleting, setDeleting] = useState<Comment | null>(null);
  const load = useCallback(async () => {
    setPage(await request<Page>(`/api/blog/comments?postId=${postId}`));
  }, [postId]);
  const loadOwn = useCallback(
    async () =>
      setOwn(
        await request<Comment[]>(`/api/blog/comments?postId=${postId}&mine=1`),
      ),
    [postId],
  );
  useEffect(() => {
    let live = true;
    void request<Page>(`/api/blog/comments?postId=${postId}`)
      .then((p) => {
        if (live) setPage(p);
      })
      .catch((e) => {
        if (live) setNotice(message(e));
      });
    void request<Comment[]>(`/api/blog/comments?postId=${postId}&mine=1`)
      .then((c) => {
        if (live) {
          setOwn(c);
          setSigned(true);
        }
      })
      .catch(() => {});
    const match = window.location.hash.match(/^#comment-([a-zA-Z0-9_-]+)$/);
    if (match)
      void request<{ parent: Comment; reply: Comment | null }>(
        `/api/blog/comments?postId=${postId}&commentId=${match[1]}`,
      )
        .then((v) => {
          if (live) setFocused(v);
        })
        .catch(() => {});
    return () => {
      live = false;
    };
  }, [postId]);
  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const operationId = nonce || crypto.randomUUID();
    setNonce(operationId);
    try {
      await request("/api/blog/comments", "POST", {
        postId,
        parentId: parent,
        text,
        operationId,
        website: "",
      });
      setText("");
      setParent("");
      setNonce("");
      setNotice("Đã gửi. Bình luận sẽ xuất hiện sau khi được duyệt.");
      await loadOwn();
    } catch (e) {
      setNotice(message(e));
    } finally {
      setBusy(false);
    }
  }
  function reply(id: string) {
    setParent(id);
    document.getElementById("comment-text")?.focus();
  }
  return (
    <section className="discussion" id="comments">
      <div className="between discussion-header">
        <h2>
          Thảo luận{" "}
          <span className="muted" style={{ font: "16px var(--sans)" }}>
            {page ? String(page.count ?? 0).padStart(2, "0") : ""}
          </span>
        </h2>
        <span className="muted small">
          Mới nhất trước <BlogIcon name="down" size={12} />
        </span>
      </div>
      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}
      {!page && !notice && (
        <div role="status">
          <div className="skeleton" />
          <p className="private-note">Đang tải bình luận…</p>
        </div>
      )}
      {!page && notice && (
        <button
          className="button small"
          onClick={() => void load().catch((e) => setNotice(message(e)))}
        >
          Thử lại
        </button>
      )}
      {page &&
        (page.commentsEnabled ? (
          <form className="composer" onSubmit={send}>
            {parent && (
              <div className="between reply-context">
                <span>Đang trả lời bình luận</span>
                <button type="button" onClick={() => setParent("")}>
                  Hủy trả lời
                </button>
              </div>
            )}
            <label className="sr-only" htmlFor="comment-text">
              Nội dung (tối đa 2.000 ký tự)
            </label>
            <textarea
              id="comment-text"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setNonce("");
              }}
              maxLength={2000}
              required
              placeholder="Viết bình luận…"
            />
            <div className="composer-bottom">
              <span className="small muted">Tối đa 2.000 ký tự.</span>
              {signed ? (
                <button className="button primary" disabled={busy}>
                  {busy ? "Đang gửi…" : "Gửi bình luận"}
                  <BlogIcon name="arrow" size={13} />
                </button>
              ) : (
                <Link
                  className="button primary"
                  href={`/blog-account?returnTo=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname + "#comments" : "/resources/blog")}`}
                >
                  Đăng nhập để gửi <BlogIcon name="arrow" size={13} />
                </Link>
              )}
            </div>
          </form>
        ) : (
          <div className="insight">Bài viết đã đóng bình luận.</div>
        ))}
      <p className="private-note">
        <BlogIcon name="shield" size={12} /> Bình luận sẽ hiện sau khi được
        duyệt.
      </p>
      {signed && own.length > 0 && (
        <details
          className="own-comments"
          open={own.some((c) => c.status === "pending")}
        >
          <summary>Bình luận của bạn ({own.length})</summary>
          {own.map((c) => (
            <div className="notice" key={c.id}>
              <StatusBadge state={c.status} />
              <p
                style={{ whiteSpace: "pre-wrap", fontSize: 13, marginTop: 10 }}
              >
                {c.text || "Đã xóa nội dung"}
              </p>
              <div className="comment-actions">
                {!["hidden", "rejected", "deleted"].includes(c.status) && (
                  <button
                    onClick={() => {
                      setEditing(c);
                      setEditText(c.text);
                    }}
                  >
                    Sửa
                  </button>
                )}
                {c.status !== "deleted" && (
                  <button onClick={() => setDeleting(c)}>Xóa</button>
                )}
              </div>
            </div>
          ))}
        </details>
      )}
      {focused && (
        <aside aria-label="Bình luận được chia sẻ">
          <p className="private-note">Bình luận được chia sẻ</p>
          <CommentItem
            item={focused.parent}
            postId={postId}
            signed={signed}
            reply={reply}
          />
          {focused.reply && (
            <CommentItem
              item={focused.reply}
              postId={postId}
              signed={signed}
              reply={reply}
              nested
            />
          )}
        </aside>
      )}
      {page?.items
        .filter((c) => c.id !== focused?.parent.id)
        .map((c) => (
          <CommentItem
            key={c.id}
            item={c}
            postId={postId}
            signed={signed}
            reply={reply}
          />
        ))}
      {page && !page.items.length && (
        <p className="private-note" style={{ marginTop: 27 }}>
          Chưa có bình luận. Bạn nghĩ sao về bài viết này?
        </p>
      )}
      {page?.next && (
        <button
          className="button small"
          onClick={async () => {
            try {
              const next = await request<Page>(
                `/api/blog/comments?postId=${postId}&cursor=${page.next}`,
              );
              setPage({ ...next, items: [...page.items, ...next.items] });
            } catch (e) {
              setNotice(message(e));
            }
          }}
        >
          Xem thêm bình luận
        </button>
      )}
      {editing && (
        <BlogDialog title="Sửa bình luận" onClose={() => setEditing(null)}>
          <p>Bình luận sẽ chờ duyệt lại sau khi sửa.</p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                await request(`/api/blog/comments/${editing.id}`, "PUT", {
                  text: editText,
                  revision: editing.revision,
                });
                setEditing(null);
                await Promise.all([loadOwn(), load()]);
                setNotice("Bản sửa đang chờ duyệt.");
              } catch (e) {
                setNotice(message(e));
                setEditing(null);
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="field">
              <label>
                Nội dung bình luận
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  maxLength={2000}
                  required
                />
              </label>
            </div>
            <button className="button primary" disabled={busy}>
              Gửi bản sửa
            </button>
          </form>
        </BlogDialog>
      )}
      {deleting && (
        <BlogDialog
          title="Xóa nội dung bình luận?"
          onClose={() => setDeleting(null)}
        >
          <p>Các trả lời có thể được giữ lại dưới thông báo nội dung đã xóa.</p>
          <button
            className="button dark"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await request(`/api/blog/comments/${deleting.id}`, "DELETE", {
                  revision: deleting.revision,
                });
                setDeleting(null);
                await Promise.all([loadOwn(), load()]);
                setNotice("Đã xóa nội dung bình luận.");
              } catch (e) {
                setNotice(message(e));
                setDeleting(null);
              } finally {
                setBusy(false);
              }
            }}
          >
            Xác nhận xóa
          </button>
        </BlogDialog>
      )}
    </section>
  );
}
function CommentItem({
  item: c,
  postId,
  signed,
  reply,
  nested = false,
}: {
  item: Comment;
  postId: string;
  signed: boolean;
  reply: (id: string) => void;
  nested?: boolean;
}) {
  const [replies, setReplies] = useState<Page | null>(null),
    [notice, setNotice] = useState(""),
    [report, setReport] = useState(false),
    [reason, setReason] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <article
      className={`comment ${nested ? "reply" : ""}`}
      id={`comment-${c.id}`}
    >
      <Avatar name={c.name || "•"} className={c.badge ? "dark" : "blue"} />
      <div className="comment-content">
        <div className="comment-top">
          <strong>{c.name || "Bình luận đã xóa"}</strong>
          {c.badge && (
            <span className="badge blue">
              {c.badge === "moderator"
                ? "Người duyệt"
                : c.badge === "author"
                  ? "Tác giả"
                  : c.badge}
            </span>
          )}
          <time dateTime={c.createdAt}>
            {new Date(c.createdAt).toLocaleDateString("vi")}
          </time>
        </div>
        <p style={{ whiteSpace: "pre-wrap" }}>{c.text}</p>
        <div className="comment-actions">
          {signed && c.status === "approved" && !nested && (
            <button onClick={() => reply(c.id)}>Trả lời</button>
          )}
          <a href={`#comment-${c.id}`}>Liên kết</a>
          {signed && c.status === "approved" && (
            <button onClick={() => setReport(true)}>Báo cáo</button>
          )}
          {!nested && (!replies || replies.next) && (
            <button
              onClick={async () => {
                try {
                  const next = await request<Page>(
                    `/api/blog/comments?postId=${postId}&parentId=${c.id}${replies?.next ? `&cursor=${replies.next}` : ""}`,
                  );
                  setReplies({
                    ...next,
                    items: [
                      ...(replies?.next ? replies.items : []),
                      ...next.items,
                    ],
                  });
                } catch (e) {
                  setNotice(message(e));
                }
              }}
            >
              {replies?.next ? "Xem thêm trả lời" : "Xem trả lời"}
            </button>
          )}
        </div>
        {notice && (
          <p className="private-note" role="status">
            {notice}
          </p>
        )}
        {replies && (
          <div>
            {replies.items.map((r) => (
              <CommentItem
                key={r.id}
                item={r}
                postId={postId}
                signed={signed}
                reply={reply}
                nested
              />
            ))}
            {!replies.items.length && (
              <p className="private-note">Chưa có trả lời.</p>
            )}
          </div>
        )}
      </div>
      {report && (
        <BlogDialog title="Báo cáo bình luận" onClose={() => setReport(false)}>
          <p>Giúp giữ cuộc trò chuyện tôn trọng và có giá trị.</p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                await request(`/api/blog/comments/${c.id}/report`, "POST", {
                  reason,
                });
                setReport(false);
                setNotice("Đã gửi báo cáo. Cảm ơn bạn.");
              } catch (e) {
                setNotice(message(e));
                setReport(false);
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="field">
              <label>
                Lý do báo cáo
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  maxLength={500}
                  required
                />
              </label>
            </div>
            <button className="button primary" disabled={busy}>
              Gửi báo cáo
            </button>
          </form>
        </BlogDialog>
      )}
    </article>
  );
}
