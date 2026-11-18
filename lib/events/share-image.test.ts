import sharp from "sharp";
import { describe, expect, test } from "vitest";
import { SHARE_IMAGE_SIZE, loadPhoto, renderShareImage } from "./share-image";

/** WhatsApp skips link-preview images above roughly 300 KB. */
const WHATSAPP_MAX_BYTES = 300 * 1024;

describe("renderShareImage", () => {
  test("crops the couple photo to a 1200x630 JPEG small enough for WhatsApp", async () => {
    const photo = await loadPhoto("/images/countdown.png");
    expect(photo).not.toBeNull();

    const jpeg = await renderShareImage(photo);
    const meta = await sharp(jpeg).metadata();

    expect(meta.format).toBe("jpeg");
    expect(meta.width).toBe(SHARE_IMAGE_SIZE.width);
    expect(meta.height).toBe(SHARE_IMAGE_SIZE.height);
    expect(jpeg.byteLength).toBeLessThan(WHATSAPP_MAX_BYTES);
  });

  test("without a photo, makes a plain framed card of the same size", async () => {
    const jpeg = await renderShareImage(null);
    const meta = await sharp(jpeg).metadata();
    expect([meta.format, meta.width, meta.height]).toEqual(["jpeg", 1200, 630]);
  });
});

describe("loadPhoto", () => {
  test("reads a photo from public/", async () => {
    const photo = await loadPhoto("/images/story.png");
    expect(photo?.byteLength).toBeGreaterThan(1000);
  });

  test("never fetches remote URLs (no SSRF) until Storage uploads exist", async () => {
    expect(await loadPhoto("https://169.254.169.254/latest/meta-data")).toBeNull();
    expect(await loadPhoto("https://example.com/photo.jpg")).toBeNull();
  });

  test.each(["/../package.json", "/images/../../.env.local", "/images/missing.png", "relative.png", "//evil.example.com/x.png", ""])(
    "returns null for %j (outside public/, missing or not a path)",
    async (url) => {
      expect(await loadPhoto(url)).toBeNull();
    },
  );
});
