"use client";
import { googleAvatar } from "@/lib/blog/profile";
import { progressFetch } from "@/lib/ui/action-progress";
import { useState, useRef, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { request, message } from "./client";
import { Avatar, BlogIcon } from "./ui";
import { BlogDialog } from "./dialog";
const subscribe = () => () => {};
type Entry = {
  id: string;
  name?: string;
  role?: string;
  bio?: string;
  avatarId?: string;
  email?: string;
  connected?: boolean;
};
const roles: Record<string, string> = {
  admin: "Quản trị viên",
  publisher: "Người duyệt",
  author: "Tác giả",
  reader: "Độc giả",
};
export function Settings({
  authors,
  taxonomy,
  members,
  viewerEmail,
  viewerAvatar,
}: {
  authors: Entry[];
  taxonomy: Entry[];
  members: Entry[];
  viewerEmail?: string;
  viewerAvatar?: string;
}) {
  const router = useRouter();
  const [section, setSection] = useState("authors");
  const [authorList, setAuthorList] = useState(authors);
  const [dialogError, setDialogError] = useState("");
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [failedPhoto, setFailedPhoto] = useState("");
  const googlePhoto = googleAvatar(viewerAvatar);
  const photo = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [selected, setSelected] = useState(authors[0]?.id ?? ""),
    [name, setName] = useState(authors[0]?.name ?? ""),
    [bio, setBio] = useState(authors[0]?.bio ?? "");
  const [dialog, setDialog] = useState<"taxonomy" | "members" | null>(null),
    [editing, setEditing] = useState<Entry | null>(null);
  const [removing, setRemoving] = useState<Entry | null>(null);
  async function saveAuthor() {
    setBusy(true);
    setNotice("");
    try {
      const authorId = selected || crypto.randomUUID();
      await request("/api/admin/blog/authors", "POST", {
        id: authorId,
        name,
        bio,
      });
      setSelected(authorId);
      const updated = await request<Entry[]>("/api/admin/blog/authors");
      setAuthorList(updated);
      setSelected(authorId);
      const saved = updated.find((a) => a.id === authorId);
      setName(saved?.name ?? name.trim());
      setBio(saved?.bio ?? bio.trim());
      setNotice("Đã lưu hồ sơ tác giả.");
      router.refresh();
    } catch (e) {
      setNotice(message(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="settings-heading">
        <h1>Cài đặt</h1>
        <div className="settings-heading__account" title={viewerEmail}>
          <BlogIcon name="check" size={14} />
          <span>Google</span>
          <span className="settings-heading__email">{viewerEmail}</span>
        </div>
      </div>
      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}
      <nav className="settings-sections" aria-label="Các mục cài đặt">
        {[["authors", "Tác giả"], ["taxonomy", "Chuyên mục"], ["members", "Thành viên"], ["export", "Xuất nội dung"]].map(([id, label]) => (
          <button key={id} type="button" aria-pressed={section === id} onClick={() => { setSection(id); setNotice(""); }}>{label}</button>
        ))}
      </nav>
      <div className="settings-grid settings-grid--organized settings-workspace" data-section={section}>
        <div className="settings-column">
        <section className="panel settings-card">
          <h2>Hồ sơ tác giả</h2>
          <p>Tên, ảnh và giới thiệu trên bài viết. Có thể khác hồ sơ Google.</p>
          <label className="settings-author-label" htmlFor="settings-author">Chọn tác giả</label>
          <div className="settings-author-picker">
          <div className="settings-avatar-control">
            {googlePhoto && googlePhoto !== failedPhoto && !authorList.find((a) => a.id === selected)?.avatarId ? (
              // eslint-disable-next-line @next/next/no-img-element -- Sanitized Google profile image with initials fallback.
              <img src={googlePhoto} alt="Ảnh tài khoản Google" referrerPolicy="no-referrer" onError={() => setFailedPhoto(googlePhoto)} />
            ) : <Avatar
              name={name}
              mediaId={authorList.find((a) => a.id === selected)?.avatarId}
              className="dark big"
            />}
            <button
              className="settings-avatar-camera"
              aria-label="Đổi ảnh đại diện"
              title="Đổi ảnh đại diện"
              disabled={
                !ready ||
                !selected ||
                busy ||
                name !== (authorList.find((a) => a.id === selected)?.name ?? "") ||
                bio !== (authorList.find((a) => a.id === selected)?.bio ?? "")
              }
              onClick={() => photo.current?.click()}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 7h4l2-3h4l2 3h4v13H4z" /><circle cx="12" cy="13" r="3" /></svg>
            </button>
            <input
              ref={photo}
              hidden
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file || !selected) return;
                setBusy(true);
                try {
                  const r = await progressFetch(
                    `/api/admin/blog/media?authorId=${encodeURIComponent(selected)}`,
                    {
                      method: "POST",
                      headers: {
                        "x-blog-request": "1",
                        "Content-Type": file.type,
                      },
                      body: file,
                    },
                  );
                  const body = await r.json();
                  if (!r.ok) throw new Error(body.error);
                  setAuthorList(await request<Entry[]>("/api/admin/blog/authors"));
                  setNotice("Đã đổi ảnh đại diện.");
                  router.refresh();
                } catch (e) {
                  setNotice(message(e));
                } finally {
                  setBusy(false);
                  e.target.value = "";
                }
              }}
            />
          </div>
          <div className="field">
              <select
                id="settings-author"
                value={selected}
                onChange={(e) => {
                  setSelected(e.target.value);
                  const a = authorList.find((a) => a.id === e.target.value);
                  setName(a?.name ?? "");
                  setBio(a?.bio ?? "");
                }}
              >
                <option value="">+ Tạo tác giả mới</option>
                {authorList.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>

          </div>
          </div>
          <div className="field">
            <label>
              Tên hiển thị
              <input
                value={name}
                maxLength={80}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
          </div>
          <div className="field">
            <label>
              Giới thiệu ngắn
              <textarea
                value={bio}
                maxLength={500}
                onChange={(e) => setBio(e.target.value)}
              />
            </label>

          </div>
          <p className="private-note">
            Lưu hồ sơ trước khi đổi ảnh. Bài đã đăng chỉ đổi thông tin khi bạn cập nhật bài.
          </p>
          <div className="settings-save">        <button
          className="button primary"
          disabled={!ready || busy || !name.trim()}
          onClick={() => void saveAuthor()}
        >
          Lưu <BlogIcon name="check" size={14} />
        </button></div>
        </section>
        <section className="panel settings-card">
          <div className="settings-card-heading">
            <h2>Chuyên mục</h2>
            <button
              className="settings-header-action"
              type="button"
              aria-label="Thêm chuyên mục"
              title="Thêm chuyên mục"
              disabled={!ready}
              onClick={() => {
                setEditing(null);
                setDialogError("");
                setDialog("taxonomy");
              }}
            >
              <BlogIcon name="plus" size={18} />
            </button>
          </div>
          <p>Nhóm bài viết theo chủ đề.</p>
          <div className="flex" style={{ flexWrap: "wrap", marginTop: 19 }}>
            {taxonomy.map((c) => (
              <button
                className="badge"
                key={c.id}
                onClick={() => {
                  setEditing(c);
                  setDialogError("");
              setDialog("taxonomy");
                }}
              >
                {c.name} <BlogIcon name="settings" size={11} />
              </button>
            ))}
          </div>

        </section>
        </div>
        <div className="settings-column">
          <section className="panel settings-card">
            <div className="settings-card-heading">
              <h2>Thành viên biên tập</h2>
              <button
                className="settings-header-action"
                type="button"
                aria-label="Thêm thành viên"
                title="Thêm thành viên"
                disabled={!ready}
                onClick={() => {
                  setEditing(null);
                  setDialogError("");
                  setDialog("members");
                }}
              >
                <BlogIcon name="plus" size={18} />
              </button>
            </div>
            <p>Chỉ tài khoản Google trong danh sách này được vào Studio.</p>
            {members.map((m) => (
              <div className="member" key={m.id}>
                <Avatar name={m.connected ? m.name || "TV" : m.email || "TV"} className="blue" />
                <span>
                  {m.connected ? m.name || m.email : m.email}
                  <small className="member-id muted">
                    {m.email === viewerEmail ? "Bạn · " : ""}
                    {m.connected ? m.email : "Chưa kết nối tài khoản Google"}
                  </small>
                </span>
                <button
                  className="badge"
                  disabled={!ready || m.email === viewerEmail}
                  title={
                    m.email === viewerEmail
                      ? "Quyền của tài khoản đang đăng nhập"
                      : "Thay đổi quyền"
                  }
                  onClick={() => {
                    setEditing(m);
                    setDialogError("");
                setDialog("members");
                  }}
                >
                  {roles[m.role ?? ""] ?? m.role}
                </button>
                <button
                  className="icon-button"
                  aria-label={`Thu hồi quyền ${m.email}`}
                  title={
                    m.email === viewerEmail
                      ? "Không thể tự thu hồi quyền của mình"
                      : "Thu hồi quyền"
                  }
                  disabled={!ready || m.email === viewerEmail}
                  onClick={() => setRemoving(m)}
                >
                  <BlogIcon name="close" size={15} />
                </button>
              </div>
            ))}

          </section>
          <section className="panel settings-card">
            <div className="settings-card-heading">
              <h2>Xuất nội dung</h2>
              <a className="settings-header-action" href="/api/admin/blog/export" aria-label="Xuất dữ liệu blog" title="Xuất dữ liệu blog">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5" /></svg>
              </a>
            </div>
            <p>
              Xuất bài viết và danh sách ảnh. Không bao gồm bình luận và tài
              khoản.
            </p>

          </section>
        </div>
      </div>
      {removing && (
        <BlogDialog
          title="Thu hồi quyền biên tập?"
          onClose={() => setRemoving(null)}
        >
          <p>
            {removing.email} sẽ không còn vào được Studio. Các bài đã viết vẫn
            được giữ lại.
          </p>
          <button
            className="button primary"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await request("/api/admin/blog/members", "DELETE", {
                  id: removing.id,
                });
                setRemoving(null);
                setDialog(null);
                router.refresh();
              } catch (e) {
                setNotice(message(e));
                setRemoving(null);
              } finally {
                setBusy(false);
              }
            }}
          >
            Thu hồi quyền
          </button>
        </BlogDialog>
      )}
      {dialog && (
        <BlogDialog
          title={
            dialog === "taxonomy"
              ? editing
                ? "Đổi tên chuyên mục"
                : "Thêm chuyên mục"
              : editing
                ? "Thay đổi quyền"
                : "Thêm thành viên"
          }
          onClose={() => setDialog(null)}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              const fields = Object.fromEntries(new FormData(e.currentTarget));
              try {
                await request(`/api/admin/blog/${dialog}`, "POST", {
                  ...fields,
                  ...(editing ? { id: editing.id } : {}),
                });
                setDialog(null);
                router.refresh();
              } catch (e) {
                setDialogError(message(e));
              } finally {
                setBusy(false);
              }
            }}
          >
            {dialogError && <p className="notice" role="alert">{dialogError}</p>}
            {dialog === "taxonomy" ? (
              <div className="field">
                <label>
                  Tên chuyên mục
                  <input
                    name="name"
                    defaultValue={editing?.name}
                    required
                    maxLength={80}
                  />
                </label>
              </div>
            ) : (
              <>
                {editing && <p>{editing.email}</p>}
                {!editing && (
                  <div className="field">
                    <label>
                      Email tài khoản
                      <input type="email" name="email" required />
                    </label>
                    <small>Nhập email Google của người bạn muốn thêm.</small>
                  </div>
                )}
                <div className="field">
                  <label>
                    Quyền truy cập
                    <select
                      name="role"
                      defaultValue={editing?.role ?? "author"}
                    >
                      {Object.entries(roles).map(([v, label]) => (
                        <option value={v} key={v}>
                          {label}
                          {v === "reader" ? " — thu hồi quyền biên tập" : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </>
            )}
            <button className="button primary" disabled={busy}>
              Lưu
            </button>
          </form>
        </BlogDialog>
      )}
    </>
  );
}
