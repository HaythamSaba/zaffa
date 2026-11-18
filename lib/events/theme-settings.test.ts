import { describe, expect, test } from "vitest";
import { parseThemeSettings } from "./theme-settings";

describe("parseThemeSettings", () => {
  test("an empty object gets the defaults", () => {
    expect(parseThemeSettings({})).toEqual({
      demo: false,
      arabicLocale: "ar-EG",
      schedule: [],
    });
  });

  test("reads the demo's settings", () => {
    const settings = parseThemeSettings({
      demo: true,
      arabicLocale: "ar-EG",
      schedule: [
        { id: "welcome_drinks", time: "18:00" },
        { id: "zaffa", time: "18:30" },
      ],
    });

    expect(settings.demo).toBe(true);
    expect(settings.schedule).toEqual([
      { id: "welcome_drinks", time: "18:00" },
      { id: "zaffa", time: "18:30" },
    ]);
  });

  test.each(["ar-SY", "ar-LB", "ar-u-nu-latn", "ar-EG-u-nu-latn"])(
    "accepts the Arabic locale %s",
    (arabicLocale) => {
      expect(parseThemeSettings({ arabicLocale }).arabicLocale).toBe(arabicLocale);
    },
  );

  test.each(["en-GB", "fr-FR", "not a tag", ""])("rejects the Arabic locale %j", (arabicLocale) => {
    expect(() => parseThemeSettings({ arabicLocale })).toThrow();
  });

  test("accepts a custom section order of known sections", () => {
    expect(parseThemeSettings({ sections: ["welcome", "story", "rsvp"] }).sections).toEqual([
      "welcome",
      "story",
      "rsvp",
    ]);
    expect(() => parseThemeSettings({ sections: ["welcome", "seating"] })).toThrow();
  });

  test("schedule times are 24-hour HH:MM and ids are simple keys", () => {
    expect(() => parseThemeSettings({ schedule: [{ id: "dinner", time: "7:30 PM" }] })).toThrow();
    expect(() => parseThemeSettings({ schedule: [{ id: "dinner", time: "24:00" }] })).toThrow();
    expect(() => parseThemeSettings({ schedule: [{ id: "Dinner Time", time: "19:30" }] })).toThrow();
  });

  test("the map link must be https", () => {
    expect(
      parseThemeSettings({ mapUrl: "https://maps.google.com/?q=Villa+Rosa" }).mapUrl,
    ).toBe("https://maps.google.com/?q=Villa+Rosa");
    expect(() => parseThemeSettings({ mapUrl: "javascript:alert(1)" })).toThrow();
    expect(() => parseThemeSettings({ mapUrl: "http://maps.example.com" })).toThrow();
  });

  test("ignores unknown keys", () => {
    expect(parseThemeSettings({ colour: "pink" })).not.toHaveProperty("colour");
  });

  test("rejects anything that isn't an object", () => {
    expect(() => parseThemeSettings(null)).toThrow();
    expect(() => parseThemeSettings([])).toThrow();
  });
});
