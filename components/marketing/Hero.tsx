import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { siteConfig } from "@/lib/site-config";
import { PhoneMockup } from "./PhoneMockup";

export function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="pt-14 pb-16 md:pt-22 md:pb-24"
    >
      <Container className="flex flex-wrap items-center gap-12 md:gap-16">
        <div className="flex min-w-0 flex-[999_1_32.5rem] flex-col gap-7">
          <Eyebrow>Digital wedding invitations · RSVP · Guest list</Eyebrow>

          <h1
            id="hero-title"
            className="font-display text-display font-light text-indigo text-balance"
          >
            Wedding invitations in{" "}
            <em className="font-light bg-saffron px-2 italic">every</em> language your
            families speak.
          </h1>

          <p className="max-w-140 text-body-lg text-dusk">
            An elegant invitation website your guests open from one link,
            anywhere in the world. They read your story, find the venue and
            RSVP in seconds. You follow every reply from a private dashboard.
          </p>

          <div className="flex flex-wrap gap-3.5">
            <ButtonLink href="#contact">Request your invitation</ButtonLink>
            <ButtonLink href={siteConfig.demoUrl} variant="outline">
              See a sample wedding
            </ButtonLink>
          </div>

          <p className="text-sm text-dusk">
            For couples marrying in Europe · One language or several,
            beautifully together
          </p>
        </div>

        <div className="flex flex-[1_1_20rem] justify-center">
          <PhoneMockup />
        </div>
      </Container>
    </section>
  );
}
