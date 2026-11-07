import { describe, expect, test } from "vitest";
import { formatEuro, packageOptionLabel } from "./format";

describe("formatEuro", () => {
  test("formats whole euro amounts without decimals", () => {
    expect(formatEuro(250)).toBe("€250");
  });

  test("groups thousands", () => {
    expect(formatEuro(1200)).toBe("€1,200");
  });
});

describe("packageOptionLabel", () => {
  test("joins name and fixed price with a middle dot", () => {
    expect(packageOptionLabel({ name: "Essential", priceEur: 250 })).toBe(
      "Essential · €250",
    );
  });

  test("prefixes 'from' for starting prices", () => {
    expect(
      packageOptionLabel({ name: "Bespoke", priceEur: 700, priceFrom: true }),
    ).toBe("Bespoke · from €700");
  });
});
