import type { Languages, LocalizedText } from "@/lib/i18n/bilingual";
import type { Lang } from "@/lib/i18n/format";

export interface Monogram {
  readonly lang: Lang;
  readonly text: string;
}

/** Splits "Layla & Adam" / "sara and omar" into the two first names. */
const NAME_SEPARATOR = /\s*(?:&|\band\b)\s*/i;

/**
 * The seal's monogram: English initials ("L&A") in the script font. Arabic
 * initials don't read as a monogram, so an Arabic-only invitation shows the
 * names themselves.
 */
export function monogramFor(names: LocalizedText | undefined, languages: Languages): Monogram | null {
  if (languages === "ar") {
    const arabic = names?.ar?.trim();
    return arabic ? { lang: "ar", text: arabic } : null;
  }

  const english = names?.en?.trim();
  if (!english) return null;
  const initials = english
    .split(NAME_SEPARATOR)
    .map((name) => name.trim().charAt(0).toUpperCase())
    .filter(Boolean);
  return { lang: "en", text: initials.join("&") };
}
