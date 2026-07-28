import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/app/seo";

export const alt = "Hunpeo Labs — Digital products, AI systems, enterprise engineering";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background: "#f2f0e9",
          color: "#161616",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Arial, sans-serif",
          height: "100%",
          justifyContent: "space-between",
          padding: "72px",
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "center",
            display: "flex",
            fontSize: 30,
            fontWeight: 700,
            justifyContent: "space-between",
          }}
        >
          <span>{SITE_NAME}</span>
          <span style={{ color: "#de4c2f" }}>HL / 01</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              background: "#de4c2f",
              height: 8,
              width: 112,
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 70,
              fontWeight: 700,
              letterSpacing: "-3px",
              lineHeight: 1.05,
              maxWidth: 960,
            }}
          >
            Digital products. AI systems. Enterprise engineering.
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 24 }}>
          Product taste · Engineering depth · Responsible AI
        </div>
      </div>
    ),
    size,
  );
}
