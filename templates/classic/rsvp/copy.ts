import type { LocalizedText } from "@/lib/i18n/bilingual";

/** Every string the RSVP form and its received screen show, already localized. */
export interface RsvpCopy {
  readonly name: LocalizedText;
  readonly namePlaceholder: string;
  readonly attending: LocalizedText;
  readonly accept: LocalizedText;
  readonly decline: LocalizedText;
  readonly guests: LocalizedText;
  /** "Notes (optional)" in each language. */
  readonly notes: LocalizedText;
  readonly notesPlaceholder: string;
  readonly send: LocalizedText;
  readonly privacy: LocalizedText;
  /** Under the button: "sample invitation" (demo) or "replies open soon". */
  readonly note: LocalizedText;
  readonly received: {
    readonly title: LocalizedText;
    readonly accepted: LocalizedText;
    readonly declined: LocalizedText;
    /** "Your reply" in the shown languages, joined with " · ". */
    readonly yourReply: string;
    readonly calendar: LocalizedText;
    readonly back: LocalizedText;
    readonly change: LocalizedText;
  };
}

/** "Add to calendar" download. */
export interface CalendarLink {
  readonly href: string;
  readonly fileName: string;
}
