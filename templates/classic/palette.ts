/**
 * "Classic Elegance" colours (docs/templates/classic-reference.html), as plain
 * values for the contrast test. Components use the Tailwind tokens from
 * templates/classic/theme.css (bg-classic-parchment, text-classic-umber, ...);
 * a test keeps the two in sync.
 */
export const classicPalette = {
  /** Body text, dark bands. */
  ink: "#2e2a26",
  /** Buttons, accents, links. */
  umber: "#7a5a2e",
  /** Hairlines, frames, ornaments only (never text). */
  gold: "#b8955a",
  /** Text on ink. */
  champagne: "#d9be8c",
  /** Page background. */
  parchment: "#fbf8f1",
  /** Alternate section background. */
  cream: "#f3ecdf",
  /** Secondary text, field borders. */
  smoke: "#6b655e",
  /** Divider lines between list rows. */
  rule: "#e3d7c3",
  white: "#ffffff",
} as const;
