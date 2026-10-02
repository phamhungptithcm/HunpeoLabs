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
        <h2>Chưa thể tải bài viết.</h2>
        <p>Kết nối đang gián đoạn. Bạn có thể thử lại sau ít phút.</p>
        <div className="flex">
          <button className="button primary" onClick={reset}>
            Thử lại
          </button>
          <Link className="button" href="/resources/blog">
            Về blog
          </Link>
        </div>
      </div>
    </main>
  );
}
