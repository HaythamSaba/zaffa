import { ImageResponse } from "next/og";
import { brandColors } from "@/lib/brand-colors";

// iOS home-screen icon: Paper Z on Zaffa Coral (iOS applies its own rounding).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const MARK_PX = 112;

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: brandColors.taupe,
        }}
      >
        <svg
          width={MARK_PX}
          height={MARK_PX}
          viewBox="0 0 24 24"
          fill="none"
          stroke={brandColors.ivory}
          strokeLinecap="round"
        >
          <path d="M4.5 4.5H19.5" strokeWidth="3.5" />
          <path d="M19.5 4.5C14 8.5 10 15.5 4.5 19.5" strokeWidth="3" />
          <path d="M4.5 19.5H19.5" strokeWidth="2.5" />
        </svg>
      </div>
    ),
    size,
  );
}
