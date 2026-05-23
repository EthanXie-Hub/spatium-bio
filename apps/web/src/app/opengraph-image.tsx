import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Spatium Bio — a workspace for computational biology";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px 88px",
          background: "#f6f3ee",
          color: "#1f1e1b",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 16,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#6b6760",
          }}
        >
          SPATIUM BIO · IN PROGRESS
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div
            style={{
              fontSize: 128,
              lineHeight: 1.02,
              letterSpacing: -3,
              fontWeight: 400,
              maxWidth: 1000,
            }}
          >
            Biology, rendered as space.
          </div>
          <div
            style={{
              fontSize: 26,
              lineHeight: 1.4,
              color: "#4a4742",
              maxWidth: 880,
              fontFamily:
                "system-ui, -apple-system, 'Segoe UI', Inter, sans-serif",
            }}
          >
            A workspace I&apos;m building while I learn the field. Open source, in
            public.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 15,
            color: "#6b6760",
            letterSpacing: 1,
          }}
        >
          <span>
            <span style={{ color: "#c15f3c" }}>●</span>
            <span style={{ marginLeft: 10 }}>by Ethan Xie · MIT</span>
          </span>
          <span>github.com/EthanXie-Hub/spatium-bio</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
