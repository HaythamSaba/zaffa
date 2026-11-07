import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { brandColors } from "./brand-colors";

const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");

function tokenFromCss(name: string): string | undefined {
  return css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`))?.[1]?.toLowerCase();
}

describe("brandColors", () => {
  test.each(Object.entries(brandColors))("%s matches the @theme token in globals.css", (name, hex) => {
    const kebab = name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
    expect(tokenFromCss(kebab)).toBe(hex.toLowerCase());
  });
});
