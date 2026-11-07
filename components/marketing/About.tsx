import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig } from "@/lib/site-config";

export function About() {
  const { founder } = siteConfig;

  return (
    <section id="about" aria-labelledby="about-title" className="py-20 md:py-26">
      <Container className="flex flex-wrap items-start gap-12 md:gap-14">
        <Reveal className="flex-[1_1_20rem]">
          <SectionHeading id="about-title" eyebrow="About us">
            A small studio that cares about every language
          </SectionHeading>
        </Reveal>

        <Reveal
          index={1}
          className="flex min-w-0 flex-[999_1_30rem] flex-col gap-5 text-[1.125rem] leading-[1.7] text-indigo"
        >
          <p>
            We make digital invitations for couples whose families span
            languages and countries, so every guest feels the invitation was
            written for them.
          </p>
          <p>
            Most invitations are made in one language, and any others are
            squeezed in later. We design for every language from the start.
            Each wedding is built by hand on our own tested templates, so it
            feels personal and arrives on time.
          </p>

          <div className="mt-2 flex items-center gap-4">
            <div
              aria-hidden="true"
              className="flex size-14 shrink-0 items-center justify-center rounded-full bg-line font-display text-2xl font-bold text-indigo"
            >
              {founder.initials}
            </div>
            <div className="flex flex-col leading-snug">
              <span className="text-base font-bold">{founder.name}</span>
              <span className="text-small text-dusk">{founder.role}</span>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
