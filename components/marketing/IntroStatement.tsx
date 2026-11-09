import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { siteConfig } from "@/lib/site-config";
import { Sprig } from "./botanicals";

export function IntroStatement() {
  const { founder } = siteConfig;

  return (
    <section id="about" aria-labelledby="about-title" className="pt-2 pb-22 nav:pb-28">
      <Container className="flex flex-col items-center gap-9 text-center">
        <Reveal className="flex flex-col items-center gap-9">
          <Sprig className="size-16 text-taupe" />
          <span aria-hidden="true" className="h-22.5 w-px bg-stone" />
        </Reveal>

        <Reveal>
          <h2 id="about-title" className="caps max-w-225 text-statement text-balance">
            One link. Every guest. <b>Every language</b> together on the same
            page, made with <b>care</b> for your celebration.
          </h2>
        </Reveal>

        <Reveal className="grid max-w-240 gap-10 text-start text-[0.9375rem] leading-[1.85] text-taupe nav:grid-cols-2">
          <p>
            When families speak more than one language, the invitation is often
            made in one and the rest are squeezed in later. We design for every
            language from the very first line, so the grandparents and the
            friends read the same invitation, each in their own words.
          </p>
          <p>
            Each invitation is built by hand on our tested templates. You share
            your story, your date and your photos; we turn them into an
            invitation your guests open from one link, anywhere in the world,
            and answer in seconds.
          </p>
        </Reveal>

        <Reveal className="flex flex-col items-center gap-0.5">
          <span className="text-[0.8125rem] text-taupe">With love,</span>
          <span className="font-display text-[2.125rem] leading-tight italic">
            {founder.signature}
          </span>
          <span className="text-xs tracking-[0.12em] text-mocha uppercase">{founder.role}</span>
        </Reveal>
      </Container>
    </section>
  );
}
