import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const ogSize = { width: 1200, height: 630 };

export function renderOgImage({ title, eyebrow, footer }: { title: string; eyebrow?: string; footer?: string }) {
  const fontSize = title.length > 80 ? 52 : title.length > 50 ? 62 : 72;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "#0f0a1f",
          borderTop: "10px solid #7c3aed",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
              fontWeight: 800,
              background: "#7c3aed",
            }}
          >
            T
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, display: "flex" }}>
            TechUpdates<span style={{ color: "#c4b5fd" }}>Zone</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {eyebrow && (
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                padding: "8px 20px",
                borderRadius: 999,
                fontSize: 24,
                fontWeight: 600,
                color: "#ddd6fe",
                border: "2px solid rgba(196, 181, 253, 0.4)",
                background: "rgba(124, 58, 237, 0.25)",
              }}
            >
              {eyebrow}
            </div>
          )}
          <div style={{ fontSize, fontWeight: 800, lineHeight: 1.1, letterSpacing: -1.5, display: "flex" }}>{title}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#a1a1aa" }}>
          <span>{footer || SITE_TAGLINE}</span>
          <span>{SITE_NAME.toLowerCase()}</span>
        </div>
      </div>
    ),
    ogSize
  );
}
