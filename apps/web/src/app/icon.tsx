import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f6f3ee",
          color: "#1f1e1b",
          fontFamily: "Georgia, serif",
          fontSize: 44,
          fontWeight: 400,
          letterSpacing: -2,
          position: "relative",
        }}
      >
        <span>S</span>
        <span
          style={{
            position: "absolute",
            right: 10,
            top: 10,
            width: 6,
            height: 6,
            borderRadius: 999,
            background: "#c15f3c",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
