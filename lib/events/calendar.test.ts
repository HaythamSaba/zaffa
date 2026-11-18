import { describe, expect, test } from "vitest";
import { buildIcs, icsDataUrl } from "./calendar";

const event = {
  uid: "layla-and-adam@zaffa",
  title: "Layla & Adam's wedding",
  start: new Date("2027-06-12T16:00:00Z"),
  location: "Villa Rosa, Rosengasse 12, 1010 Vienna",
  stamp: new Date("2026-11-18T10:00:00Z"),
};

describe("buildIcs", () => {
  test("produces a one-event iCalendar file in UTC with CRLF line endings", () => {
    const ics = buildIcs(event);

    expect(ics.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n")).toBe(true);
    expect(ics).toContain("\r\nDTSTART:20270612T160000Z\r\n");
    expect(ics).toContain("\r\nDTEND:20270612T220000Z\r\n");
    expect(ics).toContain("\r\nDTSTAMP:20261118T100000Z\r\n");
    expect(ics).toContain("\r\nUID:layla-and-adam@zaffa\r\n");
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });

  test("escapes commas, semicolons and newlines in text", () => {
    const ics = buildIcs({ ...event, title: "A; B, C\nD" });
    expect(ics).toContain("\r\nSUMMARY:A\\; B\\, C\\nD\r\n");
    expect(ics).toContain("\r\nLOCATION:Villa Rosa\\, Rosengasse 12\\, 1010 Vienna\r\n");
  });

  test("keeps Arabic text as UTF-8", () => {
    expect(buildIcs({ ...event, title: "زفاف ليلى وآدم" })).toContain("SUMMARY:زفاف ليلى وآدم");
  });
});

describe("icsDataUrl", () => {
  test("encodes the file as a text/calendar data URL", () => {
    const url = icsDataUrl("BEGIN:VCALENDAR\r\nEND:VCALENDAR\r\n");
    expect(url).toBe("data:text/calendar;charset=utf-8,BEGIN%3AVCALENDAR%0D%0AEND%3AVCALENDAR%0D%0A");
  });
});
