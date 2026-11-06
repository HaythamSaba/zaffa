import { About } from "@/components/marketing/About";
import { Contact } from "@/components/marketing/Contact";
import { DemoCta } from "@/components/marketing/DemoCta";
import { Faq } from "@/components/marketing/Faq";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Packages } from "@/components/marketing/Packages";
import { WhatWeDo } from "@/components/marketing/WhatWeDo";
import { WhoItsFor } from "@/components/marketing/WhoItsFor";

export default function HomePage() {
  return (
    <>
      <Hero />
      <WhoItsFor />
      <WhatWeDo />
      <HowItWorks />
      <Packages />
      <DemoCta />
      <About />
      <Faq />
      <Contact />
    </>
  );
}
