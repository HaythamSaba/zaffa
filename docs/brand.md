# Zaffa brand: Direction A, "Procession"

**Mood:** the warm, slightly irreverent joy of a family walking the couple in, set with editorial care.

**Appeals to:** couples aged roughly 25–40 from mixed and international families who want something celebratory and modern that their grandparents will still find dignified. The warm palette feels familiar across Mediterranean, Middle Eastern, Balkan, South Asian and Latin American traditions without belonging to any one of them.

This is the **company brand**: the marketing site, social media and small "Made by Zaffa" touches. Invitation templates have their own designs and must not clash with it.

## Typography

All fonts are on Google Fonts. Load them with `next/font/google`.

| Role | Font | Weights | Notes |
|---|---|---|---|
| Headings | Fraunces (variable) | 500, 600; Italic 400 for one accent word | Set `SOFT` 100, `WONK` 0, `opsz` auto. Soft, round serifs feel festive rather than stiff. Latin only. |
| Body + UI | Manrope (variable) | 400, 500, 700 | Covers Latin, Cyrillic and Greek. Use it for buttons, forms and the dashboard. |
| Cyrillic / Greek headings | Literata | 500, 600 | A warm serif with an optical-size axis, close to Fraunces in texture. |
| Arabic: display | Amiri | 400, 700 | Classical Naskh with calligraphic warmth. Use it for names and headings. |
| Arabic: reading text | Noto Naskh Arabic | 400–600 | The most readable Arabic style for older guests. |
| Arabic: UI | Readex Pro | 400, 500 | Arabic and Latin were designed together, so it matches Manrope in buttons. |
| Persian / Urdu | Vazirmatn / Noto Nastaliq Urdu | 400, 600 | Vazirmatn is the standard Persian web font. Urdu readers expect Nastaliq. |
| Hebrew | Frank Ruhl Libre (headings), Heebo (body) | 500, 700 / 400, 500 | The serif pairs with Fraunces and the sans with Manrope. |
| Devanagari | Tiro Devanagari Hindi (headings), Noto Sans Devanagari (body) | 400 / 400, 600 | |
| CJK | Noto Serif SC/JP/KR (headings), Noto Sans SC/JP/KR (body) | 500 / 400 | Load subsets only when a page uses them. |

The script fonts are for invitation pages in those languages. The marketing site uses only Fraunces and Manrope.

### Web type scale

17px base, fluid between a 375px phone and a 1280px desktop.

| Token | Size | Line height | Font / weight |
|---|---|---|---|
| display | `clamp(2.5rem, 1.75rem + 3.2vw, 4.5rem)` → 40–72px | 1.05, tracking −0.02em | Fraunces 600 |
| h1 | `clamp(2.125rem, 1.6rem + 2.2vw, 3.5rem)` → 34–56px | 1.1 | Fraunces 600 |
| h2 | `clamp(1.75rem, 1.45rem + 1.3vw, 2.5rem)` → 28–40px | 1.15 | Fraunces 600 |
| h3 | `clamp(1.375rem, 1.25rem + 0.55vw, 1.75rem)` → 22–28px | 1.25 | Fraunces 500 |
| h4 | `clamp(1.1875rem, 1.12rem + 0.3vw, 1.375rem)` → 19–22px | 1.3 | Manrope 700 |
| body-lg | `clamp(1.125rem, 1.07rem + 0.25vw, 1.25rem)` → 18–20px | 1.6 | Manrope 400 |
| body | `1.0625rem` → 17px | 1.65 | Manrope 400 |
| small | `0.9375rem` → 15px | 1.5 | Manrope 500 |
| eyebrow | `0.8125rem` → 13px, uppercase, +0.12em | 1.4 | Manrope 700 (Latin only) |

## Color palette

| Name | Hex | Role |
|---|---|---|
| Zaffa Coral | `#B8432C` | Primary: logo, main buttons, links, key highlights |
| Coral Deep | `#9E3722` | Hover and pressed states; links on Blush surfaces |
| Night Indigo | `#1F2340` | Secondary and main text: headings, body text, dark sections, footer |
| Saffron | `#F2B544` | Accent: confetti dots, underlines, badges. Use it as text only on Indigo. |
| Paper | `#FCF8F3` | Page background |
| Blush | `#F6E3D8` | Surface: package cards, FAQ panels, testimonial blocks |
| Dusk | `#5F5B6E` | Muted text: captions, helper text, form borders |
| Line | `#E6DCD3` | Decorative dividers only (1.28:1, never for meaningful borders) |

### Contrast (WCAG AA body text needs 4.5:1)

| Text on background | Ratio | Result |
|---|---|---|
| Night Indigo on Paper | 14.47:1 | Pass |
| Night Indigo on Blush | 12.31:1 | Pass |
| Paper on Night Indigo | 14.47:1 | Pass |
| Saffron on Night Indigo | 8.35:1 | Pass |
| Night Indigo on Saffron (badge) | 8.35:1 | Pass |
| Dusk on Paper | 6.19:1 | Pass |
| Dusk on Blush | 5.27:1 | Pass |
| Coral Deep on Paper | 6.57:1 | Pass |
| Coral Deep on Blush | 5.59:1 | Pass |
| Zaffa Coral on Paper | 5.12:1 | Pass |
| White on Zaffa Coral (button) | 5.42:1 | Pass |
| White on Coral Deep (hover) | 6.95:1 | Pass |
| Zaffa Coral on Blush | 4.36:1 | **Fail**: use Coral Deep instead |
| Saffron on Paper | 1.73:1 | **Fail**: decoration only |
| Zaffa Coral on Night Indigo | 2.82:1 | **Fail**: never pair these |

## Logo

### Wordmark: lowercase `zaffa` (primary)

Start from Fraunces SemiBold with `SOFT` at 100, then customize:

1. Merge the double f into one ligature with a single continuous crossbar running through both stems. Let the crossbar extend slightly past the second f. This is the "procession line".
2. Curl both f terminals forward like small raised flags. Set the second terminal a little higher than the first to suggest movement.
3. Soften the z's stroke ends so they are round, not sharp. Keep spacing tight and even; the two a's should feel like matching bookends.

Lowercase reads friendliest and gives a nice rhythm: a short z, a, a tall ff, a.

- **Uppercase `ZAFFA`** is a supporting lockup in Fraunces 600 with +12% tracking and no ligature, for stamps, merch and video end cards.
- **Write "Zaffa" in running text only**; it is never the logo.

> Status: the custom ff ligature isn't drawn yet. Until a final SVG exists, the site uses plain Fraunces 600 lowercase `zaffa`. Put the final files in `public/brand/`.

### Symbol: the "Two-Line Z"

- Draw a Z from two horizontal bars joined by a diagonal.
- The top bar is a line of text; the bottom bar, identical in length but slightly thinner, is its translation directly beneath. That is the product in one mark.
- The diagonal is a gentle S-curve like a ribbon, not a ruler-straight line, so it moves. All stroke ends are round.
- On a 24-unit grid the Z is 16 × 16, with a 3.5-unit top bar, a 3-unit diagonal and a 2.5-unit bottom bar.
- The bars are equal length, so the mark has no LTR bias.

Placeholder SVG used on the landing page until the final mark is drawn:

```svg
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" aria-hidden="true">
  <path d="M4.5 4.5H19.5" stroke-width="3.5"/>
  <path d="M19.5 4.5C14 8.5 10 15.5 4.5 19.5" stroke-width="3"/>
  <path d="M4.5 19.5H19.5" stroke-width="2.5"/>
</svg>
```

### Favicon, avatar and link previews

- **Favicon / app icon:** Paper Z on a Zaffa Coral square with a 22% corner radius.
- **Instagram and TikTok circle:** the Z fills 55% of the diameter.
- **At 16px and 32px:** use a simplified Z with equal 3px bars and a straight diagonal.
- **WhatsApp / Open Graph preview (1200 × 630):** Paper wordmark on Night Indigo with a single Saffron dot after it.

### One-color use and minimum sizes

- Works in Night Indigo, Zaffa Coral, Paper reversed, or pure black.
- Minimum sizes: 72px wide for the wordmark, 16px for the symbol.
- Clear space: equal to the x-height of the a, on all sides.

## Tailwind tokens

For Tailwind v4, put this in `app/globals.css`, after `@import "tailwindcss";`:

```css
@theme {
  --color-coral: #B8432C;
  --color-coral-deep: #9E3722;
  --color-indigo: #1F2340;
  --color-saffron: #F2B544;
  --color-paper: #FCF8F3;
  --color-blush: #F6E3D8;
  --color-dusk: #5F5B6E;
  --color-line: #E6DCD3;

  --font-display: var(--font-fraunces), Georgia, serif;
  --font-sans: var(--font-manrope), system-ui, sans-serif;

  --text-display: clamp(2.5rem, 1.75rem + 3.2vw, 4.5rem);
  --text-h1: clamp(2.125rem, 1.6rem + 2.2vw, 3.5rem);
  --text-h2: clamp(1.75rem, 1.45rem + 1.3vw, 2.5rem);
  --text-h3: clamp(1.375rem, 1.25rem + 0.55vw, 1.75rem);
  --text-h4: clamp(1.1875rem, 1.12rem + 0.3vw, 1.375rem);
  --text-body-lg: clamp(1.125rem, 1.07rem + 0.25vw, 1.25rem);
  --text-body: 1.0625rem;
  --text-small: 0.9375rem;
  --text-eyebrow: 0.8125rem;
}

.font-display {
  font-variation-settings: "SOFT" 100, "WONK" 0;
  font-optical-sizing: auto;
}
```

`--font-fraunces` and `--font-manrope` come from `next/font/google` with the `variable` option. Load Fraunces with `axes: ["SOFT", "WONK", "opsz"]`.

Color rules:
- Never put `text-coral` on `bg-blush`; use `text-coral-deep`.
- Never put `text-saffron` on `bg-paper`.
- Never pair coral and indigo as text and background.
