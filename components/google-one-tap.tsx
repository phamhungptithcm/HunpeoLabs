"use client";

import { openSignIn } from "./sign-in-dialog";
import { BlogToast } from "./blog-admin/toast";
import Script from "next/script";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { beginProgress } from "@/lib/ui/action-progress";
import { useBlogSession } from "./use-blog-session";

import { createOneTapController, type GoogleOneTapIdentity } from "@/lib/blog/one-tap-controller";
import { blogSessionStore } from "@/lib/blog/session-store";
import { beginGoogleLogin } from "@/lib/blog/google-login";
import { message } from "./blog-admin/client";

const identity = () =>
  (
    window as Window & {
      google?: { accounts?: { id?: GoogleOneTapIdentity } };
    }
  ).google?.accounts?.id;

export function GoogleOneTap() {
  const path = usePathname();
  const router = useRouter();
  const clientId = process.env.NEXT_PUBLIC_BLOG_GOOGLE_CLIENT_ID || "";
  const eligible =
    process.env.NEXT_PUBLIC_BLOG_ONE_TAP_ENABLED !== "false" &&
    /^\d+-[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/.test(clientId) &&
    !path.startsWith("/admin/") &&
    path !== "/blog-account";
  const { status } = useBlogSession(eligible);
  const [manualOpen, setManualOpen] = useState(false);
  useEffect(() => {
    const update = (event: Event) => setManualOpen(Boolean((event as CustomEvent<boolean>).detail));
    window.addEventListener("hl:sign-in-visible", update);
    return () => window.removeEventListener("hl:sign-in-visible", update);
  }, []);
  const load = !manualOpen && eligible && status === "anonymous" && !signedOut();
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [failed, setFailed] = useState(false);
  const controller = useRef<ReturnType<typeof createOneTapController> | null>(null);

  useEffect(() => {
    const google = identity();
    if (!ready || !google) return;
    const current = createOneTapController(google, clientId, {
      start: () => {
        const release = beginGoogleLogin();
        if (!release) return null;
        setFailed(false); setNotice("Signing in…");
        const finish = beginProgress();
        return () => { finish(); release(); };
      },
      exchange: async credential => {
        const { createOneTapSession } = await import("@/lib/blog/google-one-tap");
        await createOneTapSession(credential);
      },
      success: () => {
        try { sessionStorage.removeItem("hl-one-tap-signed-out"); } catch {}
        setNotice("");
        window.dispatchEvent(new Event("hl:session-changed"));
        router.refresh();
      },
      error: error => { setFailed(true); setNotice(message(error, "en")); },
    });
    controller.current = current;
    return () => { current.dispose(); controller.current = null; };
  }, [ready, clientId, router]);

  useEffect(() => { controller.current?.update(load); }, [load, ready, clientId]);

  if (!eligible) return null;
  return (
    <>
      {eligible && (load || ready) && (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onReady={() => setReady(true)}
          onError={() => { setFailed(true); setNotice("Could not connect to Google. Please try again."); }}
        />
      )}
      {notice && <BlogToast text={notice} language="en" kind={failed ? "error" : "info"}
        pending={!failed} onClose={() => setNotice("")} actions={failed ? <>
          <button type="button" onClick={() => { if (!controller.current) { window.location.reload(); return; } setNotice(""); controller.current.retry(); blogSessionStore.refresh(); }}>Try again</button>
          <button type="button" onClick={() => { setNotice(""); openSignIn(); }}>Other options</button>
        </> : undefined} />}

    </>
  );
}

function signedOut() {
  try {
    return Boolean(sessionStorage.getItem("hl-one-tap-signed-out"));
  } catch {
    return false;
  }
}
