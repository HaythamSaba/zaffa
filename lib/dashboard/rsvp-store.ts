import "server-only";
import { getAdminClient } from "@/lib/supabase/admin";
import type { RsvpEdit, RsvpRow } from "./types";

export interface DashboardEvent {
  readonly id: string;
  readonly passwordHash: string | null;
  readonly isDemo: boolean;
}

function readIsDemo(themeSettings: unknown): boolean {
  return (
    typeof themeSettings === "object" &&
    themeSettings !== null &&
    (themeSettings as Record<string, unknown>).demo === true
  );
}

/** Looked up for both login (checking the password) and an existing session (re-verifying it). */
export async function getDashboardEvent(slug: string): Promise<DashboardEvent | null> {
  const { data, error } = await getAdminClient()
    .from("events")
    .select("id, dashboard_password_hash, theme_settings")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`Supabase: ${error.message}`);
  if (!data) return null;

  return {
    id: data.id,
    passwordHash: data.dashboard_password_hash,
    isDemo: readIsDemo(data.theme_settings),
  };
}

function toRsvpRow(row: {
  id: string;
  name: string;
  guest_count: number;
  attending: boolean;
  notes: string | null;
  created_at: string;
}): RsvpRow {
  return {
    id: row.id,
    name: row.name,
    guestCount: row.guest_count,
    attending: row.attending,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export async function listRsvpsForEvent(eventId: string): Promise<RsvpRow[]> {
  const { data, error } = await getAdminClient()
    .from("rsvps")
    .select("id, name, guest_count, attending, notes, created_at")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Supabase: ${error.message}`);
  return (data ?? []).map(toRsvpRow);
}

/** Scoped by event_id too: one couple's dashboard can never touch another event's row. */
export async function updateRsvpRow(eventId: string, id: string, edit: RsvpEdit): Promise<boolean> {
  const patch = {
    ...(edit.name !== undefined && { name: edit.name }),
    ...(edit.guestCount !== undefined && { guest_count: edit.guestCount }),
    ...(edit.attending !== undefined && { attending: edit.attending }),
    ...(edit.notes !== undefined && { notes: edit.notes }),
  };

  const { data, error } = await getAdminClient()
    .from("rsvps")
    .update(patch)
    .eq("id", id)
    .eq("event_id", eventId)
    .select("id");
  if (error) throw new Error(`Supabase: ${error.message}`);
  return (data?.length ?? 0) > 0;
}

export async function deleteRsvpRow(eventId: string, id: string): Promise<boolean> {
  const { data, error } = await getAdminClient()
    .from("rsvps")
    .delete()
    .eq("id", id)
    .eq("event_id", eventId)
    .select("id");
  if (error) throw new Error(`Supabase: ${error.message}`);
  return (data?.length ?? 0) > 0;
}
