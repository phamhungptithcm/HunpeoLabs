"use client";

import { AccountDialog } from "./account-dialog";
import { useState } from "react";
import { useBlogSession } from "./use-blog-session";
import { googleAvatar } from "@/lib/blog/profile";
import styles from "./nav-account.module.css";

export function NavAccount({ onNavigate }: { onNavigate?: () => void }) {
  const { actor } = useBlogSession();
  const [open, setOpen] = useState(false);
  const [failedImage, setFailedImage] = useState("");
  if (!actor) return null;
  const avatar = googleAvatar(actor.avatar);
  return (
    <>
      <button type="button" className={styles.account} aria-haspopup="dialog" aria-expanded={open} onClick={() => { onNavigate?.(); setOpen(true); }} aria-label={`Account for ${actor.name}`}>
        {avatar && avatar !== failedImage ? (
          // Google identity image is intentionally loaded without the Next image proxy.
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.avatar} src={avatar} alt="" referrerPolicy="no-referrer" onError={() => setFailedImage(avatar)} />
        ) : (
          <span className={styles.avatar} aria-hidden="true">{actor.name.trim().slice(0, 1).toUpperCase()}</span>
        )}
        <span className={styles.name}>{actor.name}</span>
      </button>
      {open && <AccountDialog actor={actor} onClose={() => setOpen(false)} />}
    </>
  );
}
