import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { sprigBud, sprigPaths } from "@/components/marketing/botanicals";
import { brandColors } from "@/lib/brand-colors";

// Link preview (WhatsApp, Instagram, etc.): the Ivory ZAFFA wordmark centred on
// Taupe, with a small Ivory botanical sprig above it (docs/brand.md).
export const alt = "Zaffa";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const WORDMARK_PX = 132;
// +0.32em tracking, in px for the renderer.
const WORDMARK_TRACKING_PX = Math.round(WORDMARK_PX * 0.32);
const SPRIG_PX = 92;

// Static Cormorant Garamond 500 subset containing only Z, A and F (OFL, see assets/fonts).
const cormorant = await readFile(join(process.cwd(), "assets/fonts/cormorant-garamond-500-zaffa.ttf"));

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 36,
          background: brandColors.taupe,
        }}
      >
        <svg
          width={SPRIG_PX}
          height={SPRIG_PX}
          viewBox="0 0 60 60"
          fill="none"
          stroke={brandColors.ivory}
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {sprigPaths.map((d) => (
            <path key={d} d={d} />
          ))}
          <circle cx={sprigBud.cx} cy={sprigBud.cy} r={sprigBud.r} />
        </svg>
        <span
          style={{
            fontFamily: "Cormorant Garamond",
            fontSize: WORDMARK_PX,
            fontWeight: 500,
            lineHeight: 1,
            letterSpacing: WORDMARK_TRACKING_PX,
            // Trailing tracking would push the word off-centre.
            marginRight: -WORDMARK_TRACKING_PX,
            color: brandColors.ivory,
          }}
        >
          ZAFFA
        </span>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Cormorant Garamond", data: cormorant, style: "normal", weight: 500 }],
    },
  );
}
