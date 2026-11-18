import type { InvitationData } from "./build-invitation";

const MAPS_SEARCH = "https://www.google.com/maps/search/?api=1&query=";

/** "Get directions": the couple's own https map link, or a search for the venue address. */
export function mapLinkFor(invitation: InvitationData): string | null {
  if (invitation.settings.mapUrl) return invitation.settings.mapUrl;
  const address = invitation.venueAddress.trim();
  return address ? `${MAPS_SEARCH}${encodeURIComponent(address)}` : null;
}
