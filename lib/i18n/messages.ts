import ar from "@/locales/ar.json";
import en from "@/locales/en.json";
import type { LocalizedText } from "./bilingual";
import type { Lang } from "./format";

/** Fixed interface text of the invitations (locales/*.json). */
export type MessageKey = keyof typeof en;

const CATALOGUE: Readonly<Record<Lang, Readonly<Record<MessageKey, string>>>> = { en, ar };
const PLACEHOLDER = /\{(\w+)\}/g;

/**
 * A fixed interface string in both languages, with {placeholders} filled from
 * each language's own value (e.g. names: { en: "Layla & Adam", ar: "ليلى وآدم" }).
 * A language whose value is missing is left out, like missing couple text.
 */
export function message(
  key: MessageKey,
  values: Readonly<Record<string, LocalizedText>> = {},
): LocalizedText {
  const result: { en?: string; ar?: string } = {};

  for (const lang of ["en", "ar"] as const) {
    const template = CATALOGUE[lang][key];
    let complete = true;
    const filled = template.replace(PLACEHOLDER, (_match, name: string) => {
      const value = values[name];
      if (!value) throw new Error(`Message "${key}" needs a value for {${name}}`);
      const text = value[lang];
      if (text === undefined) complete = false;
      return text ?? "";
    });
    if (complete) result[lang] = filled;
  }

  return result;
}
