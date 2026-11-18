import { Amiri, Bodoni_Moda, EB_Garamond, Noto_Naskh_Arabic, Pinyon_Script } from "next/font/google";

// Only imported by the invitation root layouts (app/sites/), so these fonts
// never load on the marketing site. Arabic fonts aren't preloaded: the browser
// fetches them only when Arabic text is on the page (unicode-range).
const bodoni = Bodoni_Moda({
  variable: "--font-classic-bodoni",
  subsets: ["latin"],
  display: "swap",
});

const pinyon = Pinyon_Script({
  variable: "--font-classic-pinyon",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const garamond = EB_Garamond({
  variable: "--font-classic-garamond",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const amiri = Amiri({
  variable: "--font-classic-amiri",
  weight: ["400", "700"],
  subsets: ["arabic"],
  display: "swap",
  preload: false,
});

const naskh = Noto_Naskh_Arabic({
  variable: "--font-classic-naskh",
  subsets: ["arabic"],
  display: "swap",
  preload: false,
});

export const classicFontClassName = [bodoni, pinyon, garamond, amiri, naskh]
  .map((font) => font.variable)
  .join(" ");
