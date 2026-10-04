"use client";
import { request, message } from "./client";
import { BlogToast } from "./toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { googleAvatar } from "@/lib/blog/profile";
import styles from "./account.module.css";
export function Account({ name, avatar, staff = false, embedded = false, compact = false, onSignedOut, onNavigate, headingId }: {
  name: string; avatar?: string; staff?: boolean; embedded?: boolean; compact?: boolean;
  onSignedOut?: () => void; onNavigate?: () => void; headingId?: string;
}) {
  const generatedHeadingId = useId();
  const titleId = headingId ?? generatedHeadingId;
  const router = useRouter();
  const copy = (vi: string, en: string) => embedded ? vi : en;
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [failedAvatar, setFailedAvatar] = useState("");
  const image = googleAvatar(avatar);
  return (
    <section className={`${styles.account}${embedded ? ` ${styles.embedded}` : ""}${compact ? ` ${styles.compact}` : ""}`} aria-labelledby={titleId} aria-busy={busy}>
      <header className={styles.heading}>
        <h1 id={titleId}>{copy("Tài khoản", "Account")}</h1>
        <p>{copy("Thông tin đăng nhập của bạn.", "Your sign-in details.")}</p>
      </header>
      <div className={styles.panel}>
        <div className={styles.profile}>
          {image && image !== failedAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element -- Validated Google identity image, with initials fallback.
            <img className={styles.avatar} src={image} alt="" referrerPolicy="no-referrer" onError={() => setFailedAvatar(image)} />
          ) : <span className={styles.avatar} aria-hidden="true">{name.trim().slice(0, 1).toUpperCase() || "?"}</span>}
          <div><h2>{name}</h2><p>{copy("Đăng nhập bằng Google", "Signed in with Google")}</p></div>
        </div>
        <div className={styles.actions}>
          <div className={styles.links}>
            {staff && <Link className={styles.primary} href="/admin/blog" onClick={onNavigate}>{copy("Mở Studio", "Open Studio")} <span aria-hidden="true">↗</span></Link>}
            <Link className={styles.link} href="/resources/blog" onClick={onNavigate}>{copy("Đọc blog", "Read the blog")} <span aria-hidden="true">→</span></Link>
          </div>
          <button className={styles.logout} disabled={busy} onClick={async () => {
            if (busy) return;
            setBusy(true); setNotice("");
            try {
              await request("/api/blog/session", "DELETE");
              try { sessionStorage.setItem("hl-one-tap-signed-out", "1"); } catch {}
              window.dispatchEvent(new Event("hl:session-changed"));
              if (onSignedOut) {
                onSignedOut();
                router.refresh();
                return;
              }
              router.replace("/resources/blog");
              router.refresh();
            } catch (e) { setNotice(message(e, embedded ? "vi" : "en")); setBusy(false); }
          }}>{busy ? copy("Đang đăng xuất…", "Signing out…") : copy("Đăng xuất", "Sign out")}</button>
        </div>
      </div>
      {notice && <BlogToast text={notice} kind="error" language={embedded ? "vi" : "en"} onClose={() => setNotice("")} />}
    </section>
  );
}
