/**
 * Every photo slot on the landing page. Until a licensed file is added to
 * public/images/ (see public/images/README.md), leave `src` empty and the
 * Photo component shows a labelled placeholder. When adding a file, set
 * `src`, `width` and `height` (the file's real pixel size) and, if the photo
 * carries meaning beyond the text around it, a descriptive `alt`.
 */
export interface PhotoAsset {
  /** Path under /public, e.g. "/images/hero.jpg". Empty = placeholder. */
  src?: string;
  width?: number;
  height?: number;
  /** "" for decorative photos (the visible text already says what it shows). */
  alt: string;
  /** What the photo should show; printed on the placeholder. */
  label: string;
  /** Placeholder gradient: light (Sand → Stone) or deep (Taupe → Cocoa). */
  tone?: "light" | "deep";
}

export const photos = {
  hero: { alt: "", label: "Couple holding hands at golden hour", tone: "deep" },
  story: { alt: "", label: "Your story", tone: "light" },
  countdown: { alt: "", label: "Countdown", tone: "deep" },
  venue: { alt: "", label: "Venue & map", tone: "light" },
  gallery: { alt: "", label: "Gallery", tone: "deep" },
  languages: { alt: "", label: "Every language", tone: "light" },
  phoneCouple: { alt: "", label: "The couple", tone: "light" },
  faqTable: { alt: "", label: "Table setting with flowers", tone: "light" },
  closing: { alt: "", label: "Guests celebrating", tone: "deep" },
} satisfies Record<string, PhotoAsset>;
