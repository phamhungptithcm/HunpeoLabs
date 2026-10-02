import { notFound } from "next/navigation";
import { requireStaffPage } from "@/lib/blog/auth";
import { moderationQueue } from "@/lib/blog/comments";
import { blogDb } from "@/lib/firebase-admin";
import { Moderation } from "@/components/blog-admin/moderation";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const status = (await searchParams).status ?? "pending";
  const a = await requireStaffPage();
  if (a.role === "author") notFound();
  const items = await moderationQueue(
    a,
    status === "reports" ? "pending" : status,
  );
  const reports = (
    await blogDb()
      .collection("blogCommentReports")
      .where("state", "==", "open")
      .limit(100)
      .get()
  ).docs.map((d) => ({
    id: d.id,
    commentId: String(d.get("commentId")),
    reason: String(d.get("reason")),
  }));
  const expanded = await Promise.all(
    reports.map(async (r) => {
      const c = await blogDb()
        .collection("blogComments")
        .doc(r.commentId)
        .get();
      return {
        ...r,
        text: c.exists ? String(c.get("text")) : "Bình luận đã xóa",
        revision: c.exists ? Number(c.get("revision")) : 0,
      };
    }),
  );
  const postIds = [...new Set(items.map((c) => c.postId))];
  const postTitles = Object.fromEntries(
    await Promise.all(
      postIds.map(async (id) => {
        const d = await blogDb().collection("blogPosts").doc(id).get();
        return [id, String(d.get("title") ?? "Bài viết không còn tồn tại")];
      }),
    ),
  );
  return (
    <Moderation
      items={items}
      reports={expanded}
      status={status}
      postTitles={postTitles}
    />
  );
}
