import type { Metadata } from "next";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { marketingFontClassName } from "@/lib/marketing-fonts";
import { siteConfig } from "@/lib/site-config";
import { getSiteUrl } from "@/lib/site-url";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: { default: siteConfig.title, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    url: "/",
    locale: "en",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
};

/**
 * Root layout of the marketing site. Invitations (app/sites/) have their own
 * root layouts, so the marketing fonts and styles never load there.
 * Each page renders its own <SiteHeader> and <main id="main">: the home page
 * overlays the header on the hero photo, the legal pages use the solid header.
 */
export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${marketingFontClassName} antialiased`}>
      <body className="min-h-dvh">
        <div className="overflow-x-clip">
          {/* Without JavaScript, show revealed content immediately. */}
          <noscript>
            <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
          </noscript>
          <a
            href="#main"
            className="label sr-only z-30 bg-cocoa px-5 py-3 text-white focus:not-sr-only focus:fixed focus:top-3 focus:start-3"
          >
            Skip to content
          </a>
          {children}
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
