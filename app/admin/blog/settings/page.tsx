import { notFound } from "next/navigation";
import { requireStaffPage } from "@/lib/blog/auth";
import { catalog } from "@/lib/blog/repository";
import { Settings } from "@/components/blog-admin/settings";
export default async function Page() {
  const a = await requireStaffPage();
  if (a.role !== "admin") notFound();
  const [authors, taxonomy, members] = await Promise.all([
    catalog("authors", a),
    catalog("taxonomy", a),
    catalog("members", a),
  ]);
  return (
    <Settings
      authors={authors}
      taxonomy={taxonomy}
      members={members}
      viewerEmail={a.email}
      viewerAvatar={a.avatar}
    />
  );
}
