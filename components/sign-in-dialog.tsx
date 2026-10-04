"use client";
import { useEffect, useRef, useState, useId } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
const Login = dynamic(() => import("./blog-admin/login").then(module => module.Login), {
  loading: () => <p role="status">Connecting…</p>,
});
import { BlogIcon } from "./blog-admin/ui";
import { useBlogSession } from "./use-blog-session";
import { AccountDialog } from "./account-dialog";
import styles from "./account-dialog.module.css";

export function openSignIn() { window.dispatchEvent(new Event("hl:open-sign-in")); }
export function SignInDialog() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [externalBusy, setExternalBusy] = useState(false);
  useEffect(() => {
    const update = (event: Event) => setExternalBusy(Boolean((event as CustomEvent<boolean>).detail));
    window.addEventListener("hl:google-login-busy", update);
    return () => window.removeEventListener("hl:google-login-busy", update);
  }, []);
  const { actor } = useBlogSession();
  const router = useRouter();
  const params = useSearchParams();
  const studio = useRef(false);
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const show = () => { studio.current = false; setOpen(true); };
    window.addEventListener("hl:open-sign-in", show);
    return () => window.removeEventListener("hl:open-sign-in", show);
  }, []);
  useEffect(() => {
    if (params.get("signin") !== "1") return;
    studio.current = params.get("studio") === "1";
    const timer = window.setTimeout(() => {
      setOpen(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("signin");
      url.searchParams.delete("studio");
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [params]);
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("hl:sign-in-visible", { detail: open }));
    return () => { window.dispatchEvent(new CustomEvent("hl:sign-in-visible", { detail: false })); };
  }, [open]);
  useEffect(() => {
    if (!open || actor) return;
    const dialog = ref.current;
    const overflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => { dialog?.close(); document.body.style.overflow = overflow; };
  }, [open, actor]);
  if (!open) return null;
  if (actor) return <AccountDialog actor={actor} onClose={() => setOpen(false)} />;
  const close = () => { if (!busy && !externalBusy) setOpen(false); };
  return createPortal(
    <dialog ref={ref} className={`${styles.dialog} blog-surface`} aria-label="Sign in"
      onCancel={event => { event.preventDefault(); close(); }}
      onClick={event => { if (event.currentTarget === event.target) close(); }}>
      <button type="button" className={styles.close} onClick={close} disabled={busy || externalBusy} aria-label="Close" title="Close" autoFocus>
        <BlogIcon name="close" size={18} />
      </button>
      <Login embedded compact blocked={externalBusy} headingId={titleId} onBusyChange={setBusy} onSuccess={session => {
        setOpen(false); setBusy(false);
        if (studio.current && session.role) router.push("/admin/blog");
        router.refresh();
      }} />
    </dialog>, document.body,
  );
}
