import { describe, expect, test } from "vitest";
import ar from "@/locales/ar.json";
import en from "@/locales/en.json";
import { message } from "./messages";

const ARABIC_SCRIPT = /[؀-ۿ]/;

describe("locale files", () => {
  test("English and Arabic have exactly the same keys", () => {
    expect(Object.keys(ar).sort()).toEqual(Object.keys(en).sort());
  });

  test("every Arabic string is written in Arabic script", () => {
    const notArabic = Object.entries(ar).filter(([, value]) => !ARABIC_SCRIPT.test(value));
    expect(notArabic).toEqual([]);
  });

  test("both languages use the same placeholders in each string", () => {
    const placeholders = (value: string) => [...value.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    const mismatched = Object.keys(en).filter(
      (key) =>
        placeholders(en[key as keyof typeof en]).join() !==
        placeholders(ar[key as keyof typeof ar]).join(),
    );
    expect(mismatched).toEqual([]);
  });
});

describe("message", () => {
  test("returns the text in both languages", () => {
    expect(message("story.title")).toEqual({ en: "Our story", ar: "قصتنا" });
  });

  test("fills placeholders with each language's own value", () => {
    expect(message("closed.call", { name: { en: "Layla", ar: "ليلى" } })).toEqual({
      en: "Call Layla",
      ar: "اتصلوا بـليلى",
    });
  });

  test("a missing translation of a value leaves that language out", () => {
    expect(message("closed.call", { name: { en: "Layla" } })).toEqual({ en: "Call Layla" });
  });

  test("throws when a placeholder has no value at all", () => {
    expect(() => message("closed.call")).toThrow(/name/);
  });
});
