import { defaultTemplate } from "@/templates";
import "../invitation.css";

/**
 * Root layout of /sites/_unavailable (the folder name %5F is an escaped "_"),
 * which proxy.ts shows when a custom domain can't be looked up.
 */
export default function UnavailableLayout({ children }: LayoutProps<"/sites/_unavailable">) {
  return (
    <html lang="en" className={`${defaultTemplate().fontClassName} antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
