/**
 * Date, time and number formatting for invitations.
 *
 * English uses en-GB dates ("Saturday, 12 June 2027") and a 12-hour en-US
 * clock ("6:00 PM"), as in the approved template. Arabic uses the event's
 * `theme_settings.arabicLocale`: ar-EG (default) gives يونيو and Arabic-Indic
 * digits, ar-SY gives Levantine month names (حزيران), and a -u-nu-latn
 * extension keeps Western digits.
 */

export type Lang = "en" | "ar";

export const DEFAULT_ARABIC_LOCALE = "ar-EG";

const ENGLISH_DATE_LOCALE = "en-GB";
const ENGLISH_TIME_LOCALE = "en-US";
const WALL_CLOCK = /^([01]\d|2[0-3]):([0-5]\d)$/;

export interface FormatContext {
  /** IANA time zone of the wedding, e.g. "Europe/Vienna". */
  timeZone: string;
  /** BCP 47 Arabic locale, e.g. "ar-EG", "ar-SY", "ar-u-nu-latn". */
  arabicLocale: string;
}

/** True for a valid BCP 47 tag whose language is Arabic and that Intl supports. */
export function isSupportedArabicLocale(tag: string): boolean {
  try {
    const [canonical] = Intl.getCanonicalLocales(tag);
    if (!canonical || canonical.split("-")[0] !== "ar") return false;
    return Intl.DateTimeFormat.supportedLocalesOf([canonical]).length > 0;
  } catch {
    return false;
  }
}

function dateLocale(lang: Lang, ctx: FormatContext): string {
  return lang === "ar" ? ctx.arabicLocale : ENGLISH_DATE_LOCALE;
}

function timeLocale(lang: Lang, ctx: FormatContext): string {
  return lang === "ar" ? ctx.arabicLocale : ENGLISH_TIME_LOCALE;
}

/** "Saturday, 12 June 2027" · "السبت، ١٢ يونيو ٢٠٢٧" */
export function formatLongDate(date: Date, lang: Lang, ctx: FormatContext): string {
  return new Intl.DateTimeFormat(dateLocale(lang, ctx), {
    timeZone: ctx.timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** "1 May 2027" · "١ مايو ٢٠٢٧" */
export function formatDate(date: Date, lang: Lang, ctx: FormatContext): string {
  return new Intl.DateTimeFormat(dateLocale(lang, ctx), {
    timeZone: ctx.timeZone,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** "12 · 06 · 2027" in the language's digits. */
export function formatNumericDate(date: Date, lang: Lang, ctx: FormatContext): string {
  const parts = new Intl.DateTimeFormat(dateLocale(lang, ctx), {
    timeZone: ctx.timeZone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((p) => p.type === type)?.value ?? "";
  return [part("day"), part("month"), part("year")].join(" · ");
}

/** "6:00 PM" · "٦:٠٠ م", in the event's time zone. */
export function formatTime(date: Date, lang: Lang, ctx: FormatContext): string {
  return new Intl.DateTimeFormat(timeLocale(lang, ctx), {
    timeZone: ctx.timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/**
 * A schedule time written as local wall-clock "HH:MM" (e.g. "18:30"), shown
 * as-is in the language's clock style. Never shifted by a time zone.
 */
export function formatWallClock(hhmm: string, lang: Lang, ctx: FormatContext): string {
  const match = WALL_CLOCK.exec(hhmm);
  if (!match) throw new RangeError(`Invalid wall-clock time "${hhmm}" (expected HH:MM)`);
  const instant = new Date(Date.UTC(2000, 0, 1, Number(match[1]), Number(match[2])));
  return formatTime(instant, lang, { ...ctx, timeZone: "UTC" });
}

/** A countdown number, at least two digits, never grouped: "05", "٠٥", "208". */
export function formatCount(value: number, lang: Lang, ctx: FormatContext): string {
  return new Intl.NumberFormat(dateLocale(lang, ctx), {
    minimumIntegerDigits: 2,
    useGrouping: false,
    maximumFractionDigits: 0,
  }).format(value);
}
