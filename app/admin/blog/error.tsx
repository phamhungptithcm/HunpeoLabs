"use client";
import Link from "next/link";
import { BlogIcon } from "@/components/blog-admin/ui";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <section className="state-card">
      <div className="state-icon">
        <BlogIcon name="shield" />
      </div>
      <h1>Chưa thể mở nội dung.</h1>
      <p>Thử lại hoặc đăng nhập lại để tiếp tục.</p>
      <div className="flex">
        <button className="button" onClick={reset}>
          Thử lại
        </button>
        <Link className="button primary" href="/admin/blog/login">
          Đăng nhập lại
        </Link>
      </div>
    </section>
  );
}
