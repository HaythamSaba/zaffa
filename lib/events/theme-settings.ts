import { z } from "zod";
import { DEFAULT_ARABIC_LOCALE, isSupportedArabicLocale } from "@/lib/i18n/format";
import { SECTION_IDS } from "./types";

const MAX_SCHEDULE_ITEMS = 20;

const scheduleItemSchema = z.object({
  /** Matches content key schedule.<id>.title. */
  id: z.string().regex(/^[a-z0-9_]{1,40}$/, "schedule ids are lowercase letters, digits and _"),
  /** Local wall-clock time at the venue, 24-hour. */
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "schedule times are HH:MM (24-hour)"),
});

/** events.theme_settings. Unknown keys are dropped. */
export const themeSettingsSchema = z.object({
  /** The demo couple: the RSVP form shows the received screen without saving. */
  demo: z.boolean().default(false),
  /** Arabic month names and digits: ar-EG (default), ar-SY (حزيران), ar-u-nu-latn (Western digits). */
  arabicLocale: z
    .string()
    .refine(isSupportedArabicLocale, "arabicLocale must be an Arabic locale such as ar-EG or ar-SY")
    .default(DEFAULT_ARABIC_LOCALE),
  /** Custom section order; sections left out are hidden. Welcome always comes first. */
  sections: z.array(z.enum(SECTION_IDS)).max(SECTION_IDS.length * 2).optional(),
  schedule: z.array(scheduleItemSchema).max(MAX_SCHEDULE_ITEMS).default([]),
  /** Overrides the map link built from the venue address. */
  mapUrl: z.url({ protocol: /^https$/, hostname: z.regexes.domain }).optional(),
});

export type ThemeSettings = z.infer<typeof themeSettingsSchema>;
export type ScheduleSetting = z.infer<typeof scheduleItemSchema>;

/** Validates theme_settings; throws a ZodError naming the bad field. */
export function parseThemeSettings(raw: unknown): ThemeSettings {
  return themeSettingsSchema.parse(raw);
}
