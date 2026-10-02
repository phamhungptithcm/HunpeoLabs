"use client";

import Script from "next/script";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { beginProgress } from "@/lib/ui/action-progress";

type GoogleIdentity = {
  initialize: (options: {
    client_id: string;
    auto_select: boolean;
    use_fedcm_for_prompt: boolean;
    cancel_on_tap_outside: boolean;
    context: string;
    callback: (response: { credential: string }) => void;
  }) => void;
  prompt: () => void;
  cancel: () => void;
};
const identity = () =>
  (
    window as Window & {
      google?: { accounts?: { id?: GoogleIdentity } };
    }
  ).google?.accounts?.id;

export function GoogleOneTap() {
  const path = usePathname();
  const router = useRouter();
  const clientId = process.env.NEXT_PUBLIC_BLOG_GOOGLE_CLIENT_ID || "";
  const eligible =
    process.env.NEXT_PUBLIC_BLOG_ONE_TAP_ENABLED === "true" &&
    /^\d+-[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/.test(clientId) &&
    !path.startsWith("/admin/") &&
    path !== "/blog-account";
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const busy = useRef(false);
  const attempted = useRef(false);

  useEffect(() => {
    if (!eligible) return;
    try {
      if (sessionStorage.getItem("hl-one-tap-signed-out")) return;
    } catch {}
    const controller = new AbortController();
    fetch("/api/blog/session", { cache: "no-store", signal: controller.signal })
      .then((response) => {
        // A provider outage must not be mistaken for an anonymous session.
        if (!controller.signal.aborted && response.status === 401)
          setLoad(true);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [eligible]);

  useEffect(() => {
    const google = identity();
    if (!eligible || !load || !ready || !google || attempted.current) return;
    let active = true;
    google.initialize({
      client_id: clientId,
      auto_select: false,
      use_fedcm_for_prompt: true,
      cancel_on_tap_outside: true,
      context: "signin",
      callback: async ({ credential }) => {
        if (!active || busy.current) return;
        busy.current = true;
        const finish = beginProgress();
        setNotice("Signing in…");
        try {
          const { createOneTapSession } =
            await import("@/lib/blog/google-one-tap");
          if (!active) return;
          await createOneTapSession(credential);
          if (!active) return;
          google.cancel();
          window.dispatchEvent(new Event("hl:session-changed"));
          setNotice("Signed in.");
          router.refresh();
        } catch {
          if (active) setNotice("Could not sign in. Please try again.");
        } finally {
          finish();
          busy.current = false;
        }
      },
    });
    attempted.current = true;
    google.prompt();
    return () => {
      active = false;
      google.cancel();
    };
  }, [eligible, load, ready, clientId, router]);

  if (!eligible) return null;
  return (
    <>
      {load && (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onReady={() => setReady(true)}
        />
      )}
      {notice && (
        <div className="one-tap-notice" role="status">
          {notice}{" "}
          {notice.startsWith("Could not") && (
            <Link href="/blog-account">Sign in</Link>
          )}
        </div>
      )}
    </>
  );
}
