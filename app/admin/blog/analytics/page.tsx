import { notFound } from "next/navigation";
import { requireStaffPage } from "@/lib/blog/auth";
import { TrafficPanel } from "@/components/blog-admin/traffic-panel";
export const metadata = { title: "Phân tích — Studio" };
export default async function AnalyticsPage() {
  const actor = await requireStaffPage();
  if (actor.role !== "admin") notFound();
  return <>
    <div className="studio-title">
      <div className="eyebrow muted">Studio / Phân tích</div>
      <h1>Phân tích</h1>
      <p>Theo dõi lượt ghé website, lượt xem trang và mức độ đọc bài viết.</p>
    </div>
    <TrafficPanel />
  </>;
}
