const HEX = /^#([0-9a-f]{6})$/i;

/** WCAG 2 relative luminance of a 6-digit hex colour. */
function luminance(hex: string): number {
  const match = HEX.exec(hex);
  if (!match) throw new TypeError(`Expected a 6-digit hex colour, got "${hex}"`);

  const [r, g, b] = [0, 2, 4].map((offset) => {
    const channel = parseInt(match[1].slice(offset, offset + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2 contrast ratio between two colours (1 to 21, order-independent). */
export function contrastRatio(foreground: string, background: string): number {
  const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}
