import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { CurvedEdge } from "@/components/ui/CurvedEdge";
import { Photo } from "@/components/ui/Photo";
import { photos } from "@/lib/photos";

/** Full-bleed photo with the Espresso overlay and a curved bottom edge. Never animated (LCP). */
export function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="surface-photo relative isolate overflow-hidden bg-espresso text-white"
    >
      <Photo
        photo={photos.hero}
        priority
        sizes="100vw"
        overlay
        className="absolute inset-0 -z-10"
        labelClassName="top-24 end-5 nav:top-30 nav:end-10"
      />

      <Container className="flex min-h-152 flex-col items-center justify-center gap-5.5 pt-34 pb-36 text-center nav:min-h-190 nav:pt-40 nav:pb-52">
        <h1 id="hero-title" className="caps max-w-245 text-display text-balance">
          Invitations that bring <b>every family</b> to the celebration
        </h1>
        <p className="max-w-130 text-white/90">
          Elegant wedding invitation websites, in the languages your families
          speak, with RSVP built in.
        </p>
        <ButtonLink href="#contact" variant="light" size="lg">
          Request your invitation
        </ButtonLink>
      </Container>

      <CurvedEdge position="bottom" />
    </section>
  );
}
