/** One row from `rsvps`, camelCased for the dashboard. */
export interface RsvpRow {
  readonly id: string;
  readonly name: string;
  readonly guestCount: number;
  readonly attending: boolean;
  readonly notes: string | null;
  /** ISO 8601. */
  readonly createdAt: string;
}

export type AttendingFilter = "all" | "attending" | "notAttending" | "hasNotes";

export interface RsvpQuery {
  readonly search?: string;
  readonly filter?: AttendingFilter;
}

export interface RsvpSummary {
  readonly householdsReplied: number;
  readonly totalAttending: number;
  readonly declined: number;
  readonly withNotes: number;
}

/** What the couple may edit; omitted fields are left as they are. */
export type RsvpEdit = Partial<{
  name: string;
  guestCount: number;
  attending: boolean;
  notes: string | null;
}>;
