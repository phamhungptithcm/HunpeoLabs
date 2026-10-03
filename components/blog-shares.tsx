"use client";
import { useEffect, useState } from "react";
import { SHARE_COUNT_EVENT, validShareCount } from "@/lib/blog/share-count";

export function BlogShares({ postId, language = "en" }: { postId: string; language?: string }) {
  const [result, setResult] = useState<{ postId: string; shares: number } | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    const update = (shares: number) => setResult(previous => ({
      postId,
      // Avoid a slow initial GET or an earlier action response overwriting a newer count.
      shares: previous?.postId === postId ? Math.max(previous.shares, shares) : shares,
    }));
    const onShare = (event: Event) => {
      const detail: unknown = (event as CustomEvent<unknown>).detail;
      if (validShareCount(detail) && "postId" in detail && detail.postId === postId)
        update(detail.shares);
    };
    window.addEventListener(SHARE_COUNT_EVENT, onShare);
    void fetch(`/api/blog/shares?postId=${encodeURIComponent(postId)}`, {
      cache: "no-store", signal: controller.signal,
    }).then(async response => {
      if (!response.ok) return;
      const data: unknown = await response.json();
      if (validShareCount(data) && !controller.signal.aborted) update(data.shares);
    }).catch(() => { /* Article rendering does not depend on statistics. */ });
    return () => {
      controller.abort();
      window.clearTimeout(timeout);
      window.removeEventListener(SHARE_COUNT_EVENT, onShare);
    };
  }, [postId]);
  if (!result || result.postId !== postId) return null;
  const label = language === "vi" ? "lượt chia sẻ" : result.shares === 1 ? "share" : "shares";
  return (
    <span className="blog-shares" title="Sharing actions from this website, including copied links">
      {" · "}<span style={{ whiteSpace: "nowrap" }}>{new Intl.NumberFormat(language).format(result.shares)} {label}</span>
    </span>
  );
}
