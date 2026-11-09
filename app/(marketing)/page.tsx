import { ClosingCta } from "@/components/marketing/ClosingCta";
import { Contact } from "@/components/marketing/Contact";
import { DashboardPreview } from "@/components/marketing/DashboardPreview";
import { Faq } from "@/components/marketing/Faq";
import { GuestFeatures } from "@/components/marketing/GuestFeatures";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { IntroStatement } from "@/components/marketing/IntroStatement";
import { Packages } from "@/components/marketing/Packages";
import { SampleInvitation } from "@/components/marketing/SampleInvitation";
import { SiteHeader } from "@/components/marketing/SiteHeader";

// Section order: CLAUDE.md "Phase 1 > Sections, in order".
export default function HomePage() {
  return (
    <div className="relative">
      <SiteHeader variant="overlay" />
      <main id="main">
        <Hero />
        <IntroStatement />
        <GuestFeatures />
        <SampleInvitation />
        <DashboardPreview />
        <HowItWorks />
        <Packages />
        <Faq />
        <ClosingCta />
        <Contact />
      </main>
    </div>
  );
}
