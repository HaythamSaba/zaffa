/**
 * The "Two-Line Z" from docs/brand.md: the top line is a text, the bottom line
 * its translation, joined by a gentle S-curve (24-unit grid). Used only for the
 * favicon, apple icon and social avatars; the header and footer use the
 * wordmark alone. Exported so image renderers draw the identical mark.
 */
export const zMarkPaths = [
  { d: "M4.5 4.5H19.5", strokeWidth: 3 },
  { d: "M19.5 4.5C14 8.5 10 15.5 4.5 19.5", strokeWidth: 2.5 },
  { d: "M4.5 19.5H19.5", strokeWidth: 2 },
] as const;

type Props = {
  className?: string;
};

/** Inline SVG version; inherits currentColor. */
export function ZMark({ className }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {zMarkPaths.map((path) => (
        <path key={path.d} d={path.d} strokeWidth={path.strokeWidth} />
      ))}
    </svg>
  );
}
