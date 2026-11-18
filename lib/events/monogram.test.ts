import { describe, expect, test } from "vitest";
import { monogramFor } from "./monogram";

describe("monogramFor", () => {
  test("joins the English initials with an ampersand", () => {
    expect(monogramFor({ en: "Layla & Adam", ar: "ليلى وآدم" }, "en+ar")).toEqual({
      lang: "en",
      text: "L&A",
    });
    expect(monogramFor({ en: "sara and omar" }, "en")).toEqual({ lang: "en", text: "S&O" });
  });

  test("an Arabic-only invitation uses the Arabic names", () => {
    expect(monogramFor({ ar: "ليلى وآدم" }, "ar")).toEqual({ lang: "ar", text: "ليلى وآدم" });
  });

  test("falls back to the whole name when it can't be split", () => {
    expect(monogramFor({ en: "Layla" }, "en")).toEqual({ lang: "en", text: "L" });
  });

  test("no names means no monogram", () => {
    expect(monogramFor(undefined, "en+ar")).toBeNull();
  });
});
