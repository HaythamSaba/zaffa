import { getImageProps } from "next/image";
import type { PhotoAsset } from "@/lib/photos";

type Props = {
  photo: PhotoAsset;
  /** Rendered width hint for the srcset, e.g. "100vw" or "(min-width: 900px) 33vw, 100vw". */
  sizes?: string;
  /** Above-the-fold photo (the hero): load eagerly with high fetch priority. */
  priority?: boolean;
  /**
   * Espresso gradient for white text on top (docs/brand.md). `true` is the hero
   * gradient (.55 → .25 → .6); "strong" (.5 → .65) suits text in the middle of a band.
   */
  overlay?: boolean | "strong";
  /** Position, size and shape, e.g. "absolute inset-0" or "relative h-75 rounded-arch". */
  className?: string;
  /** Where the placeholder label sits; defaults to bottom centre. */
  labelClassName?: string;
};

const overlayGradient = {
  standard: "bg-linear-to-b from-espresso/55 via-espresso/25 to-espresso/60",
  strong: "bg-linear-to-b from-espresso/50 to-espresso/65",
} as const;

const placeholderTone = {
  light: "bg-linear-160 from-sand via-linen to-stone",
  deep: "bg-linear-160 from-mocha via-taupe to-cocoa",
} as const;

/**
 * A photo slot. Uses next/image's getImageProps in a server component, so it
 * gets an optimised srcset without shipping any client JavaScript. Without a
 * file it shows a labelled placeholder of the same size (no layout shift when
 * the real photo arrives).
 */
export function Photo({
  photo,
  sizes = "100vw",
  priority = false,
  overlay = false,
  className = "relative",
  labelClassName = "inset-x-0 bottom-4 justify-center",
}: Props) {
  const isDecorative = photo.alt === "";

  return (
    <div className={`overflow-hidden ${className}`}>
      {photo.src && photo.width && photo.height ? (
        <PhotoImage photo={photo} sizes={sizes} priority={priority} />
      ) : (
        <div
          data-photo-placeholder="true"
          role={isDecorative ? undefined : "img"}
          aria-label={isDecorative ? undefined : photo.alt}
          aria-hidden={isDecorative ? true : undefined}
          className={`absolute inset-0 ${placeholderTone[photo.tone ?? "light"]}`}
        >
          <span className={`absolute z-10 flex ${labelClassName}`}>
            <span className="bg-ivory/90 px-2 py-1 text-[0.6875rem] font-semibold tracking-[0.08em] text-cocoa">
              Photo · {photo.label}
            </span>
          </span>
        </div>
      )}
      {overlay && (
        <div
          aria-hidden="true"
          data-photo-overlay=""
          className={`absolute inset-0 ${overlayGradient[overlay === "strong" ? "strong" : "standard"]}`}
        />
      )}
    </div>
  );
}

function PhotoImage({
  photo,
  sizes,
  priority,
}: {
  photo: PhotoAsset;
  sizes: string;
  priority: boolean;
}) {
  const { props } = getImageProps({
    src: photo.src as string,
    width: photo.width,
    height: photo.height,
    alt: photo.alt,
    sizes,
    // Next 16 deprecates `priority`; eager + high fetch priority is the recommended form.
    loading: priority ? "eager" : "lazy",
    fetchPriority: priority ? "high" : "auto",
  });

  // eslint-disable-next-line @next/next/no-img-element -- getImageProps output (optimised srcset)
  return <img {...props} alt={photo.alt} className="absolute inset-0 size-full object-cover" />;
}
