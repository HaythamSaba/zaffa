import { ZMark } from "./ZMark";

type Props = {
  /** Adds the Saffron dot after the wordmark (dark surfaces only). */
  hasDot?: boolean;
  className?: string;
};

/**
 * Symbol + lowercase wordmark. Plain Fraunces 600 until the final ff-ligature
 * SVG lands in public/brand/. Color comes from the parent via currentColor.
 */
export function Logo({ hasDot = false, className = "" }: Props) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <ZMark className="size-[1em] shrink-0" />
      <span className="font-display leading-none font-semibold tracking-[-0.01em]">
        zaffa
      </span>
      {hasDot && (
        <span
          aria-hidden="true"
          className="size-[0.2em] self-end rounded-full bg-saffron mb-[0.18em]"
        />
      )}
    </span>
  );
}
