import { ZMark } from "./ZMark";

type Props = {
  /** Show the Two-Line Z before the wordmark (header). The footer uses the wordmark alone. */
  hasMark?: boolean;
  className?: string;
};

/**
 * `ZAFFA` in Cormorant Garamond 500, uppercase, +0.32em (docs/brand.md).
 * Colour comes from the parent: Cocoa on light, White on photos.
 */
export function Logo({ hasMark = true, className = "" }: Props) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {hasMark && <ZMark className="size-6 shrink-0" />}
      <span className="font-display text-[1.625rem] leading-none font-medium tracking-wordmark uppercase">
        Zaffa
      </span>
    </span>
  );
}
