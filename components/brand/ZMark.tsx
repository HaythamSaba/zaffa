type Props = {
  className?: string;
};

/**
 * The "Two-Line Z" from docs/brand.md: the top line is a text, the bottom line
 * its translation, joined by a gentle S-curve. Inherits currentColor.
 */
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
      <path d="M4.5 4.5H19.5" strokeWidth="3" />
      <path d="M19.5 4.5C14 8.5 10 15.5 4.5 19.5" strokeWidth="2.5" />
      <path d="M4.5 19.5H19.5" strokeWidth="2" />
    </svg>
  );
}
