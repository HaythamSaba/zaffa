/**
 * Every photo slot on the landing page, mapped to a licensed file in
 * public/images/ (sources in public/images/README.md). A slot without `src`
 * shows a labelled placeholder. `width`/`height` are the file's real pixel size.
 *
 * Each slot uses the file with its own name, so to change a picture, replace
 * that file and update its `width`, `height`, `alt` and `focus` here.
 */
export interface PhotoAsset {
  /** Path under /public, e.g. "/images/hero.png". Empty = placeholder. */
  src?: string;
  width?: number;
  height?: number;
  /** Describes the photo; "" only for purely decorative photos. */
  alt: string;
  /** What the photo should show; printed on the placeholder. */
  label: string;
  /** Placeholder gradient: light (Sand → Stone) or deep (Taupe → Cocoa). */
  tone?: "light" | "deep";
  /** CSS object-position: keeps the subject in frame in arches and on phones. */
  focus?: string;
}

export const photos = {
  hero: {
    src: "/images/hero.png",
    width: 1173,
    height: 780,
    alt: "A garden ceremony by a lake: rows of white chairs along a straw aisle leading to a floral arch",
    label: "Garden ceremony by the lake",
    tone: "deep",
    // The aisle and arch sit in the centre; on phones this keeps them in view.
    focus: "50% 60%",
  },
  story: {
    src: "/images/story.png",
    width: 687,
    height: 1031,
    alt: "A bouquet of cream and pink roses with red berries, held above a hand wearing a wedding ring",
    label: "Your story",
    tone: "light",
    focus: "50% 22%",
  },
  countdown: {
    src: "/images/countdown.png",
    width: 687,
    height: 1031,
    alt: "A bride and groom kissing behind a white balloon in warm evening light",
    label: "Countdown",
    tone: "deep",
    focus: "50% 30%",
  },
  venue: {
    src: "/images/venue.png",
    width: 687,
    height: 1031,
    alt: "A white domed gazebo with flowers at the end of a rose-petal aisle",
    label: "Venue & map",
    tone: "light",
    // Keep the dome at the top of the arch.
    focus: "50% 0%",
  },
  gallery: {
    src: "/images/gallery.png",
    width: 1170,
    height: 780,
    alt: "Two gold wedding rings resting on soft white fabric",
    label: "Gallery",
    tone: "deep",
    focus: "60% 62%",
  },
  languages: {
    // Placeholder subject: the requested invitation-card photo is not in public/images yet.
    src: "/images/languages.png",
    width: 1170,
    height: 780,
    alt: "Two gold wedding rings resting on the page of a dictionary",
    label: "Every language",
    tone: "light",
    focus: "62% 28%",
  },
  phoneCouple: {
    src: "/images/phone-couple.png",
    width: 1170,
    height: 780,
    alt: "A couple's hands with wedding rings resting on a bouquet of peach roses",
    label: "The couple",
    tone: "light",
    focus: "38% 50%",
  },
  faqTable: {
    src: "/images/faq-table.png",
    width: 687,
    height: 1031,
    alt: "A wedding table set with pink roses, tall white candles and glassware",
    label: "Table setting with flowers",
    tone: "light",
    focus: "50% 40%",
  },
  closing: {
    src: "/images/closing.jpg",
    width: 854,
    height: 514,
    alt: "Guests seated outdoors watching a couple marry under a floral arch by a lake",
    label: "Lakeside ceremony",
    tone: "deep",
    focus: "52% 50%",
  },
} satisfies Record<string, PhotoAsset>;
