import { describe, expect, test } from "vitest";
import { parseRsvpEdit } from "./edit-schema";

describe("parseRsvpEdit", () => {
  test("accepts an empty edit (no fields changed)", () => {
    expect(parseRsvpEdit({})).toEqual({ success: true, data: {} });
  });

  test("accepts a valid partial edit and trims the name", () => {
    const result = parseRsvpEdit({ name: "  The Haddad family  ", guestCount: 4 });

    expect(result).toEqual({ success: true, data: { name: "The Haddad family", guestCount: 4 } });
  });

  test("accepts notes explicitly set to null (clearing them)", () => {
    expect(parseRsvpEdit({ notes: null })).toEqual({ success: true, data: { notes: null } });
  });

  test("rejects a guest count out of range", () => {
    expect(parseRsvpEdit({ guestCount: 0 }).success).toBe(false);
    expect(parseRsvpEdit({ guestCount: 21 }).success).toBe(false);
  });

  test("rejects a name over 120 characters", () => {
    expect(parseRsvpEdit({ name: "a".repeat(121) }).success).toBe(false);
  });

  test("rejects notes over 1000 characters", () => {
    expect(parseRsvpEdit({ notes: "a".repeat(1001) }).success).toBe(false);
  });

  test("rejects a non-boolean attending value", () => {
    expect(parseRsvpEdit({ attending: "yes" }).success).toBe(false);
  });

  test("rejects an unknown shape instead of crashing", () => {
    expect(parseRsvpEdit("not an object").success).toBe(false);
    expect(parseRsvpEdit(null).success).toBe(false);
  });
});
