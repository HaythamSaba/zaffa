import { describe, expect, test } from "vitest";
import { languagesShown, pickLanguages } from "./bilingual";

describe("languagesShown", () => {
  test("maps the event's languages to the stacked order, English first", () => {
    expect(languagesShown("en")).toEqual(["en"]);
    expect(languagesShown("ar")).toEqual(["ar"]);
    expect(languagesShown("en+ar")).toEqual(["en", "ar"]);
  });
});

describe("pickLanguages", () => {
  const text = { en: "Our story", ar: "قصتنا" };

  test("returns English then Arabic for en+ar", () => {
    expect(pickLanguages(text, "en+ar")).toEqual([
      { lang: "en", value: "Our story" },
      { lang: "ar", value: "قصتنا" },
    ]);
  });

  test("returns only the languages the event shows", () => {
    expect(pickLanguages(text, "en")).toEqual([{ lang: "en", value: "Our story" }]);
    expect(pickLanguages(text, "ar")).toEqual([{ lang: "ar", value: "قصتنا" }]);
  });

  test("skips blank or missing translations", () => {
    expect(pickLanguages({ en: "Dinner", ar: "  " }, "en+ar")).toEqual([
      { lang: "en", value: "Dinner" },
    ]);
    expect(pickLanguages({ ar: "العشاء" }, "en+ar")).toEqual([{ lang: "ar", value: "العشاء" }]);
    expect(pickLanguages(undefined, "en+ar")).toEqual([]);
  });

  test("trims surrounding whitespace", () => {
    expect(pickLanguages({ en: "  Dinner \n" }, "en")).toEqual([{ lang: "en", value: "Dinner" }]);
  });
});
