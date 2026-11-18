import Image from "next/image";
import type { InvitationPhoto } from "@/lib/events/build-invitation";
import type { Languages } from "@/lib/i18n/bilingual";

type Props = {
  photo: InvitationPhoto | null;
  languages: Languages;
  sizes: string;
  /** Position and size, e.g. "h-76 w-58". The arch shape is added here. */
  className: string;
  priority?: boolean;
};

/**
 * A photo cut into an arch. Uses next/image `fill`, so the box has a fixed
 * size and the photo can't shift the layout. The alt text is in the page's
 * main language (Arabic only for Arabic-only invitations). Without a photo it
 * shows a plain decorative arch: never placeholder text on a real invitation.
 */
export function ArchPhoto({ photo, languages, sizes, className, priority = false }: Props) {
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
        <div aria-hidden="true" className="size-full bg-linear-170 from-classic-cream to-classic-champagne" />
      )}
    </div>
  );
}
