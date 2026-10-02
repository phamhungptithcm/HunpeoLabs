"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Actor } from "@/lib/blog/schema";

export function useBlogSession() {
  const pathname = usePathname();
  const [actor, setActor] = useState<Actor | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let controller: AbortController | undefined;
    async function checkSession() {
      controller?.abort();
      const current = new AbortController();
      controller = current;
      try {
        const response = await fetch("/api/blog/session", {
          cache: "no-store",
          credentials: "same-origin",
          signal: current.signal,
        });
        const actor = response.ok ? await response.json() : null;
        if (!current.signal.aborted) {
          setActor(actor?.verified === true ? actor : null);
          setChecked(true);
        }
      } catch {
        if (!current.signal.aborted) { setActor(null); setChecked(true); }
      }
    }
    const refresh = () => {
      if (document.visibilityState === "visible") void checkSession();
    };
    void checkSession();
    window.addEventListener("focus", refresh);
    window.addEventListener("hl:session-changed", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      controller?.abort();
      window.removeEventListener("focus", refresh);
      window.removeEventListener("hl:session-changed", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [pathname]);

  return { actor, checked };
}
