import { ImageResponse } from "next/og";
import { zMarkPaths } from "@/components/brand/ZMark";
import { brandColors } from "@/lib/brand-colors";

// iOS home-screen icon: Ivory Z on Taupe (iOS applies its own rounding).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const MARK_PX = 104;

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
          {zMarkPaths.map((path) => (
            <path key={path.d} d={path.d} strokeWidth={path.strokeWidth} />
          ))}
        </svg>
      </div>
    ),
    size,
  );
}
