import type { AttendingFilter, RsvpQuery, RsvpRow } from "./types";

function hasNote(row: RsvpRow): boolean {
  return Boolean(row.notes?.trim());
}

const PREDICATES: Readonly<Record<AttendingFilter, (row: RsvpRow) => boolean>> = {
  all: () => true,
  attending: (row) => row.attending,
  notAttending: (row) => !row.attending,
  hasNotes: hasNote,
};

/** Search by name (substring, case-insensitive) and the dashboard's filter chips. */
export function filterRsvps(rows: readonly RsvpRow[], query: RsvpQuery): RsvpRow[] {
  const search = query.search?.trim().toLowerCase() ?? "";
  const matchesFilter = PREDICATES[query.filter ?? "all"];

  return rows.filter(
    (row) => matchesFilter(row) && (search === "" || row.name.toLowerCase().includes(search)),
  );
}
