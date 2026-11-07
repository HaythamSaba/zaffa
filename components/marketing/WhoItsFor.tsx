import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

export function WhoItsFor() {
  return (
    <section aria-label="Who it's for" className="surface-dark bg-indigo py-16 text-paper">
      <Container className="flex justify-center">
        <Reveal>
          <p className="max-w-215 text-center font-display text-h2 leading-[1.3] text-balance">
            Made for families who speak more than one language, so the invitation
            feels just as natural to the grandparents as to the friends.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
