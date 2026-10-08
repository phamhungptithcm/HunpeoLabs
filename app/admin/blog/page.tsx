import { postStats } from "@/lib/traffic/repository";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/blog/auth";
import { BlogError } from "@/lib/blog/schema";
import { listDrafts, workspaceSummary, catalog } from "@/lib/blog/repository";
import { Dashboard } from "@/components/blog-admin/dashboard";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    cursor?: string;
    q?: string;
    state?: string;
    category?: string;
  }>;
}) {
  const options = await searchParams;
  let result;
  let summary;
  let authors;
  let metrics: Record<string, { views: number | null; reads: number | null }> | null = null;
  try {
    const actor = await requireStaff();
    [result, summary, authors] = await Promise.all([
      listDrafts(actor, options),
      workspaceSummary(actor),
      catalog("authors", actor),
    ]);
    try { metrics = await postStats(result.items.map(p => p.id)); } catch { /* Stats failure must not block editing. */ }
  } catch (e) {
    if (e instanceof BlogError && e.status === 401)
      redirect("/admin/blog/login");
    if (e instanceof BlogError && [403, 503].includes(e.status))
      return (
        <section>
          <h1>Chưa thể mở Studio</h1>
          <p>
            {e.status === 403
              ? "Tài khoản này chưa được cấp quyền vào Studio."
              : "Studio chưa sẵn sàng. Hãy thử lại sau."}
          </p>
        </section>
      );
    throw e;
  }
  return (
    <Dashboard
      posts={result.items}
      metrics={metrics}
      next={result.next}
      query={options}
      summary={summary}
      authors={Object.fromEntries(
        authors.map((a) => [a.id, "name" in a ? String(a.name) : ""]),
      )}
    />
  );
}
