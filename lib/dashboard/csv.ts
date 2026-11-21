import type { RsvpRow } from "./types";

const HEADER = ["Name", "Guests", "Attending", "Notes", "Replied at"];

/**
 * A cell starting with = + - @ or a tab/CR is a live formula to Excel,
 * Google Sheets and LibreOffice once the CSV is opened. A guest's own notes
 * or name field is attacker-controlled text, so every cell gets this check
 * (never just the ones that "look like" they need it) before anything else.
 */
const FORMULA_PREFIX = /^[=+\-@\t\r]/;

function neutralizeFormula(value: string): string {
  return FORMULA_PREFIX.test(value) ? `'${value}` : value;
}

function escapeCell(value: string): string {
  const safe = neutralizeFormula(value);
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

function rowToCells(row: RsvpRow): string[] {
  return [row.name, String(row.guestCount), row.attending ? "Yes" : "No", row.notes ?? "", row.createdAt];
}

/** CSV for the caterer: Excel-safe (CRLF rows, formula-injection neutralized). */
export function rsvpsToCsv(rows: readonly RsvpRow[]): string {
  const lines = [HEADER, ...rows.map(rowToCells)];
  return lines.map((cells) => cells.map(escapeCell).join(",")).join("\r\n") + "\r\n";
}
