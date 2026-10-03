"use client";
import { useEffect, useId, useState } from "react";

let rendering = Promise.resolve();
export function MermaidDiagram({ source }: { source: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [result, setResult] = useState<{ source: string; url?: string; error?: boolean } | null>(null);
  useEffect(() => {
    let cancelled = false;
    let url: string | undefined;
    const timer = window.setTimeout(() => {
      rendering = rendering.catch(() => {}).then(async () => {
        try {
          if (!source.trim() || source.length > 10000) throw new Error("INVALID_DIAGRAM");
          const { default: mermaid } = await import("mermaid");
          if (cancelled) return;
          mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: "neutral", htmlLabels: false, flowchart: { htmlLabels: false }, maxTextSize: 10000, maxEdges: 200, suppressErrorRendering: true });
          const { svg } = await mermaid.render(`diagram${id}`, source);
          if (cancelled) return;
          url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
          setResult({ source, url });
        } catch {
          if (!cancelled) setResult({ source, error: true });
        }
      });
    }, 250);
    return () => { cancelled = true; window.clearTimeout(timer); if (url) URL.revokeObjectURL(url); };
  }, [source, id]);
  return <figure className="mermaid-diagram">
    {result?.source === source && result.url ? (
      // eslint-disable-next-line @next/next/no-img-element -- Isolated SVG blob generated locally with strict Mermaid security.
      <img src={result.url} alt="Sơ đồ Mermaid" />
    ) : <p role="status">{result?.source === source && result.error ? "Chưa vẽ được sơ đồ. Kiểm tra lại cú pháp Mermaid." : "Đang vẽ sơ đồ…"}</p>}
    <details><summary>Xem mã sơ đồ</summary><pre><code>{source}</code></pre></details>
  </figure>;
}
