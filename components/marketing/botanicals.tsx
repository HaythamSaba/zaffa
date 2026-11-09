import type { ReactNode } from "react";

type Props = { className?: string };

/** Fine botanical line drawings: 1px strokes, round caps (docs/brand.md). Decorative only. */
function Botanical({ className = "", children }: Props & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 60 60"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  );
}

/** Sprig geometry (60-unit grid), shared with the Open Graph image. */
export const sprigPaths = [
  "M30 57C30 42 30 24 30 7",
  "M30 46C22 44 17 38 17 31C24 32 29 38 30 46Z",
  "M30 38C38 36 43 30 43 23C36 24 31 30 30 38Z",
  "M30 28C23 26 20 20 21 14C26 16 29 21 30 28Z",
  "M30 20C35 18 38 13 37 8C33 10 30 14 30 20Z",
] as const;
export const sprigBud = { cx: 30, cy: 5, r: 2 } as const;

/** Tall sprig with four leaves and a bud; above the intro statement and on Premium. */
export function Sprig({ className }: Props) {
  return (
    <Botanical className={className}>
      {sprigPaths.map((d) => (
        <path key={d} d={d} />
      ))}
      <circle {...sprigBud} />
    </Botanical>
  );
}

/** Small two-leaf sprig: Essential. */
export function SmallSprig({ className }: Props) {
  return (
    <Botanical className={className}>
      <path d="M30 57C30 42 30 24 30 7" />
      <path d="M30 40C22 38 18 32 18 26C24 27 29 32 30 40Z" />
      <path d="M30 30C38 28 42 22 42 16C36 17 31 22 30 30Z" />
    </Botanical>
  );
}

/** Three-petal blossom: Bespoke. */
export function Blossom({ className }: Props) {
  return (
    <Botanical className={className}>
      <circle cx="30" cy="22" r="8" />
      <circle cx="22" cy="32" r="8" />
      <circle cx="38" cy="32" r="8" />
      <path d="M30 40V57" />
    </Botanical>
  );
}
