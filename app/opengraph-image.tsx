import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { brandColors } from "@/lib/brand-colors";

// Link preview (WhatsApp, Instagram, etc.): Paper wordmark on Night Indigo + Saffron dot.
export const alt = "zaffa";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const WORDMARK_PX = 220;
const DOT_PX = 34;

// Static Fraunces 600 (SOFT 100) subset containing only the glyphs of "zaffa".
const fraunces = await readFile(join(process.cwd(), "assets/fonts/fraunces-600-soft-zaffa.ttf"));

export default function OpenGraphImage() {
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
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <span
            style={{
              fontFamily: "Fraunces",
              fontSize: WORDMARK_PX,
              fontWeight: 600,
              lineHeight: 1,
              letterSpacing: "-0.01em",
              color: brandColors.ivory,
            }}
          >
            zaffa
          </span>
          <span
            style={{
              width: DOT_PX,
              height: DOT_PX,
              borderRadius: "50%",
              background: brandColors.ivory,
              marginLeft: 14,
              marginBottom: 40,
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Fraunces", data: fraunces, style: "normal", weight: 600 }],
    },
  );
}
