import { describe, expect, test } from "vitest";
import {
  DEFAULT_ARABIC_LOCALE,
  formatCount,
  formatDate,
  formatLongDate,
  formatNumericDate,
  formatTime,
  formatWallClock,
  isSupportedArabicLocale,
  type FormatContext,
} from "./format";

// 12 June 2027, 18:00 in Vienna (CEST, UTC+2).
const wedding = new Date("2027-06-12T16:00:00Z");
// End of 1 May 2027 in Vienna.
const deadline = new Date("2027-05-01T21:59:59Z");

const egyptian: FormatContext = { timeZone: "Europe/Vienna", arabicLocale: "ar-EG" };
const levantine: FormatContext = { timeZone: "Europe/Vienna", arabicLocale: "ar-SY" };
const westernDigits: FormatContext = { timeZone: "Europe/Vienna", arabicLocale: "ar-u-nu-latn" };

describe("isSupportedArabicLocale", () => {
  test.each(["ar-EG", "ar-SY", "ar-LB", "ar-u-nu-latn", "ar-EG-u-nu-latn", "ar"])(
    "accepts %s",
    (tag) => {
      expect(isSupportedArabicLocale(tag)).toBe(true);
    },
  );

  test.each(["en-GB", "fr", "", "not a tag", "arabic"])("rejects %s", (tag) => {
    expect(isSupportedArabicLocale(tag)).toBe(false);
  });

  test("the default is Egyptian Arabic", () => {
    expect(DEFAULT_ARABIC_LOCALE).toBe("ar-EG");
    expect(isSupportedArabicLocale(DEFAULT_ARABIC_LOCALE)).toBe(true);
  });
});

describe("formatLongDate", () => {
  test("English uses British day-month order in the event's time zone", () => {
    expect(formatLongDate(wedding, "en", egyptian)).toBe("Saturday, 12 June 2027");
  });

  test("ar-EG uses Egyptian month names and Arabic-Indic digits", () => {
    expect(formatLongDate(wedding, "ar", egyptian)).toBe("السبت، ١٢ يونيو ٢٠٢٧");
  });

  test("ar-SY uses Levantine month names", () => {
    expect(formatLongDate(wedding, "ar", levantine)).toBe("السبت، ١٢ حزيران ٢٠٢٧");
  });

  test("ar-u-nu-latn keeps Arabic words with Western digits", () => {
    expect(formatLongDate(wedding, "ar", westernDigits)).toBe("السبت، 12 يونيو 2027");
  });

  test("uses the event's time zone, not the server's", () => {
    const lateNightInVienna = new Date("2027-06-12T22:30:00Z"); // 00:30 on 13 June in Vienna
    expect(formatLongDate(lateNightInVienna, "en", egyptian)).toBe("Sunday, 13 June 2027");
  });
});

describe("formatDate", () => {
  test("formats the RSVP deadline day in each language", () => {
    expect(formatDate(deadline, "en", egyptian)).toBe("1 May 2027");
    expect(formatDate(deadline, "ar", egyptian)).toBe("١ مايو ٢٠٢٧");
    expect(formatDate(deadline, "ar", levantine)).toBe("١ أيار ٢٠٢٧");
  });
});

describe("formatNumericDate", () => {
  test("joins day, month and year with middle dots", () => {
    expect(formatNumericDate(wedding, "en", egyptian)).toBe("12 · 06 · 2027");
  });

  test("uses the Arabic locale's digits", () => {
    expect(formatNumericDate(wedding, "ar", egyptian)).toBe("١٢ · ٠٦ · ٢٠٢٧");
    expect(formatNumericDate(wedding, "ar", westernDigits)).toBe("12 · 06 · 2027");
  });
});

describe("formatTime and formatWallClock", () => {
  test("English shows a 12-hour clock", () => {
    expect(formatTime(wedding, "en", egyptian)).toBe("6:00 PM");
    expect(formatWallClock("18:30", "en", egyptian)).toBe("6:30 PM");
    expect(formatWallClock("09:05", "en", egyptian)).toBe("9:05 AM");
  });

  test("Arabic follows the chosen locale's digits", () => {
    expect(formatTime(wedding, "ar", egyptian)).toBe("٦:٠٠ م");
    expect(formatWallClock("21:00", "ar", westernDigits)).toBe("9:00 م");
  });

  test("a schedule wall-clock time never shifts with the time zone", () => {
    const tokyo: FormatContext = { timeZone: "Asia/Tokyo", arabicLocale: "ar-EG" };
    expect(formatWallClock("18:00", "en", tokyo)).toBe("6:00 PM");
  });

  test("rejects a malformed wall-clock time", () => {
    expect(() => formatWallClock("25:00", "en", egyptian)).toThrow(RangeError);
    expect(() => formatWallClock("6pm", "en", egyptian)).toThrow(RangeError);
  });
});

describe("formatCount", () => {
  test("pads to two digits in the language's digits", () => {
    expect(formatCount(5, "en", egyptian)).toBe("05");
    expect(formatCount(5, "ar", egyptian)).toBe("٠٥");
    expect(formatCount(5, "ar", westernDigits)).toBe("05");
  });

  test("never groups large counts", () => {
    expect(formatCount(1208, "en", egyptian)).toBe("1208");
    expect(formatCount(208, "ar", levantine)).toBe("٢٠٨");
  });
});
