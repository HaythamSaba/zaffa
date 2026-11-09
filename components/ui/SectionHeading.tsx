import type { ReactNode } from "react";

/** Small uppercase label above a heading, e.g. "A sample invitation". */
export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`label text-taupe text-balance ${className}`}>{children}</p>;
}

type Props = {
  id: string;
  /** Optional label above the heading. */
  eyebrow?: string;
  /** Heading text; wrap the key words in <b> (rendered at 700). */
  children: ReactNode;
  align?: "start" | "center";
  /** h2 for sections; band for the closing call to action. */
  size?: "h2" | "band";
  /** White text, only on photos with the Espresso overlay. */
  isOnPhoto?: boolean;
  className?: string;
};

/** Optional label + uppercase Cormorant h2. `id` feeds the section's aria-labelledby. */
export function SectionHeading({
  id,
  eyebrow,
  children,
  align = "start",
  size = "h2",
  isOnPhoto = false,
  className = "",
}: Props) {
  const alignment = align === "center" ? "items-center text-center" : "items-start text-start";
  const color = isOnPhoto ? "text-white" : "text-cocoa";
  const textSize = size === "band" ? "text-band" : "text-h2";

  return (
    <div className={`flex flex-col gap-3.5 ${alignment} ${className}`}>
      {eyebrow && <Eyebrow className={isOnPhoto ? "text-white" : ""}>{eyebrow}</Eyebrow>}
      <h2 id={id} className={`caps ${textSize} text-balance ${color}`}>
        {children}
      </h2>
    </div>
  );
}
