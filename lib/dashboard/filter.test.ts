import { describe, expect, test } from "vitest";
import { filterRsvps } from "./filter";
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

const rows: RsvpRow[] = [
  row({ id: "1", name: "The Haddad family", attending: true, notes: "One vegetarian" }),
  row({ id: "2", name: "Lena Novak", attending: true, notes: null }),
  row({ id: "3", name: "Marco & Giulia", attending: false, notes: null }),
  row({ id: "4", name: "Sara Haddad", attending: false, notes: "Arriving late" }),
];

describe("filterRsvps", () => {
  test("returns every row with no query", () => {
    expect(filterRsvps(rows, {})).toHaveLength(4);
  });

  test("searches by name, case-insensitively, as a substring", () => {
    const result = filterRsvps(rows, { search: "haddad" });

    expect(result.map((r) => r.id)).toEqual(["1", "4"]);
  });

  test("trims the search term", () => {
    expect(filterRsvps(rows, { search: "  lena  " }).map((r) => r.id)).toEqual(["2"]);
  });

  test("filters to attending only", () => {
    expect(filterRsvps(rows, { filter: "attending" }).map((r) => r.id)).toEqual(["1", "2"]);
  });

  test("filters to not attending only", () => {
    expect(filterRsvps(rows, { filter: "notAttending" }).map((r) => r.id)).toEqual(["3", "4"]);
  });

  test("filters to rows with a non-blank note", () => {
    expect(filterRsvps(rows, { filter: "hasNotes" }).map((r) => r.id)).toEqual(["1", "4"]);
  });

  test("combines a search term and a filter", () => {
    const result = filterRsvps(rows, { search: "haddad", filter: "notAttending" });

    expect(result.map((r) => r.id)).toEqual(["4"]);
  });

  test("a blank-only note does not count as having a note", () => {
    const blank = [row({ id: "5", notes: "   " })];

    expect(filterRsvps(blank, { filter: "hasNotes" })).toHaveLength(0);
  });
});
