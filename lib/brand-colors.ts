/**
 * Brand colors as plain values, mirroring the @theme tokens in app/globals.css.
 * Only for renderers that can't read CSS variables (Open Graph image, app icon).
 * Components must use the Tailwind tokens instead. A unit test keeps these in sync.
 */
export const brandColors = {
  coral: "#b8432c",
  coralDeep: "#9e3722",
  indigo: "#1f2340",
  saffron: "#f2b544",
  paper: "#fcf8f3",
  blush: "#f6e3d8",
  dusk: "#5f5b6e",
  line: "#e6dcd3",
} as const;
