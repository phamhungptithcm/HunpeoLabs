"use client";
import Link from "next/link";
import { useBlogSession } from "./use-blog-session";
import { BlogIcon } from "./blog-admin/ui";
export function BlogAccountLink() {
  const { actor, checked } = useBlogSession();
  if (!checked || actor) return null;
  return <Link className="arrow-link" href="/blog-account">Sign in <BlogIcon name="arrow" size={14} /></Link>;
}
