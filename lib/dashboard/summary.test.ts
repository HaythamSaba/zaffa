import { describe, expect, test } from "vitest";
import { summarizeRsvps } from "./summary";
import type { RsvpRow } from "./types";

function row(overrides: Partial<RsvpRow> = {}): RsvpRow {
  return {
    id: "1",
    name: "The Haddad family",
    guestCount: 2,
    attending: true,
    notes: null,
    createdAt: "2027-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("summarizeRsvps", () => {
  test("summarizes an empty list", () => {
    expect(summarizeRsvps([])).toEqual({
      householdsReplied: 0,
      totalAttending: 0,
      declined: 0,
      withNotes: 0,
    });
  });

  test("counts households, attending guests, declines and notes", () => {
    const rows = [
      row({ id: "1", attending: true, guestCount: 4, notes: "One vegetarian" }),
      row({ id: "2", attending: true, guestCount: 2 }),
      row({ id: "3", attending: false, guestCount: 1 }),
      row({ id: "4", attending: false, guestCount: 3, notes: "  " }), // blank notes don't count
    ];

    expect(summarizeRsvps(rows)).toEqual({
      householdsReplied: 4,
      totalAttending: 6,
      declined: 2,
      withNotes: 1,
    });
  });

  test("does not count a declining household's guestCount toward totalAttending", () => {
    const rows = [row({ attending: false, guestCount: 5 })];

    expect(summarizeRsvps(rows).totalAttending).toBe(0);
  });
});
