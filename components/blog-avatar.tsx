"use client";
/* eslint-disable @next/next/no-img-element -- Private media and sanitized Google profile images. */
import { useState } from "react";
import { googleAvatar } from "@/lib/blog/profile";

export function BlogAvatar({ name, className = "", mediaId, photo }: {
  name: string; className?: string; mediaId?: string; photo?: string;
}) {
  const [failed, setFailed] = useState<string[]>([]);
  const src = [mediaId ? `/api/blog/media/${mediaId}` : undefined, googleAvatar(photo)].find(url => url && !failed.includes(url));
  if (src) return <img className={`avatar ${className}`} src={src} alt="" referrerPolicy="no-referrer" onError={() => setFailed(previous => [...previous, src])} />;
  return <span className={`avatar ${className}`} aria-hidden="true">{name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "•"}</span>;
}
