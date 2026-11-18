/** Shared invitation vocabulary (mirrors the CHECK constraints in the schema). */

export const PACKAGES = ["essential", "premium", "bespoke"] as const;
export type Package = (typeof PACKAGES)[number];

export const LANGUAGES = ["en", "ar", "en+ar"] as const;

/** Every invitation section, in the default order. Each is optional. */
export const SECTION_IDS = [
  "welcome",
  "countdown",
  "story",
  "venue",
  "schedule",
  "dress_code",
  "gallery",
  "rsvp",
  "contact",
] as const;
export type SectionId = (typeof SECTION_IDS)[number];
