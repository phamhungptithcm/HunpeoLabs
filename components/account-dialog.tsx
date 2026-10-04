"use client";
import { useEffect, useRef, useId } from "react";
import { createPortal } from "react-dom";
import type { Actor } from "@/lib/blog/schema";
import { Account } from "./blog-admin/account";
import { BlogIcon } from "./blog-admin/ui";
import styles from "./account-dialog.module.css";

export function AccountDialog({ actor, onClose }: { actor: Actor; onClose: () => void }) {
  const titleId = useId();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);
  return createPortal(
    <dialog ref={ref} className={styles.dialog} aria-labelledby={titleId} onCancel={onClose}
      onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      <button type="button" className={styles.close} onClick={onClose} aria-label="Close" title="Close" autoFocus>
        <BlogIcon name="close" size={18} />
      </button>
      <Account name={actor.name} avatar={actor.avatar} staff={["admin", "publisher", "author"].includes(actor.role ?? "")}
        compact headingId={titleId} onSignedOut={onClose} onNavigate={onClose} />
    </dialog>, document.body,
  );
}
