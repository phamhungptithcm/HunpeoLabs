import Link from "next/link";
import { requireStaffPage } from "@/lib/blog/auth";
import { getDraft, catalog } from "@/lib/blog/repository";
import { BlogContent } from "@/components/blog-content";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const a = await requireStaffPage();
  const p = await getDraft((await params).id, a);
  const authors = (await catalog("authors", a)) as {
    id: string;
    name: string;
  }[];
  return (
    <>
      <p className="preview-banner">
        Xem trước — chỉ bạn và người biên tập thấy ·{" "}
        <Link href={`/admin/blog/${p.id}`}>Tiếp tục viết</Link>
      </p>
      <BlogContent
        post={{
          ...p,
          author:
            authors.find((x) => x.id === p.authorId)?.name ??
            "Chưa chọn tác giả",
          publishedAt: p.publishedAt ?? p.updatedAt,
          readingMinutes: 1,
        }}
        url=""
        preview
      />
    </>
  );
}
