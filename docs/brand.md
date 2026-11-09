# Zaffa brand: "Linen & Arches"

> Approved Nov 2026. Replaces Direction A ("Procession": Fraunces, Manrope, coral, indigo, saffron). Remove every Direction A token from the code.

**Mood:** soft, timeless and romantic, like heirloom wedding stationery: warm linen tones, elegant uppercase serif, arches, framed photographs and fine botanical line drawings.

**Appeals to:** couples from mixed and international families who want an invitation that feels classic and dignified to the grandparents and beautiful to their friends.

This is the **company brand**: the marketing site, social media and small "Made by Zaffa" touches. Invitation templates have their own designs and must not clash with it.

## Typography

Both fonts are on Google Fonts. Load them with `next/font/google`.

| Role | Font | Weights | Notes |
|---|---|---|---|
| Display / headings | Cormorant Garamond | 400, 500, 600, 700; Italic 400, 500 | Headings are set in **uppercase**, weight 400, tracking +0.06em, with the key words in **700** (`<b>`). Italic is for small accents (a signature, "in about one week", the "&" in names). |
| Body + UI | Montserrat | 400, 500, 600 | Body text 15–16px. Labels, nav and buttons in 600, uppercase, tracking +0.16–0.18em, 11–12px. |

### Fonts for other scripts (invitation pages)

The marketing site uses only Cormorant Garamond and Montserrat.

| Script | Headings | Body / UI |
|---|---|---|
| Arabic | Amiri | Noto Naskh Arabic; Readex Pro for UI |
| Persian / Urdu | Vazirmatn | Vazirmatn; Noto Nastaliq Urdu for Urdu |
| Hebrew | Frank Ruhl Libre | Heebo |
| Cyrillic / Greek | Cormorant Garamond (covers both) | Montserrat (covers both) |
| Devanagari | Tiro Devanagari Hindi | Noto Sans Devanagari |
| CJK | Noto Serif SC/JP/KR | Noto Sans SC/JP/KR |

**Uppercase and tracking apply to Latin, Cyrillic and Greek only.** Never apply `uppercase` or letter-spacing to Arabic, Hebrew or other scripts: Arabic letters must stay connected.

### Web type scale

16px base, fluid between a 375px phone and a 1280px desktop.

| Token | Size | Line height | Style |
|---|---|---|---|
| display | `clamp(2.4rem, 1.4rem + 3.6vw, 4.4rem)` → 38–70px | 1.1 | Cormorant 400 uppercase +0.06em, key words 700 |
| h1-band | `clamp(2.2rem, 1.4rem + 3vw, 3.8rem)` → 35–61px | 1.1 | Same, for the closing call to action |
| h2 | `clamp(1.8rem, 1.3rem + 1.6vw, 2.6rem)` → 29–42px | 1.15–1.2 | Same |
| statement | `clamp(1.5rem, 1.1rem + 1.4vw, 2.3rem)` → 24–37px | 1.35 | Same, centered |
| h3 / card title | 24–26px | 1.2 | Cormorant uppercase +0.12–0.18em |
| price | 48px | 1 | Cormorant 500 |
| body | 15–16px | 1.8 | Montserrat 400 |
| small | 13–14px | 1.6 | Montserrat 400 |
| label | 11–12px, uppercase, +0.16–0.18em | 1.4 | Montserrat 600 |

## Color palette

| Name | Hex | Role |
|---|---|---|
| Ivory | `#FBF7F2` | Page background |
| Sand | `#F0E7DD` | Section bands, card surfaces, blocks behind framed content |
| Cocoa | `#4B3A33` | Main text and headings |
| Taupe | `#6E5A50` | Primary buttons, highlighted card (Premium), secondary text, icons |
| Mocha | `#7A6A62` | Muted text, captions (**only on Ivory or White**) |
| Linen | `#D9C6B6` | Borders, dividers, card outlines (decorative) |
| Stone | `#BFA694` | Thin decorative lines (decorative only) |
| White | `#FFFFFF` | Photo frames, text on photos, light buttons |
| Espresso | `#2B201C` | Phone bezel; base for dark overlays on photos |
| Rosewood | `#9A3B2E` | **Form errors only:** error text, the error icon and the invalid-field border. Always paired with a written message and an icon, never colour alone. |

### Contrast (WCAG AA body text needs 4.5:1)

| Text on background | Ratio | Result |
|---|---|---|
| Cocoa on Ivory | 10.09:1 | Pass |
| Cocoa on Sand | 8.80:1 | Pass |
| Cocoa on White | 10.76:1 | Pass |
| Taupe on Ivory | 6.07:1 | Pass |
| Taupe on Sand | 5.30:1 | Pass |
| Mocha on Ivory | 4.84:1 | Pass |
| Mocha on White | 5.17:1 | Pass |
| White on Taupe (button) | 6.48:1 | Pass |
| Ivory on Taupe | 6.07:1 | Pass |
| Sand on Taupe | 5.30:1 | Pass |
| White on Cocoa | 10.76:1 | Pass |
| Rosewood on White (form error) | 6.92:1 | Pass |
| Rosewood on Ivory | 6.46:1 | Pass |
| Rosewood on Sand | 5.63:1 | Pass |
| Mocha on Sand | 4.23:1 | **Fail**: use Taupe on Sand |
| Stone on Ivory | 2.16:1 | **Fail**: decoration only |
| Linen on Ivory | 1.55:1 | **Fail**: decoration only |

**White text on photos** (hero, closing band) always needs a dark overlay, e.g. `linear-gradient(rgba(43,32,28,.55), rgba(43,32,28,.25), rgba(43,32,28,.6))` over the image. Check the contrast against the lightest part of the real photo behind the text.

## Shapes and motifs

- **Arches:** `border-radius: 9999px 9999px 6px 6px` on feature photo cards and package cards. The arch is the signature shape.
- **Curved section edges:** the hero photo ends in a soft convex curve into Ivory, and the closing band starts with the mirrored curve. Use an SVG or a pseudo-element; no layout shift.
- **Framed photos:** white 10px frame with the shadow `0 18px 40px rgba(75,58,51,.14)`. Often overlapping a Sand block that is offset behind it.
- **Botanical line drawings:** thin 1px Taupe strokes, round caps (sprig, leaves). Used sparingly: above the intro statement and on package cards.
- **Thin vertical line:** 1px Stone, about 90px tall, leading from the sprig into the statement.
- **Buttons:** square corners (no pill), uppercase Montserrat 600 12px +0.18em, at least 48px tall. Primary is Taupe, hovering to Cocoa. On photos, use White with Cocoa text, hovering to Sand. Outline buttons have a 1px Taupe border.
- **Photography:** warm, soft, natural light. Choose photos where hands, tables, details and dancing matter more than faces, so they feel international. Use licensed images only (e.g. Unsplash or Pexels with a commercial license), and later clients' photos with written permission.

## Logo

- **Wordmark:** `ZAFFA` in Cormorant Garamond 500, uppercase, tracking +0.32em. Cocoa on light backgrounds, White on photos.
- **Symbol: the "Two-Line Z"** (unchanged from earlier): a Z made from two equal horizontal bars, the top one slightly thicker, joined by a gentle S-curve diagonal with round ends. The top line is a text and the bottom line its translation. Use it next to the wordmark in the header, as the favicon and as the social avatar.

```svg
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" aria-hidden="true">
  <path d="M4.5 4.5H19.5" stroke-width="3"/>
  <path d="M19.5 4.5C14 8.5 10 15.5 4.5 19.5" stroke-width="2.5"/>
  <path d="M4.5 19.5H19.5" stroke-width="2"/>
</svg>
```

- **Favicon / app icon:** Ivory Z on a Taupe square with a 22% corner radius. At 16px and 32px, use a simplified Z with equal bars and a straight diagonal.
- **Instagram and TikTok avatar:** Ivory Z on Taupe, with the Z filling 55% of the circle.
- **Open Graph / WhatsApp preview (1200 × 630):** the Ivory `ZAFFA` wordmark centered on Taupe, with a small Ivory botanical sprig above it.
- **Minimums:** 80px wide for the wordmark, 16px for the symbol. Keep clear space equal to the height of the Z on all sides.

## Tailwind tokens

For Tailwind v4, put this in `app/globals.css`, after `@import "tailwindcss";`, replacing the Direction A tokens:

```css
@theme {
  --color-ivory: #FBF7F2;
  --color-sand: #F0E7DD;
  --color-cocoa: #4B3A33;
  --color-taupe: #6E5A50;
  --color-mocha: #7A6A62;
  --color-linen: #D9C6B6;
  --color-stone: #BFA694;
  --color-espresso: #2B201C;
  --color-rosewood: #9A3B2E; /* form errors only */

  --font-display: var(--font-cormorant), Georgia, serif;
  --font-sans: var(--font-montserrat), system-ui, sans-serif;

  --text-display: clamp(2.4rem, 1.4rem + 3.6vw, 4.4rem);
  --text-band: clamp(2.2rem, 1.4rem + 3vw, 3.8rem);
  --text-h2: clamp(1.8rem, 1.3rem + 1.6vw, 2.6rem);
  --text-statement: clamp(1.5rem, 1.1rem + 1.4vw, 2.3rem);

  --tracking-caps: 0.06em;
  --tracking-label: 0.18em;
  --tracking-wordmark: 0.32em;

  --radius-arch: 9999px 9999px 6px 6px;
  --shadow-frame: 0 18px 40px rgba(75, 58, 51, 0.14);
}
```

`--font-cormorant` and `--font-montserrat` come from `next/font/google` with the `variable` option.

Color rules:
- Never put `text-mocha` on `bg-sand`; use `text-taupe`.
- `stone` and `linen` are for lines and borders only, never for text.
- White text on photos always needs the dark overlay.
- `rosewood` is only for form errors (text, icon, invalid-field border), always with a written message.
