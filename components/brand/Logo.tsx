type Props = {
  className?: string;
};

/**
 * The `ZAFFA` wordmark alone: Cormorant Garamond 500, uppercase, +0.32em
 * (docs/brand.md). Header and footer use it without the Z mark. Colour comes
 * from the parent: Cocoa on light, White on photos.
 */
export function Logo({ className = "" }: Props) {
  return (
    <span
      className={`font-display text-[1.625rem] leading-none font-medium tracking-wordmark uppercase ${className}`}
    >
      Zaffa
    </span>
  );
}
