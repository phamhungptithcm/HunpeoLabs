"use client";
import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { beginProgress } from "@/lib/ui/action-progress";
import { BlogBrand, BlogIcon, Avatar } from "./ui";
import { googleAvatar } from "@/lib/blog/profile";
import { BlogDialog } from "./dialog";
export function BlogChrome({ children }: { children: ReactNode }) {
  const path = usePathname();
  if (path.startsWith("/admin/blog")) return null;
  return children;
}
function NavigationHint() {
  const { pending } = useLinkStatus();
  useEffect(() => {
    if (pending) return beginProgress();
  }, [pending]);
  return <span className={`studio-navigation-hint${pending ? " is-pending" : ""}`} aria-hidden="true" />;
}
function StudioLinks({ path, role, onNavigate }: { path: string; role?: string; onNavigate?: () => void }) {
  return (
    <nav className="side-nav" aria-label="Studio">
      {[
        ["/admin/blog", "file", "Bài viết"],
        ["/admin/blog/analytics", "chart", "Phân tích"],
        ["/admin/blog/comments", "comment", "Bình luận"],
        ["/admin/blog/settings", "settings", "Cài đặt"],
        ["/resources/blog", "external", "Xem blog"],
        ["/admin/blog/account", "users", "Tài khoản"],
      ]
        .filter(([href]) =>
          (href === "/admin/blog/settings" || href === "/admin/blog/analytics")
            ? role === "admin"
            : href === "/admin/blog/comments"
              ? role === "admin" || role === "publisher"
              : true,
        )
        .map(([href, icon, label]) => (
          <Link
            key={href}
            className={path === href ? "active" : ""}
            href={href}
            onClick={onNavigate}
          >
            <BlogIcon name={icon} size={16} />
            {label}
            <NavigationHint />
          </Link>
        ))}
    </nav>
  );
}
export function StudioShell({
  children,
  user,
}: {
  children: ReactNode;
  user: { name: string; role: string; avatar?: string } | null;
}) {
  const path = usePathname();
  const [menu, setMenu] = useState(false);
  const [failedAvatar, setFailedAvatar] = useState("");
  const avatar = googleAvatar(user?.avatar);
  const editor =
    /^\/admin\/blog\/(?!analytics$|comments$|settings$|account$|login$|new$)[^/]+$/.test(path);
  if (editor || path.endsWith("/preview") || path.endsWith("/login"))
    return (
      <div className="blog-surface" lang="vi">
        {children}
      </div>
    );
  return (
    <div className="blog-surface" lang="vi">
      <div className="studio">
        <aside className="sidebar">
          <BlogBrand studio />
          <div>
            <div className="sidebar-label">Không gian biên tập</div>
            <StudioLinks path={path} role={user?.role} />
          </div>
          <div className="sidebar-bottom">
            <Link className="workspace-user" href="/admin/blog/account">
              {avatar && avatar !== failedAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element -- Google profile image with a local initials fallback.
                <img className="workspace-avatar" src={avatar} alt="" referrerPolicy="no-referrer" onError={() => setFailedAvatar(avatar)} />
              ) : <Avatar name={user?.name ?? "?"} className="dark" />}
              <div className="workspace-identity">
                <span className="workspace-name">{user?.name ?? "Tài khoản"}</span>
                <small
                  style={{
                    display: "block",
                    color: "var(--muted)",
                    fontSize: 10,
                  }}
                >
                  {user
                    ? ({
                        admin: "Quản trị viên",
                        publisher: "Người duyệt",
                        author: "Tác giả",
                      }[user.role] ?? "Độc giả")
                    : "Đăng nhập"}
                </small>
              </div>
              <BlogIcon name="arrow" size={15} />
            </Link>
          </div>
        </aside>
        <div className="studio-main">
          <header className="studio-top">
            <div className="flex">
              <button
                className="mobile-only"
                onClick={() => setMenu(true)}
                aria-label="Mở menu Studio"
              >
                <BlogIcon name="grid" />
              </button>
              <span>Studio</span>
              <span>/</span>
              <span>
                {path.endsWith("analytics")
                  ? "Phân tích"
                  : path.endsWith("comments")
                  ? "Bình luận"
                  : path.endsWith("account")
                    ? "Tài khoản"
                    : path.endsWith("settings")
                    ? "Cài đặt"
                    : "Bài viết"}
              </span>
            </div>
            <Link href="/resources/blog" className="arrow-link">
              Xem blog <BlogIcon name="external" size={13} />
            </Link>
          </header>
          <main className="studio-content">{children}</main>
          <footer className="studio-footer">
            <span className="studio-footer-credit"><strong>Hunpeo Labs</strong><span>© {new Date().getFullYear()}</span></span>
            <nav aria-label="Liên kết cuối trang">
              <Link href="/privacy">Quyền riêng tư</Link>
              <Link href="/resources/blog">Ghé thăm blog <BlogIcon name="external" size={12} /></Link>
            </nav>
          </footer>
        </div>
      </div>
      {menu && (
        <BlogDialog title="Studio" onClose={() => setMenu(false)}>
          <StudioLinks path={path} role={user?.role} onNavigate={() => setMenu(false)} />
        </BlogDialog>
      )}
    </div>
  );
}
