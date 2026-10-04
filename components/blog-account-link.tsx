"use client";
import { useBlogSession } from "./use-blog-session";
import { openSignIn } from "./sign-in-dialog";
import { BlogIcon } from "./blog-admin/ui";
export function BlogAccountLink() {
  const { actor, checked } = useBlogSession();
  if (!checked || actor) return null;
  return <button type="button" className="arrow-link sign-in-trigger" aria-haspopup="dialog" onClick={openSignIn}>Sign in <BlogIcon name="arrow" size={14} /></button>;
}
