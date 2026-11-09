import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { CurvedEdge } from "@/components/ui/CurvedEdge";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { photos } from "@/lib/photos";

/** Photo band with the mirrored curved top edge; its button leads to the #contact form below. */
export function ClosingCta() {
  return (
    <section
      aria-labelledby="closing-title"
      className="surface-photo relative isolate overflow-hidden bg-espresso text-white"
    >
      <Photo
        photo={photos.closing}
        overlay="strong"
        sizes="100vw"
        className="absolute inset-0 -z-10"
        labelClassName="bottom-5 end-5 nav:end-10"
      />
      <CurvedEdge position="top" />

      <Container className="flex flex-col items-center pt-36 pb-28 nav:pt-47.5 nav:pb-37.5">
        <Reveal className="flex flex-col items-center gap-6 text-center">
          <SectionHeading id="closing-title" size="band" align="center" isOnPhoto>
            Let&rsquo;s invite <b>everyone</b>
          </SectionHeading>
          <p className="max-w-120 text-[0.9375rem] leading-[1.8] text-white/90">
            Tell us your date and your families&rsquo; languages. We reply within a day.
          </p>
          <ButtonLink href="#contact" variant="light" size="lg">
            Request your invitation
          </ButtonLink>
        </Reveal>
      </Container>
    </section>
  );
}
