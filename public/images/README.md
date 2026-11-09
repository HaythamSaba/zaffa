# Landing page photos

Put licensed photos for the landing page here, then wire each one up in `lib/photos.ts`
(set `src`, `width`, `height`, and a descriptive `alt` if the photo adds meaning).
Until a slot has a file, the `Photo` component shows a labelled placeholder.

## Rules (docs/brand.md)
- Warm, soft, natural light. Prefer hands, tables, details and dancing over faces, so the
  photos feel international.
- **Licensed images only** (e.g. Unsplash or Pexels with a commercial licence). Use clients'
  photos only with their written permission. Keep a note of each photo's source and licence
  below.
- Any photo with white text on top (hero, closing band) gets the dark overlay automatically
  (`overlay` prop). Check the text contrast against the lightest part of the real photo.

## Slots
| Slot (`lib/photos.ts`) | Shows | Suggested size |
|---|---|---|
| `hero` | Couple holding hands at golden hour | 2400 × 1600 |
| `story`, `countdown`, `venue`, `gallery`, `languages` | Arch cards | 800 × 1000 |
| `phoneCouple` | The couple (top of the sample invitation) | 800 × 600 |
| `faqTable` | Table setting with flowers | 1000 × 1300 |
| `closing` | Guests celebrating | 2400 × 1400 |

## Sources and licences
| File | Source | Licence |
|---|---|---|
