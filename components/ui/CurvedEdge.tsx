type Props = {
  /** "bottom": the hero's convex curve into Ivory; "top": the mirrored curve opening the closing band. */
  position: "top" | "bottom";
};

const shape = {
  bottom: "-bottom-px rounded-[50%_50%_0_0/100%_100%_0_0]",
  top: "-top-px rounded-[0_0_50%_50%/0_0_100%_100%]",
} as const;

/**
 * A soft Ivory curve at the edge of a photo section (docs/brand.md). It is
 * absolutely positioned inside the section's own padding, so it never moves
 * the layout; the parent section must clip it (overflow-hidden).
 */
export function CurvedEdge({ position }: Props) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute -inset-x-[10%] h-16 bg-ivory nav:h-35 ${shape[position]}`}
    />
  );
}
