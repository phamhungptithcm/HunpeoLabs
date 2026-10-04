"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { getBlogClientAuth } from "@/lib/blog/firebase-client";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type Auth,
} from "firebase/auth";
import { beginGoogleLogin, createVerifiedGoogleSession } from "@/lib/blog/google-login";
import { message } from "./client";
import { BlogBrand, BlogIcon } from "./ui";
import { needsLoginDocumentReload } from "@/lib/blog/login-document";
import { beginProgress } from "@/lib/ui/action-progress";

export function Login({
  admin = false,
  embedded = false,
  returnTo,
  onSuccess,
  compact = false,
  headingId,
  onBusyChange,
  blocked = false,
}: {
  admin?: boolean;
  embedded?: boolean;
  returnTo?: string;
  onSuccess?: (session: { role: string | null }) => void;
  compact?: boolean;
  headingId?: string;
  onBusyChange?: (busy: boolean) => void;
  blocked?: boolean;
}) {
  const copy = (vi: string, en: string) => embedded ? en : vi;
  const auth = useRef<Auth | null>(null);
  const [ready, setReady] = useState(false),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState("");
  useEffect(() => { onBusyChange?.(busy); }, [busy, onBusyChange]);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const documentUrl = performance.getEntriesByType("navigation")[0]?.name;
    if (!compact && needsLoginDocumentReload(documentUrl, window.location.href)) {
      window.location.reload();
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const a = await getBlogClientAuth();
        auth.current = a;
        if (mounted) {
          setReady(true);
          setNotice("");
        }
      } catch (e) {
        if (mounted) setNotice(message(e, embedded ? "en" : "vi"));
      }
    })();
    return () => {
      mounted = false;
    };
  }, [attempt, embedded, compact]);
  async function login() {
    if (!auth.current || busy || blocked) return;
    const release = beginGoogleLogin();
    if (!release) return;
    setBusy(true);
    setNotice("");
    const provider = new GoogleAuthProvider();
    const finish = beginProgress();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      // Keep the popup call in the click gesture; Firebase was initialized before enabling the button.
      const credential = await signInWithPopup(auth.current, provider);
      const session = await createVerifiedGoogleSession(credential.user);
      await signOut(auth.current);
      try {
        sessionStorage.removeItem("hl-one-tap-signed-out");
      } catch {}
      window.dispatchEvent(new Event("hl:session-changed"));
      if (onSuccess) { onSuccess(session); return; }
      const next =
        returnTo?.startsWith("/resources/blog") && !returnTo.startsWith("//")
          ? returnTo
          : session.role
            ? "/admin/blog"
            : "/resources/blog";
      window.location.assign(next);
    } catch (e) {
      if (auth.current) await signOut(auth.current).catch(() => {});
      setNotice(message(e, embedded ? "en" : "vi"));
      setBusy(false);
    } finally {
      finish();
      release();
    }
  }
  return (
    <div className={`auth-wrap google-auth-wrap${embedded ? " auth-embedded" : ""}${compact ? " auth-popup" : ""}`}>
      {!embedded && <BlogBrand />}
      <section className="auth-panel google-auth-panel" aria-busy={busy || blocked}>
        {!embedded && <div className="google-auth-symbol">
          <BlogIcon name={admin ? "file" : "comment"} size={25} />
        </div>}
        {!embedded && <p className="eyebrow muted">
          HUNPEOLABS / {admin ? "STUDIO" : "JOURNAL"}
        </p>}
        <h1 id={headingId}>{admin ? copy("Đăng nhập Studio", "Sign in to Studio") : copy("Đăng nhập", "Sign in")}</h1>
        <p>
          {admin
            ? copy("Viết và quản lý bài đăng.", "Write and manage posts.")
            : copy("Bình luận và trò chuyện cùng mọi người.", "Join the conversation.")}
        </p>
        <button
          type="button"
          className="google-signin"
          disabled={!ready || busy || blocked}
          onClick={() => void login()}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.61 4.61 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36Z"
            />
            <path
              fill="#34A853"
              d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.05.97-3.38.97-2.61 0-4.82-1.76-5.61-4.12H3.04v2.59A10 10 0 0 0 12 22Z"
            />
            <path
              fill="#FBBC05"
              d="M6.39 13.93a6 6 0 0 1 0-3.86V7.48H3.04a10 10 0 0 0 0 9.04l3.35-2.59Z"
            />
            <path
              fill="#EA4335"
              d="M12 5.95c1.47 0 2.79.51 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.96 5.48l3.35 2.59A5.92 5.92 0 0 1 12 5.95Z"
            />
          </svg>
          {busy || blocked
            ? copy("Đang đăng nhập…", "Signing in\u2026")
            : ready
              ? copy("Tiếp tục với Google", "Continue with Google")
              : copy("Đang kết nối…", "Connecting\u2026")}
        </button>
        {!embedded && <p className="google-auth-note">
          {admin
            ? copy("Chỉ dành cho thành viên được cấp quyền.", "For authorized team members only.")
            : copy("Email của bạn không hiển thị trong bình luận.", "Your email is never shown in comments.")}
        </p>}
        <p role="status" className="auth-status">
          {notice}
        </p>
        {!ready && notice && (
          <button
            className="button small"
            onClick={() => setAttempt((x) => x + 1)}
          >
            {copy("Thử kết nối lại", "Try connecting again")}
          </button>
        )}
        <div className="google-auth-footer" hidden={compact}>
          <Link href="/resources/blog">{copy("← Trở lại Journal", "\u2190 Back to the blog")}</Link>
          <Link href="/privacy">{copy("Quyền riêng tư", "Privacy")}</Link>
        </div>
      </section>
    </div>
  );
}
