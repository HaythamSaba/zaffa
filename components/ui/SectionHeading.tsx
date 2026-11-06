import type { ReactNode } from "react";

type Props = {
  id: string;
  eyebrow?: string;
  children: ReactNode;
  /** Use on Indigo surfaces. */
  isOnDark?: boolean;
  className?: string;
};

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-eyebrow font-bold uppercase text-coral-deep">{children}</p>
  );
}

/** Eyebrow + h2. `id` is used by the parent section's aria-labelledby. */
export function SectionHeading({
  id,
  eyebrow,
  children,
  isOnDark = false,
  className = "",
}: Props) {
  const color = isOnDark ? "text-paper" : "text-indigo";
  return (
    <div className={`flex max-w-180 flex-col gap-1.5 ${className}`}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2
        id={id}
        className={`font-display text-h1 font-semibold text-balance ${color}`}
      >
        {children}
      </h2>
    </div>
  );
}
