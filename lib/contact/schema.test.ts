import { describe, expect, test } from "vitest";
import { MAX_MESSAGE_LENGTH, parseContactForm } from "./schema";

const NOW = new Date("2026-11-06T12:00:00Z");

function form(fields: Record<string, string | Blob>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const minimal = { names: "Sara & Omar", email: "sara@example.com" };

describe("parseContactForm", () => {
  test("accepts the minimal required fields and defaults the package", () => {
    const result = parseContactForm(form(minimal), NOW);

    expect(result).toEqual({
      success: true,
      data: {
        names: "Sara & Omar",
        email: "sara@example.com",
        package: "unsure",
        weddingDate: undefined,
        languages: undefined,
        city: undefined,
        message: undefined,
      },
    });
  });

  test("trims whitespace and turns empty optional fields into undefined", () => {
    const result = parseContactForm(
      form({ ...minimal, names: "  Sara & Omar  ", city: "   ", languages: "" }),
      NOW,
    );

    expect(result.success && result.data.names).toBe("Sara & Omar");
    expect(result.success && result.data.city).toBeUndefined();
    expect(result.success && result.data.languages).toBeUndefined();
  });

  test("accepts every optional field when valid", () => {
    const result = parseContactForm(
      form({
        ...minimal,
        weddingDate: "2027-06-12",
        languages: "both families' languages",
        package: "premium",
        city: "Vienna",
        message: "We would love music.",
      }),
      NOW,
    );

    expect(result.success).toBe(true);
    expect(result.success && result.data.package).toBe("premium");
    expect(result.success && result.data.weddingDate).toBe("2027-06-12");
  });

  test("requires names", () => {
    const result = parseContactForm(form({ email: "sara@example.com" }), NOW);

    expect(result.success).toBe(false);
    expect(!result.success && result.fieldErrors.names).toBeTruthy();
  });

  test("rejects an invalid email", () => {
    const result = parseContactForm(form({ ...minimal, email: "not-an-email" }), NOW);

    expect(!result.success && result.fieldErrors.email).toBeTruthy();
  });

  test("rejects names longer than 120 characters", () => {
    const result = parseContactForm(form({ ...minimal, names: "a".repeat(121) }), NOW);

    expect(!result.success && result.fieldErrors.names).toBeTruthy();
  });

  test("allows a message at the length limit and rejects one over it", () => {
    const atLimit = parseContactForm(
      form({ ...minimal, message: "a".repeat(MAX_MESSAGE_LENGTH) }),
      NOW,
    );
    const overLimit = parseContactForm(
      form({ ...minimal, message: "a".repeat(MAX_MESSAGE_LENGTH + 1) }),
      NOW,
    );

    expect(atLimit.success).toBe(true);
    expect(!overLimit.success && overLimit.fieldErrors.message).toBeTruthy();
  });

  test("rejects a package that is not offered", () => {
    const result = parseContactForm(form({ ...minimal, package: "platinum" }), NOW);

    expect(!result.success && result.fieldErrors.package).toBeTruthy();
  });

  test("rejects a wedding date in the past", () => {
    const result = parseContactForm(form({ ...minimal, weddingDate: "2026-11-01" }), NOW);

    expect(!result.success && result.fieldErrors.weddingDate).toBeTruthy();
  });

  test("accepts today and yesterday (time-zone grace) as wedding dates", () => {
    expect(parseContactForm(form({ ...minimal, weddingDate: "2026-11-06" }), NOW).success).toBe(true);
    expect(parseContactForm(form({ ...minimal, weddingDate: "2026-11-05" }), NOW).success).toBe(true);
  });

  test("rejects impossible or malformed dates", () => {
    const impossible = parseContactForm(form({ ...minimal, weddingDate: "2027-02-30" }), NOW);
    const malformed = parseContactForm(form({ ...minimal, weddingDate: "12/06/2027" }), NOW);

    expect(!impossible.success && impossible.fieldErrors.weddingDate).toBeTruthy();
    expect(!malformed.success && malformed.fieldErrors.weddingDate).toBeTruthy();
  });

  test("rejects a file upload in a text field instead of crashing", () => {
    const result = parseContactForm(
      form({ ...minimal, message: new Blob(["x"], { type: "text/plain" }) }),
      NOW,
    );

    expect(!result.success && result.fieldErrors.message).toBeTruthy();
  });
});
