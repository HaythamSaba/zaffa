import type { ReactNode } from "react";
import { defaultTemplate } from "@/templates";
import "../../sites/invitation.css";

/**
 * Root layout of /invitation-unavailable, which proxy.ts shows (as a rewrite)
 * when the invitation for a custom domain can't be looked up. Styled like the
 * invitations, with the default template's fonts.
 */
export default function UnavailableLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${defaultTemplate().fontClassName} antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
