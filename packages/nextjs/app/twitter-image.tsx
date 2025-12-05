import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "NestFi - Decentralized Asset Management Protocol";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0f 0%, #111827 50%, #0f172a 100%)",
          position: "relative",
        }}
      >
        {/* Background glow effects */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "600px",
            height: "400px",
            background: "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            right: "100px",
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "40px",
          }}
        >
          <svg width="80" height="80" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="18" fill="#10B981" />
            <path
              d="M12 26C12 26 14 20 20 20C26 20 28 26 28 26"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M15 22C15 22 16.5 18 20 18C23.5 18 25 22 25 22"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="20" cy="15" r="3" fill="white" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            marginBottom: "24px",
          }}
        >
          <span
            style={{
              fontSize: "72px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.02em",
            }}
          >
            Nest
          </span>
          <span
            style={{
              fontSize: "72px",
              fontWeight: 700,
              color: "#10B981",
              letterSpacing: "-0.02em",
            }}
          >
            Fi
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "28px",
            color: "#9ca3af",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.4,
          }}
        >
          Decentralized Asset Management Protocol
        </div>

        {/* Sub-tagline */}
        <div
          style={{
            fontSize: "20px",
            color: "#6b7280",
            marginTop: "16px",
          }}
        >
          Pool funds • Deploy strategies • Grow together
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: "absolute",
            bottom: "0",
            left: "0",
            right: "0",
            height: "4px",
            background: "linear-gradient(90deg, transparent, #10B981, #14b8a6, #10B981, transparent)",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
