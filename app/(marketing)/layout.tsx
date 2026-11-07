import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="overflow-x-clip">
      {/* Without JavaScript, show revealed content immediately. */}
      <noscript>
        <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
      </noscript>
      <a
        href="#main"
        className="sr-only z-30 rounded-full bg-indigo px-5 py-3 font-semibold text-paper focus:not-sr-only focus:fixed focus:top-3 focus:start-3"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
    </div>
  );
}
