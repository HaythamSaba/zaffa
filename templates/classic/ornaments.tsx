import type { Monogram } from "@/lib/events/monogram";

type CornerProps = { className: string };

/** Fine gold corner flourish for the opening card (decorative). */
export function CornerFlourish({ className }: CornerProps) {
  return (
    <svg
      aria-hidden="true"
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      className={`absolute stroke-classic-gold ${className}`}
      strokeWidth="1"
    >
      <path d="M2 40C2 18 18 2 40 2" />
      <path d="M10 40C10 23 23 10 40 10" />
      <circle cx="6" cy="6" r="2.5" />
    </svg>
  );
}

type DividerProps = { lineClassName?: string };

/** Gold hairlines around a small four-point star (decorative). */
export function StarDivider({ lineClassName = "w-12" }: DividerProps) {
  return (
    <div aria-hidden="true" className="flex items-center gap-3">
      <span className={`h-px bg-classic-gold ${lineClassName}`} />
      <svg width="12" height="12" viewBox="0 0 12 12" className="fill-classic-gold">
        <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5Z" />
      </svg>
      <span className={`h-px bg-classic-gold ${lineClassName}`} />
    </div>
  );
}

type SealProps = { monogram: Monogram | null };

/** The wax seal with the couple's monogram (decorative; the names are in text). */
export function Seal({ monogram }: SealProps) {
  const isArabic = monogram?.lang === "ar";
  return (
    <div
      aria-hidden="true"
      className="classic-seal-glow flex size-23 items-center justify-center rounded-full border-3 border-classic-gold bg-classic-umber"
    >
      <span
        className={
          isArabic
            ? "font-amiri text-[1.0625rem] leading-tight font-bold text-classic-parchment"
            : "font-script text-[2.5rem] leading-none text-classic-parchment"
        }
      >
        {monogram?.text}
      </span>
    </div>
  );
}

type MonogramProps = { monogram: Monogram | null; className?: string };

/** The monogram alone, in the script font (footer, closing screens). */
export function MonogramMark({ monogram, className = "" }: MonogramProps) {
  if (!monogram) return null;
  const font = monogram.lang === "ar" ? "font-amiri text-[1.375rem]" : "font-script text-[1.875rem]";
  return (
    <p aria-hidden="true" className={`m-0 text-classic-umber ${font} ${className}`}>
      {monogram.text}
    </p>
  );
}
