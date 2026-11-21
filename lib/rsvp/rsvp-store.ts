import "server-only";
import { isRsvpOpen } from "@/lib/events/rsvp-window";
import { getAdminClient } from "@/lib/supabase/admin";
import type { RsvpSubmission } from "./schema";

export interface EventRsvpStatus {
  readonly id: string;
  readonly isOpen: boolean;
  /** The demo couple: the action pretends to save without writing anything. */
  readonly isDemo: boolean;
}

function readIsDemo(themeSettings: unknown): boolean {
  return (
    typeof themeSettings === "object" &&
    themeSettings !== null &&
    (themeSettings as Record<string, unknown>).demo === true
  );
}

/**
 * Fresh, server-side truth for one event: never trust a page's own props for
 * whether RSVPs are still open, since they may be stale by the time of submit.
 */
export async function lookupEventForRsvp(slug: string, now: Date): Promise<EventRsvpStatus | null> {
  const { data, error } = await getAdminClient()
    .from("events")
    .select("id, status, rsvp_deadline, theme_settings")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`Supabase: ${error.message}`);
  if (!data) return null;

  return {
    id: data.id,
    isOpen: data.status === "published" && isRsvpOpen(new Date(data.rsvp_deadline), now),
    isDemo: readIsDemo(data.theme_settings),
  };
}

/** Bypasses RLS (service role): the only writer now that the anon insert grant is revoked. */
export async function insertRsvp(eventId: string, submission: RsvpSubmission): Promise<void> {
  const { error } = await getAdminClient().from("rsvps").insert({
    event_id: eventId,
    name: submission.name,
    guest_count: submission.guestCount,
    attending: submission.attending,
    notes: submission.notes ?? null,
  });
  if (error) throw new Error(`Supabase: ${error.message}`);
}
