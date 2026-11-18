import { readFile } from "node:fs/promises";
import { join, normalize, sep } from "node:path";
import sharp from "sharp";
import { classicPalette } from "@/templates/classic/palette";

/** Open Graph size that WhatsApp, iMessage and Facebook all crop well. */
export const SHARE_IMAGE_SIZE = { width: 1200, height: 630 } as const;

const JPEG_QUALITY = 78;
const REMOTE_TIMEOUT_MS = 5000;
const MAX_REMOTE_BYTES = 10 * 1024 * 1024;
const PUBLIC_DIR = join(process.cwd(), "public");

/**
 * The bytes of a media URL: a file under public/ ("/images/...") or an https
 * photo (Supabase Storage, week 4). Null when missing, too large, or a path
 * that would leave public/.
 */
export async function loadPhoto(url: string | null | undefined): Promise<Buffer | null> {
  if (!url) return null;

  if (url.startsWith("https://")) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(REMOTE_TIMEOUT_MS) });
      const length = Number(response.headers.get("content-length") ?? 0);
      if (!response.ok || length > MAX_REMOTE_BYTES) return null;
      const bytes = Buffer.from(await response.arrayBuffer());
      return bytes.byteLength > MAX_REMOTE_BYTES ? null : bytes;
    } catch {
      return null;
    }
  }

  if (!url.startsWith("/")) return null;
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
  const source = photo ? sharp(photo) : sharp(framedCardSvg());
  return source
    .resize({ ...SHARE_IMAGE_SIZE, fit: "cover", position: sharp.strategy.attention })
    .flatten({ background: classicPalette.parchment })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer();
}
