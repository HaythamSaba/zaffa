import type { InvitationData } from "./build-invitation";
import { SECTION_IDS, type Package, type SectionId } from "./types";

/** Package gating (spec): Essential excludes these sections. */
const PREMIUM_SECTIONS: ReadonlySet<SectionId> = new Set(["schedule", "dress_code", "gallery"]);

const hasText = (invitation: InvitationData, key: string): boolean => {
  const text = invitation.texts[key];
  return Boolean(text?.en?.trim() || text?.ar?.trim());
};

/** A section shows only when it has something to show; never empty. */
const HAS_CONTENT: Readonly<Record<SectionId, (invitation: InvitationData) => boolean>> = {
  welcome: () => true,
  countdown: () => true,
  story: (invitation) => hasText(invitation, "story"),
  venue: (invitation) => hasText(invitation, "venue.name"),
  schedule: (invitation) => invitation.schedule.length > 0,
  dress_code: (invitation) => hasText(invitation, "dress_code"),
  gallery: (invitation) => invitation.gallery.length > 0,
  rsvp: () => true,
  contact: () => true,
};

export function isSectionAllowed(pkg: Package, section: SectionId): boolean {
  return pkg !== "essential" || !PREMIUM_SECTIONS.has(section);
}

/**
 * The sections to render, in order: the couple's custom order (or the default),
 * minus sections their package excludes or that have no content. The welcome
 * (with the names and the page's h1) always comes first.
 */
export function invitationSections(invitation: InvitationData): SectionId[] {
  const order = invitation.settings.sections ?? SECTION_IDS;
  const unique = [...new Set<SectionId>(["welcome", ...order])];
  return unique.filter(
    (section) => isSectionAllowed(invitation.package, section) && HAS_CONTENT[section](invitation),
  );
}

/** The opening screen (with its animation) is a Premium feature. */
export function showsOpeningScreen(pkg: Package): boolean {
  return pkg !== "essential";
}
