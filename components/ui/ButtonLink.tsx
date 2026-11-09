import type { ReactNode } from "react";
import Link from "next/link";

export type ButtonVariant = "primary" | "light" | "outline";
export type ButtonSize = "md" | "lg";

type Props = {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

// Square corners, uppercase Montserrat 600 12px +0.18em, at least 48px tall (docs/brand.md).
const base =
  "label inline-flex items-center justify-center text-center " +
  "motion-safe:transition-colors motion-safe:duration-200";

const variants: Record<ButtonVariant, string> = {
  // White on Taupe 6.48:1; hover White on Cocoa 10.76:1.
  primary: "bg-taupe text-white hover:bg-cocoa",
  // On photos and Taupe surfaces: Cocoa on White, hovering to Sand.
  light: "bg-white text-cocoa hover:bg-sand",
  outline: "border border-taupe text-cocoa hover:bg-taupe hover:text-white",
};

const sizes: Record<ButtonSize, string> = {
  md: "min-h-12 px-7.5",
  lg: "min-h-12.5 px-8.5",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
}: Props) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </Link>
  );
}
