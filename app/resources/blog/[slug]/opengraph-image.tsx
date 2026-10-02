import { ImageResponse } from "next/og";
import { getPublished } from "@/lib/blog/repository";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Hunpeo Labs article";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const p = await getPublished((await params).slug);
  if (!p) return new Response("Not found", { status: 404 });
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        background: "#f4f6f8",
        padding: 70,
        color: "#152431",
      }}
    >
      <div style={{ display: "flex", fontSize: 24, letterSpacing: 4 }}>
        HUNPEO LABS / {p.category.toUpperCase()}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: p.title.length > 90 ? 54 : 70,
          lineHeight: 1.1,
          letterSpacing: -2,
        }}
      >
        {p.title}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 22,
        }}
      >
        <span>{p.author}</span>
        <span>hunpeolabs.com</span>
      </div>
    </div>,
    size,
  );
}
