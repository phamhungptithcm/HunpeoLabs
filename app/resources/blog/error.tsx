"use client";
import Link from "next/link";
import { BlogIcon } from "@/components/blog-admin/ui";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="container">
      <div className="state-card journal-empty">
        <div className="state-icon">
          <BlogIcon name="warning" />
        </div>
        <h2>Could not load this post.</h2>
        <p>The connection was interrupted. Please try again shortly.</p>
        <div className="flex">
          <button className="button primary" onClick={reset}>
            Try again
          </button>
          <Link className="button" href="/resources/blog">
            Back to blog
          </Link>
        </div>
      </div>
    </main>
  );
}
