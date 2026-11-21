import { describe, expect, test } from "vitest";
import { guestCountLabel } from "./messages";

describe("guestCountLabel", () => {
  test("singular for exactly 1", () => {
    expect(guestCountLabel(1)).toBe("1 guest");
  });

  test("plural for 0 and for more than 1", () => {
    expect(guestCountLabel(0)).toBe("0 guests");
    expect(guestCountLabel(2)).toBe("2 guests");
    expect(guestCountLabel(20)).toBe("20 guests");
  });
});
