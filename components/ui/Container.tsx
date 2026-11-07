import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

/** Max 1200px content width; 20px side padding on phones, 40px from md up. */
export function Container({ children, className = "" }: Props) {
  return (
    <div className={`mx-auto w-full max-w-300 px-5 md:px-10 ${className}`}>
      {children}
    </div>
  );
}
