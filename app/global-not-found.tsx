import type { Metadata } from "next";
import { Logo } from "@/components/brand/Logo";
import { marketingFontClassName } from "@/lib/marketing-fonts";
import "./globals.css";

// With two root layouts (marketing and invitations) there is no single layout
// to build a 404 from, so unmatched URLs render this page (next.config.ts:
// experimental.globalNotFound). Unknown hosts and slugs end up here too.
export const metadata: Metadata = {
  title: "Page not found · Zaffa",
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${marketingFontClassName} antialiased`}>
      <body className="min-h-dvh bg-ivory text-cocoa">
        <main className="mx-auto flex min-h-dvh max-w-120 flex-col items-center justify-center gap-6 px-6 text-center">
          <Logo />
          <h1 className="font-display text-h2 font-normal tracking-[0.06em] uppercase">
            Page not <b>found</b>
          </h1>
          <p className="text-[0.9375rem] leading-[1.8] text-taupe">
            This address doesn&apos;t lead to an invitation or a page. Please check the link you
            were sent.
          </p>
        </main>
      </body>
    </html>
  );
}
