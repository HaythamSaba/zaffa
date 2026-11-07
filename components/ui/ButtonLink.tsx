import type { ReactNode } from "react";
import Link from "next/link";

export type ButtonVariant = "coral" | "outline" | "saffron";
export type ButtonSize = "md" | "lg";

type Props = {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

const base =
  "inline-flex items-center justify-center rounded-full font-semibold text-center " +
  "motion-safe:transition-[background-color,color,transform] motion-safe:duration-200 " +
  "active:translate-y-px";

const variants: Record<ButtonVariant, string> = {
  coral: "bg-coral text-white hover:bg-coral-deep",
  // Coral Deep text passes on both Paper (6.57:1) and Blush (5.59:1).
  outline:
    "border-[1.5px] border-coral-deep text-coral-deep hover:bg-coral-deep hover:text-white",
  // Saffron buttons are only used on Indigo surfaces.
  saffron: "bg-saffron font-bold text-indigo hover:bg-paper",
};

const sizes: Record<ButtonSize, string> = {
  md: "min-h-12 px-6 text-small",
  lg: "min-h-13 px-7 text-base",
};

export function ButtonLink({
  href,
  children,
  variant = "coral",
  size = "lg",
  className = "",
}: Props) {
  return (
    <Link
      href={href}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </Link>
  );
}
