import { SiteFooter } from "@/components/marketing/SiteFooter";

/**
 * Each page renders its own <SiteHeader> and <main id="main">: the home page
 * overlays the header on the hero photo, the legal pages use the solid header.
 */
export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
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
  );
}
