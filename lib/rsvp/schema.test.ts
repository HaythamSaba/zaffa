import { describe, expect, test } from "vitest";
import { parseRsvpForm } from "./schema";

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const minimal = { name: "The Haddad family", guestCount: "2", attending: "yes" };

describe("parseRsvpForm", () => {
  test("accepts the minimal required fields", () => {
    const result = parseRsvpForm(form(minimal));

    expect(result).toEqual({
      success: true,
      data: { name: "The Haddad family", guestCount: 2, attending: true, notes: undefined },
    });
  });

  test("trims the name and turns a blank notes field into undefined", () => {
    const result = parseRsvpForm(form({ ...minimal, name: "  The Haddad family  ", notes: "   " }));

    expect(result.success && result.data.name).toBe("The Haddad family");
    expect(result.success && result.data.notes).toBeUndefined();
  });

  test("keeps a provided notes field", () => {
    const result = parseRsvpForm(form({ ...minimal, notes: "One vegetarian" }));

    expect(result.success && result.data.notes).toBe("One vegetarian");
  });

  test("maps attending=no to false", () => {
    const result = parseRsvpForm(form({ ...minimal, attending: "no" }));

    expect(result.success && result.data.attending).toBe(false);
  });

  test("requires a name", () => {
    const result = parseRsvpForm(form({ ...minimal, name: "" }));

    expect(result.success).toBe(false);
    expect(!result.success && result.fieldErrors.name).toBeTruthy();
  });

  test("rejects a name over 120 characters", () => {
    const result = parseRsvpForm(form({ ...minimal, name: "a".repeat(121) }));

    expect(!result.success && result.fieldErrors.name).toBeTruthy();
  });

  test("rejects a blank (whitespace-only) name", () => {
    const result = parseRsvpForm(form({ ...minimal, name: "   " }));

    expect(!result.success && result.fieldErrors.name).toBeTruthy();
  });

  test("rejects a guest count of 0", () => {
    const result = parseRsvpForm(form({ ...minimal, guestCount: "0" }));

    expect(!result.success && result.fieldErrors.guestCount).toBeTruthy();
  });

  test("rejects a guest count over 20", () => {
    const result = parseRsvpForm(form({ ...minimal, guestCount: "21" }));

    expect(!result.success && result.fieldErrors.guestCount).toBeTruthy();
  });

  test("rejects a non-numeric guest count instead of crashing", () => {
    const result = parseRsvpForm(form({ ...minimal, guestCount: "many" }));

    expect(!result.success && result.fieldErrors.guestCount).toBeTruthy();
  });

  test("rejects an attending value that isn't yes or no", () => {
    const result = parseRsvpForm(form({ ...minimal, attending: "maybe" }));

    expect(!result.success && result.fieldErrors.attending).toBeTruthy();
  });

  test("rejects notes over 1000 characters", () => {
    const result = parseRsvpForm(form({ ...minimal, notes: "a".repeat(1001) }));

    expect(!result.success && result.fieldErrors.notes).toBeTruthy();
  });

  test("allows notes at exactly 1000 characters", () => {
    const result = parseRsvpForm(form({ ...minimal, notes: "a".repeat(1000) }));

    expect(result.success).toBe(true);
  });

  test("rejects a file upload in the name field instead of crashing", () => {
    const data = form(minimal);
    data.set("name", new Blob(["x"], { type: "text/plain" }));

    const result = parseRsvpForm(data);

    expect(!result.success && result.fieldErrors.name).toBeTruthy();
  });
});
