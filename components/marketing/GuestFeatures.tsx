import { Container } from "@/components/ui/Container";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { photos, type PhotoAsset } from "@/lib/photos";
import { RsvpIcon } from "./icons";

type Card =
  | { kind: "photo"; title: string; photo: PhotoAsset }
  | { kind: "rsvp"; title: string; body: string };

const cards: readonly Card[] = [
  { kind: "photo", title: "Your story", photo: photos.story },
  { kind: "photo", title: "Countdown", photo: photos.countdown },
  { kind: "photo", title: "Venue & map", photo: photos.venue },
  { kind: "photo", title: "Gallery", photo: photos.gallery },
  {
    kind: "rsvp",
    title: "RSVP",
    body: "Name, how many are coming, a note for the kitchen. Done in seconds.",
  },
  { kind: "photo", title: "Every language", photo: photos.languages },
];

const ARCH_CARD = "relative h-75 overflow-hidden rounded-arch";
const CARD_SIZES = "(min-width: 1200px) 280px, (min-width: 900px) 25vw, (min-width: 520px) 50vw, 100vw";

export function GuestFeatures() {
  return (
    <section id="features" aria-labelledby="features-title" className="pt-5 pb-24 nav:pb-30">
      <Container className="flex flex-col gap-14">
        <Reveal>
          <SectionHeading id="features-title" align="center">
            What your <b>guests receive</b>
          </SectionHeading>
        </Reveal>

        <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,15rem),1fr))] gap-7">
          {cards.map((card, index) =>
            card.kind === "photo" ? (
              <Reveal as="li" key={card.title} index={index} className={ARCH_CARD}>
                <Photo
                  photo={card.photo}
                  overlay
                  sizes={CARD_SIZES}
                  className="absolute inset-0"
                  labelClassName="inset-x-0 top-1/3 justify-center"
                />
                <h3 className="absolute inset-x-0 bottom-5.5 text-center font-display text-h3 tracking-[0.18em] text-white uppercase">
                  {card.title}
                </h3>
              </Reveal>
            ) : (
              <Reveal
                as="li"
                key={card.title}
                index={index}
                className={`${ARCH_CARD} flex flex-col items-center justify-center gap-3 border border-stone bg-sand px-7 pt-15 pb-7 text-center`}
              >
                <RsvpIcon className="size-8.5 text-cocoa" />
                <h3 className="font-display text-h3 tracking-[0.18em] uppercase">{card.title}</h3>
                <p className="text-small text-taupe">{card.body}</p>
              </Reveal>
            ),
          )}
        </ul>
      </Container>
    </section>
  );
}
