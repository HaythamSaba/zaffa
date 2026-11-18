/** A minimal iCalendar (RFC 5545) file for "Add to calendar". */

const DEFAULT_DURATION_HOURS = 6;
const HOUR_MS = 60 * 60 * 1000;

export interface CalendarEvent {
  readonly uid: string;
  readonly title: string;
  readonly start: Date;
  readonly location: string;
  readonly durationHours?: number;
  /** When the file was made; defaults to now. */
  readonly stamp?: Date;
}

function utc(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

export function buildIcs(event: CalendarEvent): string {
  const end = new Date(event.start.getTime() + (event.durationHours ?? DEFAULT_DURATION_HOURS) * HOUR_MS);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Zaffa//Invitation//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${escapeText(event.uid)}`,
    `DTSTAMP:${utc(event.stamp ?? new Date())}`,
    `DTSTART:${utc(event.start)}`,
    `DTEND:${utc(end)}`,
    `SUMMARY:${escapeText(event.title)}`,
    `LOCATION:${escapeText(event.location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return `${lines.join("\r\n")}\r\n`;
}

export function icsDataUrl(ics: string): string {
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}
