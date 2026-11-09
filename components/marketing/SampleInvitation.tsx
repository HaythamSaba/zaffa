import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig } from "@/lib/site-config";
import { PhoneMockup } from "./PhoneMockup";

export function SampleInvitation() {
  return (
    <section id="demo" aria-labelledby="demo-title" className="bg-sand py-22 nav:py-30">
      <Container className="grid items-center gap-14 nav:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] nav:gap-18">
        <Reveal className="flex justify-center">
          <PhoneMockup />
        </Reveal>

        <Reveal index={1} className="flex flex-col items-start gap-5.5">
          <SectionHeading id="demo-title" eyebrow="A sample invitation">
            See what your <b>guests</b> will open
          </SectionHeading>
          <p className="max-w-125 text-[0.9375rem] leading-[1.85] text-taupe">
            Your names, your story and your date with a live countdown. Venue and
            directions one tap away. In Premium, a schedule of the day, a
            gallery, music and an opening animation.
          </p>
          <ButtonLink href={siteConfig.demoUrl} className="mt-1.5">
            Open the sample
          </ButtonLink>
        </Reveal>
      </Container>
    </section>
  );
}
