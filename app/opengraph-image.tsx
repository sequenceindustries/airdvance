import { ImageResponse } from "next/og";

export const alt = "Airdvance — Cash advance before payday, R300 to R1,000";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const DOTS = [
  { x: 90, y: 80, s: 150, a: "#FFB020", b: "#FF5E3A" },
  { x: 980, y: 60, s: 130, a: "#FFE066", b: "#FFB020" },
  { x: 150, y: 430, s: 120, a: "#FF5E3A", b: "#E0367A" },
  { x: 1000, y: 400, s: 170, a: "#34D399", b: "#4F46E5" },
  { x: 560, y: 520, s: 70, a: "#7C9CFF", b: "#1E293B" },
];

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#000", position: "relative", fontFamily: "sans-serif" }}>
        {DOTS.map((d, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: d.x,
              top: d.y,
              width: d.s,
              height: d.s,
              borderRadius: 9999,
              background: `radial-gradient(circle at 30% 25%, ${d.a}, ${d.b})`,
            }}
          />
        ))}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", color: "#fff" }}>
          <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1, opacity: 0.9 }}>airdvance</div>
          <div style={{ fontSize: 86, fontWeight: 800, letterSpacing: -3, marginTop: 24, textAlign: "center", lineHeight: 1.02 }}>Cash advance</div>
          <div style={{ fontSize: 86, fontWeight: 800, letterSpacing: -3, textAlign: "center", lineHeight: 1.02 }}>before payday.</div>
          <div style={{ fontSize: 32, marginTop: 28, color: "#A8A8B3" }}>R300 to R1,000, repaid in one go on payday.</div>
        </div>
      </div>
    ),
    size,
  );
}
