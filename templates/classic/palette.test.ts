import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { contrastRatio } from "@/lib/contrast";
import { classicPalette } from "./palette";

const AA_BODY = 4.5;
const { ink, umber, champagne, parchment, cream, smoke, white } = classicPalette;

describe("classic palette", () => {
  test("matches the tokens in templates/classic/theme.css", () => {
    const css = readFileSync(join(process.cwd(), "templates/classic/theme.css"), "utf8");
    for (const [name, hex] of Object.entries(classicPalette)) {
      expect(css).toContain(`--color-classic-${name}: ${hex};`);
    }
  });

  // Every text/background pair the template uses. Gold is only for
  // decorative lines and frames (no text), so it isn't listed.
  test.each([
    ["ink on parchment", ink, parchment],
    ["ink on cream", ink, cream],
    ["smoke on parchment", smoke, parchment],
    ["smoke on cream", smoke, cream],
    ["umber on parchment", umber, parchment],
    ["umber on cream", umber, cream],
    ["white on umber (buttons)", white, umber],
    ["white on ink (button hover)", white, ink],
    ["parchment on ink (countdown, RSVP)", parchment, ink],
    ["champagne on ink", champagne, ink],
  ])("%s meets WCAG AA for body text", (_label, foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(AA_BODY);
  });
});
