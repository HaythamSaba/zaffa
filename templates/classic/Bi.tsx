import { pickLanguages, type Languages, type LocalizedText } from "@/lib/i18n/bilingual";

type Tag = "p" | "span" | "h1" | "h2" | "h3" | "div";

type Props = {
  text: LocalizedText | undefined;
  languages: Languages;
  /** Element for the first language shown (e.g. "h2" for a heading). */
  as?: Tag;
  /** Element for the language stacked beneath it. Defaults to `as`. */
  restAs?: Tag;
  /** Classes for both languages (colour, margins). */
  className?: string;
  /** Latin-only classes: size, caps, tracking, italic. */
  en?: string;
  /** Arabic-only classes: size, line height. Never caps or tracking. */
  ar?: string;
  /** Amiri (headings, names) instead of Noto Naskh Arabic (reading text). */
  arDisplay?: boolean;
};

/**
 * One piece of text in every language the invitation shows, stacked: English,
 * then Arabic directly beneath. Arabic always gets dir="rtl" lang="ar" and an
 * Arabic font. Missing translations are skipped, never rendered empty.
 */
export function Bi({
  text,
  languages,
  as = "p",
  restAs,
  className = "",
  en = "",
  ar = "",
  arDisplay = false,
}: Props) {
  const parts = pickLanguages(text, languages);
  if (parts.length === 0) return null;

  return (
    <>
      {parts.map(({ lang, value }, index) => {
        const Element = index === 0 ? as : (restAs ?? as);
        if (lang === "ar") {
          const font = arDisplay ? "font-amiri" : "font-naskh";
          return (
            <Element key={lang} dir="rtl" lang="ar" className={`${font} ${className} ${ar}`}>
              {value}
            </Element>
          );
        }
        return (
          <Element key={lang} className={`${className} ${en}`}>
            {value}
          </Element>
        );
      })}
    </>
  );
}
