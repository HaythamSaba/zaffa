import { describe, expect, test } from "vitest";
import { brandColors } from "./brand-colors";
import { contrastRatio } from "./contrast";

const AA_BODY = 4.5;
const { ivory, sand, cocoa, taupe, mocha, linen, stone, rosewood, white } = brandColors;

describe("contrastRatio", () => {
  test("black on white is 21:1 and is symmetric", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 5);
  });

  test("identical colours are 1:1", () => {
    expect(contrastRatio(ivory, ivory)).toBeCloseTo(1, 5);
  });

  test("rejects values that are not 6-digit hex colours", () => {
    expect(() => contrastRatio("red", "#ffffff")).toThrow();
  });
});

// The table in docs/brand.md, checked against the real tokens.
describe("brand.md contrast table", () => {
  test.each([
    ["Cocoa on Ivory", cocoa, ivory, 10.09],
    ["Cocoa on Sand", cocoa, sand, 8.8],
    ["Cocoa on White", cocoa, white, 10.76],
    ["Taupe on Ivory", taupe, ivory, 6.07],
    ["Taupe on Sand", taupe, sand, 5.3],
    ["Mocha on Ivory", mocha, ivory, 4.84],
    ["Mocha on White", mocha, white, 5.17],
    ["White on Taupe (button)", white, taupe, 6.48],
    ["Ivory on Taupe", ivory, taupe, 6.07],
    ["Sand on Taupe", sand, taupe, 5.3],
    ["White on Cocoa", white, cocoa, 10.76],
    ["Rosewood on White (form error)", rosewood, white, 6.92],
    ["Rosewood on Ivory", rosewood, ivory, 6.46],
    ["Rosewood on Sand", rosewood, sand, 5.63],
  ])("%s passes AA and matches the documented ratio", (_name, fg, bg, documented) => {
    const ratio = contrastRatio(fg, bg);
    expect(ratio).toBeGreaterThanOrEqual(AA_BODY);
    expect(ratio).toBeCloseTo(documented, 1);
  });

  test.each([
    ["Mocha on Sand", mocha, sand],
    ["Stone on Ivory", stone, ivory],
    ["Linen on Ivory", linen, ivory],
  ])("%s fails AA, as documented (never use as text)", (_name, fg, bg) => {
    expect(contrastRatio(fg, bg)).toBeLessThan(AA_BODY);
  });
});
