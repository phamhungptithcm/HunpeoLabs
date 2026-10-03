"use client";
import { useEffect, useState } from "react";
import { viewSession } from "@/lib/blog/view-session";

export function BlogViews({ postId, language = "en" }: { postId: string; language?: string }) {
  const [result, setResult] = useState<{ postId: string; views: number } | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    let started = false;
    let timeout: number | undefined;
    const start = () => {
      if (started || document.visibilityState !== "visible") return;
      started = true;
      timeout = window.setTimeout(() => controller.abort(), 10000);
      void (async () => {
        let session: string | null = null;
        try {
          session = viewSession(window.sessionStorage, () => crypto.randomUUID());
        } catch {
          // Storage unavailable: display the count without recording.
        }
        const response = await fetch(`/api/blog/views?postId=${encodeURIComponent(postId)}`, {
          method: session ? "POST" : "GET",
          headers: session ? { "Content-Type": "application/json", "x-blog-request": "1" } : undefined,
          body: session ? JSON.stringify({ postId, session }) : undefined,
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) return;
        const data: unknown = await response.json();
        if (
          data && typeof data === "object" && "views" in data &&
          typeof data.views === "number" && Number.isSafeInteger(data.views) &&
          data.views >= 0 && !controller.signal.aborted
        ) {
          setResult({ postId, views: data.views });
        }
      })().catch(() => { /* Counts never interrupt article reading. */ });
    };
    document.addEventListener("visibilitychange", start);
    start();
    return () => {
      controller.abort();
      window.clearTimeout(timeout);
      document.removeEventListener("visibilitychange", start);
    };
  }, [postId]);
  if (!result || result.postId !== postId) return null;
  const label = language === "vi" ? "lượt xem" : result.views === 1 ? "view" : "views";
  return <span className="blog-views"> · <span style={{ whiteSpace: "nowrap" }}>{new Intl.NumberFormat(language).format(result.views)} {label}</span></span>;
}
