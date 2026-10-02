import { api } from "@/lib/blog/http";
import { requireStaff } from "@/lib/blog/auth";
import { BlogError } from "@/lib/blog/schema";
import { blogDb } from "@/lib/firebase-admin";
export const GET = () =>
  api(async () => {
    const a = await requireStaff();
    if (a.role !== "admin") throw new BlogError(403, "FORBIDDEN");
    const collections = [
      "blogPosts",
      "blogPublished",
      "blogAuthors",
      "blogCategories",
      "blogSlugs",
      "blogMedia",
    ];
    const data: Record<string, unknown> = {
      schemaVersion: 1,
      createdAt: new Date().toISOString(),
    };
    for (const name of collections) {
      const snap = await blogDb().collection(name).limit(1001).get();
      if (snap.size > 1000) throw new BlogError(413, "USE_OPERATOR_BACKUP");
      data[name] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
    return data;
  });
