import type { RsvpRow, RsvpSummary } from "./types";

function hasNote(row: RsvpRow): boolean {
  return Boolean(row.notes?.trim());
}

/** "At a glance" (CLAUDE.md): no "pending" count, since there's no guest list to compare against. */
export function summarizeRsvps(rows: readonly RsvpRow[]): RsvpSummary {
  const attending = rows.filter((row) => row.attending);
  return {
    householdsReplied: rows.length,
    totalAttending: attending.reduce((sum, row) => sum + row.guestCount, 0),
    declined: rows.length - attending.length,
    withNotes: rows.filter(hasNote).length,
  };
}
