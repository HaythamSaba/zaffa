import { describe, expect, test } from "vitest";
import { rsvpsToCsv } from "./csv";
import type { RsvpRow } from "./types";

function row(overrides: Partial<RsvpRow> = {}): RsvpRow {
  return {
    id: "1",
    name: "The Haddad family",
    guestCount: 2,
    attending: true,
    notes: null,
    createdAt: "2027-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("rsvpsToCsv", () => {
  test("writes a header row and one row per RSVP", () => {
    const csv = rsvpsToCsv([row()]);
    const lines = csv.trim().split("\r\n");

    expect(lines[0]).toBe("Name,Guests,Attending,Notes,Replied at");
    expect(lines[1]).toBe("The Haddad family,2,Yes,,2027-01-01T00:00:00.000Z");
  });

  test("writes No for a declined reply and the note when present", () => {
    const csv = rsvpsToCsv([row({ attending: false, notes: "Allergic to nuts" })]);

    expect(csv).toContain("The Haddad family,2,No,Allergic to nuts,");
  });

  test("quotes a cell containing a comma", () => {
    const csv = rsvpsToCsv([row({ notes: "Vegetarian, no nuts" })]);

    expect(csv).toContain('"Vegetarian, no nuts"');
  });

  test("quotes and escapes a cell containing a double quote", () => {
    const csv = rsvpsToCsv([row({ name: 'The "Big" Family' })]);

    expect(csv).toContain('"The ""Big"" Family"');
  });

  test("quotes a cell containing a newline", () => {
    const csv = rsvpsToCsv([row({ notes: "Line one\nLine two" })]);

    expect(csv).toContain('"Line one\nLine two"');
  });

  for (const dangerous of ["=cmd()", "+1+1", "-1+1", "@SUM(1,1)", "\tcmd", "\rcmd"]) {
    test(`neutralizes a formula-injection prefix: ${JSON.stringify(dangerous)}`, () => {
      const csv = rsvpsToCsv([row({ notes: dangerous })]);
      const dataLine = csv.trim().split("\r\n")[1];

      expect(dataLine).toContain(`'${dangerous}`);
    });
  }

  test("never produces a cell a spreadsheet would read as a live formula", () => {
    const csv = rsvpsToCsv([row({ name: "=HYPERLINK(\"http://evil.example\")" })]);
    const dataLine = csv.trim().split("\r\n")[1];
    const firstCell = dataLine.startsWith('"') ? dataLine.slice(1) : dataLine;

    expect(firstCell.startsWith("=")).toBe(false);
  });

  test("leaves an ordinary name starting with a letter untouched", () => {
    const csv = rsvpsToCsv([row({ name: "Marco & Giulia" })]);

    expect(csv).toContain("Marco & Giulia,");
  });

  test("returns just the header for an empty list", () => {
    expect(rsvpsToCsv([]).trim()).toBe("Name,Guests,Attending,Notes,Replied at");
  });
});
