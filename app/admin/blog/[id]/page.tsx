import { requireStaffPage } from "@/lib/blog/auth";
import { getDraft, catalog, assignableMembers } from "@/lib/blog/repository";
import { Editor } from "@/components/blog-editor/editor";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const a = await requireStaffPage();
  const p = await getDraft((await params).id, a);
  const publisher = a.role === "publisher" || a.role === "admin";
  const [authors, members, categories] = await Promise.all([
    catalog("authors", a),
    publisher ? assignableMembers(a) : Promise.resolve([]),
    catalog("taxonomy", a),
  ]);
  return (
    <Editor
      initial={p}
      authors={authors as { id: string; name: string }[]}
      publisher={publisher}
      members={members}
      categories={categories
        .map((c) => ("name" in c ? String(c.name) : ""))
        .filter(Boolean)}
    />
  );
}
