import type { Lang } from "./format";

/** The languages an invitation shows: English, Arabic, or both stacked. */
export type Languages = "en" | "ar" | "en+ar";

/** One piece of couple-written text in each language it has. */
export interface LocalizedText {
  readonly en?: string;
  readonly ar?: string;
}

export interface LanguageValue {
  readonly lang: Lang;
  readonly value: string;
}

const STACK_ORDER: Readonly<Record<Languages, readonly Lang[]>> = {
  en: ["en"],
  ar: ["ar"],
  "en+ar": ["en", "ar"],
};

/** The stacked order for an event: English first, Arabic directly beneath. */
export function languagesShown(languages: Languages): readonly Lang[] {
  return STACK_ORDER[languages];
}

/**
 * The non-blank translations of `text` that the event shows, in stacked order.
 * A missing translation is skipped rather than rendered empty.
 */
export function pickLanguages(
  text: LocalizedText | undefined,
  languages: Languages,
): LanguageValue[] {
  if (!text) return [];
  return languagesShown(languages).flatMap((lang) => {
    const value = text[lang]?.trim();
    return value ? [{ lang, value }] : [];
  });
}
