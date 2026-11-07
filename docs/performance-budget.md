# Performance budget: landing page JS

**Budget:** initial JavaScript for `/` at most **155 kB gzipped** (gzip level 9), checked by
`npm run check:bundle` (part of `npm run verify`, after the build).

The original target was 150 kB. It was raised to 155 kB on 2026-11-07 after Phase 4
(reveal animations), so it still catches regressions without failing on the accepted
Motion cost.

## How it is measured
`scripts/check-bundle.mjs` reads the prerendered `.next/server/app/index.html`, sums every
`<script src>` it loads, and gzips each file at level 9. Scripts marked `noModule` (Next's
~38.6 kB legacy polyfill bundle) are skipped, because modern browsers never download them.
Lazy chunks loaded after hydration (such as Motion's `domAnimation`) are not counted.

## Measurements (2026-11-07, Next 16.4.5, after Phase 4)
| | Initial JS for `/` |
|---|---|
| gzip -9 | **152.7 kB** |
| gzip -6 (typical server default) | 153.0 kB |
| brotli (what Vercel serves) | **131.6 kB** |
| Before Phase 4 (no Motion), gzip -9 | 137.8 kB |

Largest pieces: React DOM ≈ 69.9 kB, Next.js runtime ≈ 45.4 kB, Motion core
(`LazyMotion`, `MotionConfig`, `m`) ≈ 15 kB, contact form ≈ 7.5 kB. Motion's animation
features (`domAnimation`, ≈ 18.8 kB) load lazily after hydration.

## Decisions that keep it small
- `m` is imported from `motion/react-m`; importing it from `motion/react` pulled drag and
  layout code into the initial bundle (182.3 kB in total).
- `domAnimation` is passed to `LazyMotion` as an async loader, so it's split into its own chunk.
- All sections are server components; only `Reveal` and the contact form ship client JS.

## Fallback if the budget becomes a problem (option 3)
Replace Motion with a CSS transition plus a small `IntersectionObserver` component
(about 1 kB): the same opacity and 12px translate, once per element, and
`@media (prefers-reduced-motion: reduce)` to drop the movement. This removes about 15 kB
and brings `/` back to about 138 kB gzipped. The trade-off is giving up Motion's
`LazyMotion` / `MotionConfig` setup.
