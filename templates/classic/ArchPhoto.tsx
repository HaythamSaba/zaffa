import Image from "next/image";
import type { InvitationPhoto } from "@/lib/events/build-invitation";
import type { Languages } from "@/lib/i18n/bilingual";

type Props = {
  photo: InvitationPhoto | null;
  languages: Languages;
  sizes: string;
  /** Position and size, e.g. "h-76 w-58". The arch shape is added here. */
  className: string;
  /** Shown on the placeholder when there's no photo. */
  placeholderLabel: string;
  priority?: boolean;
};

/**
 * A photo cut into an arch. Uses next/image `fill`, so the box has a fixed
 * size and the photo can't shift the layout. The alt text is in the page's
 * main language (Arabic only for Arabic-only invitations).
 */
export function ArchPhoto({ photo, languages, sizes, className, placeholderLabel, priority = false }: Props) {
  const alt = (languages === "ar" ? photo?.alt.ar : photo?.alt.en) ?? photo?.alt.en ?? photo?.alt.ar ?? "";

  return (
    <div className={`relative overflow-hidden rounded-classic-arch ${className}`}>
      {photo ? (
        <Image
          src={photo.url}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={photo.url.startsWith("https://")}
          className="object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex size-full items-end justify-center bg-linear-170 from-classic-cream to-classic-champagne p-4"
        >
          <span className="text-xs tracking-[0.06em] text-classic-ink">{placeholderLabel}</span>
        </div>
      )}
    </div>
  );
}
