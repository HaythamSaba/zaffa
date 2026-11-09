/**
 * Brand colors ("Linen & Arches") as plain values, mirroring the @theme tokens in
 * app/globals.css. Only for renderers that can't read CSS variables (Open Graph
 * image, app icon) and for the contrast test. Components must use the Tailwind
 * tokens instead. A unit test keeps these in sync with globals.css.
 */
export const brandColors = {
  ivory: "#fbf7f2",
  sand: "#f0e7dd",
  cocoa: "#4b3a33",
  taupe: "#6e5a50",
  mocha: "#7a6a62",
  linen: "#d9c6b6",
  stone: "#bfa694",
  espresso: "#2b201c",
  rosewood: "#9a3b2e",
  white: "#ffffff",
} as const;
