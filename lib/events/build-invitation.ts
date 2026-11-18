import { z } from "zod";
import type { Languages, LocalizedText } from "@/lib/i18n/bilingual";
import { themeSettingsSchema, type ThemeSettings } from "./theme-settings";
import { LANGUAGES, PACKAGES, type Package } from "./types";

/** The public event columns the loader selects (never the hashes or owner_id). */
export const EVENT_COLUMNS =
  "slug, template_id, languages, package, starts_at, timezone, venue, rsvp_deadline, contact_phone, theme_settings";
export const CONTENT_COLUMNS = "key, text_en, text_ar";
export const MEDIA_COLUMNS = "kind, url, position, alt_en, alt_ar";

const timestamp = z.iso.datetime({ offset: true }).transform((value) => new Date(value));

const eventRowSchema = z.object({
  slug: z.string(),
  template_id: z.string(),
  languages: z.enum(LANGUAGES),
  package: z.enum(PACKAGES),
  starts_at: timestamp,
  timezone: z.string(),
  venue: z.string(),
  rsvp_deadline: timestamp,
  contact_phone: z.string(),
  theme_settings: themeSettingsSchema,
});

const contentRowSchema = z.object({
  key: z.string(),
  text_en: z.string().nullable(),
  text_ar: z.string().nullable(),
});

const mediaRowSchema = z.object({
  kind: z.enum(["hero", "gallery"]),
  url: z.string(),
  position: z.number().int(),
  alt_en: z.string().nullable(),
  alt_ar: z.string().nullable(),
});

const rowsSchema = z.object({
  event: eventRowSchema,
  content: z.array(contentRowSchema),
  media: z.array(mediaRowSchema),
});

/** Rows as Supabase returns them, before validation. */
export interface EventRows {
  event: {
    slug: string;
    template_id: string;
    languages: string;
    package: string;
    starts_at: string;
    timezone: string;
    venue: string;
    rsvp_deadline: string;
    contact_phone: string;
    theme_settings: unknown;
  };
  content: { key: string; text_en: string | null; text_ar: string | null }[];
  media: { kind: string; url: string; position: number; alt_en: string | null; alt_ar: string | null }[];
}

export interface InvitationPhoto {
  readonly url: string;
  readonly alt: LocalizedText;
}

export interface ScheduleItem {
  readonly id: string;
  readonly time: string;
  readonly title: LocalizedText;
}

/** Everything a template needs to render one invitation. */
export interface InvitationData {
  readonly slug: string;
  readonly templateId: string;
  readonly languages: Languages;
  readonly package: Package;
  readonly startsAt: Date;
  readonly timeZone: string;
  readonly rsvpDeadline: Date;
  /** Plain street address, used for the map link. */
  readonly venueAddress: string;
  readonly contactPhone: string;
  readonly settings: ThemeSettings;
  /** Couple-written text by content key, e.g. texts.names, texts["venue.name"]. */
  readonly texts: Readonly<Record<string, LocalizedText>>;
  readonly schedule: readonly ScheduleItem[];
  readonly heroPhoto: InvitationPhoto | null;
  readonly gallery: readonly InvitationPhoto[];
}

export class InvitationDataError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "InvitationDataError";
  }
}

function localized(en: string | null, ar: string | null): LocalizedText {
  return { ...(en !== null ? { en } : {}), ...(ar !== null ? { ar } : {}) };
}

/** Validates the rows and shapes them for the template. Throws InvitationDataError. */
export function buildInvitation(rows: EventRows): InvitationData {
  const parsed = rowsSchema.safeParse(rows);
  if (!parsed.success) {
    const fields = parsed.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new InvitationDataError(`Invitation data is invalid: ${fields}`, { cause: parsed.error });
  }
  const { event, content, media } = parsed.data;

  const texts: Record<string, LocalizedText> = Object.fromEntries(
    content.map((row) => [row.key, localized(row.text_en, row.text_ar)]),
  );

  const schedule = event.theme_settings.schedule.flatMap((item) => {
    const title = texts[`schedule.${item.id}.title`];
    return title ? [{ id: item.id, time: item.time, title }] : [];
  });

  const photos = [...media].sort((a, b) => a.position - b.position);
  const toPhoto = (row: (typeof photos)[number]): InvitationPhoto => ({
    url: row.url,
    alt: localized(row.alt_en, row.alt_ar),
  });
  const hero = photos.find((row) => row.kind === "hero");

  return {
    slug: event.slug,
    templateId: event.template_id,
    languages: event.languages,
    package: event.package,
    startsAt: event.starts_at,
    timeZone: event.timezone,
    rsvpDeadline: event.rsvp_deadline,
    venueAddress: event.venue,
    contactPhone: event.contact_phone,
    settings: event.theme_settings,
    texts,
    schedule,
    heroPhoto: hero ? toPhoto(hero) : null,
    gallery: photos.filter((row) => row.kind === "gallery").map(toPhoto),
  };
}
