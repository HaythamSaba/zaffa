import { describe, expect, test } from "vitest";
import { isRsvpOpen, timeUntil } from "./rsvp-window";

const deadline = new Date("2027-05-01T21:59:59Z");

describe("isRsvpOpen", () => {
  test("open before the deadline", () => {
    expect(isRsvpOpen(deadline, new Date("2027-05-01T21:59:58Z"))).toBe(true);
  });

  test("closed at and after the deadline, like the database policy (now() < rsvp_deadline)", () => {
    expect(isRsvpOpen(deadline, deadline)).toBe(false);
    expect(isRsvpOpen(deadline, new Date("2027-05-02T08:00:00Z"))).toBe(false);
  });
});

describe("timeUntil", () => {
  test("splits the remaining time into days, hours, minutes and seconds", () => {
    const now = new Date("2027-06-10T13:24:55Z");
    const wedding = new Date("2027-06-12T16:00:00Z");
    expect(timeUntil(wedding, now)).toEqual({ days: 2, hours: 2, minutes: 35, seconds: 5 });
  });

  test("stops at zero once the moment has passed", () => {
    expect(timeUntil(new Date("2027-06-12T16:00:00Z"), new Date("2027-06-13T00:00:00Z"))).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });
});
