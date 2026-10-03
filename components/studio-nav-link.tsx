"use client";

import { ProgressLink as Link } from "@/components/progress-link";
import { useBlogSession } from "./use-blog-session";

export function StudioNavLink({ onNavigate }: { onNavigate?: () => void }) {
  const { actor } = useBlogSession();
  if (!actor || !["admin", "publisher", "author"].includes(actor.role ?? "")) return null;
  return <Link href="/admin/blog" onClick={onNavigate} prefetch={false}>Studio</Link>;
}
