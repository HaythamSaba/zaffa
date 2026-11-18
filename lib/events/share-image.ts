import { readFile } from "node:fs/promises";
import { join, normalize, sep } from "node:path";
import sharp from "sharp";
import { classicPalette } from "@/templates/classic/palette";

/** Open Graph size that WhatsApp, iMessage and Facebook all crop well. */
export const SHARE_IMAGE_SIZE = { width: 1200, height: 630 } as const;

const JPEG_QUALITY = 78;
/** Refuse decompression bombs: ~40 megapixels is far above any real photo. */
const MAX_INPUT_PIXELS = 40_000_000;
const PUBLIC_DIR = join(process.cwd(), "public");

/**
 * The bytes of a photo under public/ ("/images/..."). Null when missing or a
 * path that would leave public/. Remote (https) photos are deliberately not
 * fetched yet: when Storage uploads arrive (week 4), allow only the project's
 * Supabase Storage origin, with redirects off and a streamed size cap (SSRF).
 */
export async function loadPhoto(url: string | null | undefined): Promise<Buffer | null> {
  if (!url || !url.startsWith("/") || url.startsWith("//")) return null;
  const path = normalize(join(PUBLIC_DIR, url));
  if (!path.startsWith(PUBLIC_DIR + sep)) return null;
  try {
    return await readFile(path);
  } catch {
    return null;
  }
}

/** A parchment card with the template's double gold frame (no text, no fonts needed). */
function framedCardSvg(): Buffer {
  const { width, height } = SHARE_IMAGE_SIZE;
  const { parchment, gold } = classicPalette;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect width="100%" height="100%" fill="${parchment}"/>
      <rect x="28" y="28" width="${width - 56}" height="${height - 56}" fill="none" stroke="${gold}" stroke-width="2"/>
      <rect x="40" y="40" width="${width - 80}" height="${height - 80}" fill="none" stroke="${gold}" stroke-width="1"/>
    </svg>`,
  );
}

/**
 * The invitation's link-preview image: the couple photo cropped to 1200x630
 * around its most interesting area, as a compact JPEG. The names and date are
 * in the preview's title, so the image needs no text.
 */
export async function renderShareImage(photo: Buffer | null): Promise<Buffer> {
  const source = sharp(photo ?? framedCardSvg(), { limitInputPixels: MAX_INPUT_PIXELS });
  return source
    .resize({ ...SHARE_IMAGE_SIZE, fit: "cover", position: sharp.strategy.attention })
    .flatten({ background: classicPalette.parchment })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer();
}
