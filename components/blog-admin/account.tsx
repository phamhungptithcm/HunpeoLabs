"use client";
import { request, message } from "./client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { googleAvatar } from "@/lib/blog/profile";
import styles from "./account.module.css";
export function Account({ name, avatar, staff = false, embedded = false }: {
  name: string; avatar?: string; staff?: boolean; embedded?: boolean;
}) {
  const router = useRouter();
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [failedAvatar, setFailedAvatar] = useState("");
  const image = googleAvatar(avatar);
  return (
    <section className={`${styles.account}${embedded ? ` ${styles.embedded}` : ""}`} aria-labelledby="account-heading" aria-busy={busy}>
      <header className={styles.heading}>
        <h1 id="account-heading">Tài khoản</h1>
        <p>Thông tin đăng nhập của bạn.</p>
      </header>
      <div className={styles.panel}>
        <div className={styles.profile}>
          {image && image !== failedAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element -- Validated Google identity image, with initials fallback.
            <img className={styles.avatar} src={image} alt="" referrerPolicy="no-referrer" onError={() => setFailedAvatar(image)} />
          ) : <span className={styles.avatar} aria-hidden="true">{name.trim().slice(0, 1).toUpperCase() || "?"}</span>}
          <div><h2>{name}</h2><p>Đăng nhập bằng Google</p></div>
        </div>
        <div className={styles.actions}>
          <div className={styles.links}>
            {staff && <Link className={styles.primary} href="/admin/blog">Mở Studio <span aria-hidden="true">↗</span></Link>}
            <Link className={styles.link} href="/resources/blog">Đọc blog <span aria-hidden="true">→</span></Link>
          </div>
          <button className={styles.logout} disabled={busy} onClick={async () => {
            if (busy) return;
            setBusy(true); setNotice("");
            try {
              await request("/api/blog/session", "DELETE");
              try { sessionStorage.setItem("hl-one-tap-signed-out", "1"); } catch {}
              window.dispatchEvent(new Event("hl:session-changed"));
              router.replace("/blog-account");
              router.refresh();
            } catch (e) { setNotice(message(e)); setBusy(false); }
          }}>{busy ? "Đang đăng xuất…" : "Đăng xuất"}</button>
        </div>
      </div>
      {notice && <p role="alert" className={styles.notice}>{notice}</p>}
    </section>
  );
}
