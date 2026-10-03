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
  avatar?: string;
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
        if (live) setNotice(message(e, "en"));
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
      const result = await request<{ status: string }>("/api/blog/comments", "POST", {
        postId,
        parentId: parent,
        text,
        operationId,
        website: "",
      });
      setText("");
      setParent("");
      setNonce("");
      setNotice(result.status === "approved" ? "Your comment is published." : "Your comment was held for review by our spam checks.");
      await Promise.all([loadOwn(), load()]);
    } catch (e) {
      setNotice(message(e, "en"));
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
          Discussion{" "}
          <span className="muted" style={{ font: "16px var(--sans)" }}>
            {page ? String(page.count ?? 0).padStart(2, "0") : ""}
          </span>
        </h2>
        <span className="muted small">
          Newest first <BlogIcon name="down" size={12} />
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
          <p className="private-note">Loading comments…</p>
        </div>
      )}
      {!page && notice && (
        <button
          className="button small"
          onClick={() => void load().catch((e) => setNotice(message(e, "en")))}
        >
          Try again
        </button>
      )}
      {page &&
        (page.commentsEnabled ? (
          <form className="composer" onSubmit={send}>
            {parent && (
              <div className="between reply-context">
                <span>Replying to a comment</span>
                <button type="button" onClick={() => setParent("")}>
                  Cancel reply
                </button>
              </div>
            )}
            <label className="sr-only" htmlFor="comment-text">
              Comment (up to 2,000 characters)
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
              placeholder="Write a comment…"
            />
            <div className="composer-bottom">
              <span className="small muted">Up to 2,000 characters.</span>
              {signed ? (
                <button className="button primary" disabled={busy}>
                  {busy ? "Sending…" : "Post comment"}
                  <BlogIcon name="arrow" size={13} />
                </button>
              ) : (
                <Link
                  className="button primary"
                  href={`/blog-account?returnTo=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname + "#comments" : "/resources/blog")}`}
                >
                  Sign in to comment <BlogIcon name="arrow" size={13} />
                </Link>
              )}
            </div>
          </form>
        ) : (
          <div className="insight">Comments are closed for this post.</div>
        ))}
      <p className="private-note">
        <BlogIcon name="shield" size={12} /> Spam checks run automatically. Some comments may be held for review.
      </p>
      {signed && own.length > 0 && (
        <details
          className="own-comments"
          open={own.some((c) => c.status === "pending")}
        >
          <summary>Your comments ({own.length})</summary>
          {own.map((c) => (
            <div className="notice" key={c.id}>
              <StatusBadge state={c.status} language="en" />
              <p
                style={{ whiteSpace: "pre-wrap", fontSize: 13, marginTop: 10 }}
              >
                {c.text || "Content deleted"}
              </p>
              <div className="comment-actions">
                {!["hidden", "rejected", "deleted"].includes(c.status) && (
                  <button
                    onClick={() => {
                      setEditing(c);
                      setEditText(c.text);
                    }}
                  >
                    Edit
                  </button>
                )}
                {c.status !== "deleted" && (
                  <button onClick={() => setDeleting(c)}>Delete</button>
                )}
              </div>
            </div>
          ))}
        </details>
      )}
      {focused && (
        <aside aria-label="Shared comment">
          <p className="private-note">Shared comment</p>
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
          No comments yet. What do you think?
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
              setNotice(message(e, "en"));
            }
          }}
        >
          Load more comments
        </button>
      )}
      {editing && (
        <BlogDialog closeLabel="Close" title="Edit comment" onClose={() => setEditing(null)}>
          <p>Edits are checked automatically for spam.</p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                const result = await request<{ status: string }>(`/api/blog/comments/${editing.id}`, "PUT", {
                  text: editText,
                  revision: editing.revision,
                });
                setEditing(null);
                await Promise.all([loadOwn(), load()]);
                setNotice(result.status === "approved" ? "Your edit is published." : "Your edit was held for review by our spam checks.");
              } catch (e) {
                setNotice(message(e, "en"));
                setEditing(null);
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="field">
              <label>
                Comment text
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  maxLength={2000}
                  required
                />
              </label>
            </div>
            <button className="button primary" disabled={busy}>
              Submit edit
            </button>
          </form>
        </BlogDialog>
      )}
      {deleting && (
        <BlogDialog closeLabel="Close"
          title="Delete this comment?"
          onClose={() => setDeleting(null)}
        >
          <p>Replies may remain below a deleted-comment notice.</p>
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
                setNotice("Comment deleted.");
              } catch (e) {
                setNotice(message(e, "en"));
                setDeleting(null);
              } finally {
                setBusy(false);
              }
            }}
          >
            Confirm deletion
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
      <Avatar photo={c.avatar} name={c.name || "•"} className={c.badge ? "dark" : "blue"} />
      <div className="comment-content">
        <div className="comment-top">
          <strong>{c.name || "Deleted comment"}</strong>
          {c.badge && (
            <span className="badge blue">
              {c.badge === "moderator"
                ? "Editor"
                : c.badge === "author"
                  ? "Author"
                  : c.badge}
            </span>
          )}
          <time dateTime={c.createdAt}>
            {new Date(c.createdAt).toLocaleDateString("en")}
          </time>
        </div>
        <p style={{ whiteSpace: "pre-wrap" }}>{c.text}</p>
        <div className="comment-actions">
          {signed && c.status === "approved" && !nested && (
            <button onClick={() => reply(c.id)}>Reply</button>
          )}
          <a href={`#comment-${c.id}`}>Link</a>
          {signed && c.status === "approved" && (
            <button onClick={() => setReport(true)}>Report</button>
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
                  setNotice(message(e, "en"));
                }
              }}
            >
              {replies?.next ? "Load more replies" : "View replies"}
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
              <p className="private-note">No replies yet.</p>
            )}
          </div>
        )}
      </div>
      {report && (
        <BlogDialog closeLabel="Close" title="Report comment" onClose={() => setReport(false)}>
          <p>Help keep the conversation respectful.</p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                await request(`/api/blog/comments/${c.id}/report`, "POST", {
                  reason,
                });
                setReport(false);
                setNotice("Report submitted. Thank you.");
              } catch (e) {
                setNotice(message(e, "en"));
                setReport(false);
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="field">
              <label>
                Reason for reporting
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  maxLength={500}
                  required
                />
              </label>
            </div>
            <button className="button primary" disabled={busy}>
              Submit report
            </button>
          </form>
        </BlogDialog>
      )}
    </article>
  );
}
