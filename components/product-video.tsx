"use client";

import { useRef, useState } from "react";
import { ProductHeroVisual } from "@/components/product-detail-visuals";
import type { ProductPageSlug } from "@/content/product-pages";

type ProductVideoProps = {
  slug: ProductPageSlug;
  src: string;
  poster: string;
  label: string;
  duration: string;
  caption: string;
};

export function ProductVideo({
  slug,
  src,
  poster,
  label,
  duration,
  caption,
}: ProductVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const captionId = `product-demo-caption-${label.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}`;

  async function playDemo() {
    setPlaying(true);
    await videoRef.current?.play();
  }

  return (
    <figure
      className={`product-demo product-demo--${slug}${playing ? " is-playing" : ""}`}
      id="demo"
    >
      <div className="product-demo__bar">
        <span>{duration} / {label}</span>
        <span>{slug === "gig" ? "Review ready" : "Real product demo"}</span>
      </div>
      <div className="product-demo__stage">
        <div className="product-demo__cover">
          <ProductHeroVisual slug={slug} />
          {slug === "gig" ? (
            <div className="product-demo__scrubber" aria-hidden="true">
              <span>00:06</span>
              <i><em /></i>
              <span>00:14</span>
              <b>⛶</b>
            </div>
          ) : null}
          <button aria-label={`Play ${label}`} onClick={playDemo} type="button">
            <span aria-hidden="true">▶</span>
            <span>Play real demo</span>
          </button>
        </div>
        <video
          aria-describedby={captionId}
          controls
          muted
          playsInline
          poster={poster}
          preload="metadata"
          ref={videoRef}
        >
          <source src={src} type="video/mp4" />
          Your browser does not support embedded video.
        </video>
      </div>
      <figcaption id={captionId}>{caption}</figcaption>
    </figure>
  );
}

export function ProductCommand({ command }: { command: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function copyCommand() {
    try {
      await navigator.clipboard.writeText(command);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  }

  return (
    <div className="product-command">
      <span aria-hidden="true">$</span>
      <code>{command}</code>
      <button onClick={copyCommand} type="button">
        {status === "copied" ? "Copied" : status === "failed" ? "Select command" : "Copy"}
      </button>
    </div>
  );
}
