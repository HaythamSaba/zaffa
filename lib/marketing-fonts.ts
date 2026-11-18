import { Cormorant_Garamond, Montserrat } from "next/font/google";

// Brand fonts (docs/brand.md), marketing site only. Variable fonts: one file
// each covers every weight. Shared by the marketing layout and the global 404.
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const marketingFontClassName = `${cormorant.variable} ${montserrat.variable}`;
