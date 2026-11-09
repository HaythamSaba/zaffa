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
  { kind: "photo", title: "Every language", photo: photos.languages },
  {
    kind: "rsvp",
    title: "RSVP",
    body: "Name, how many are coming, a note for the kitchen. Done in seconds.",
  },
];

// Phones (<640px): 2 per row, 220px tall. From 640px: auto-fit columns, 300px tall.
const ARCH_CARD = "relative h-55 overflow-hidden rounded-arch sm:h-75";
const CARD_SIZES = "(min-width: 1200px) 280px, (min-width: 900px) 25vw, 50vw";
const CARD_TITLE =
  "font-display text-[0.9375rem] tracking-[0.14em] uppercase sm:text-h3 sm:tracking-[0.18em]";

export function GuestFeatures() {
  return (
    <section id="features" aria-labelledby="features-title" className="pt-5 pb-24 nav:pb-30">
      <Container className="flex flex-col gap-14">
        <Reveal>
          <SectionHeading id="features-title" align="center">
            What your <b>guests receive</b>
          </SectionHeading>
        </Reveal>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] sm:gap-7">
          {cards.map((card, index) =>
            card.kind === "photo" ? (
              <Reveal as="li" key={card.title} index={index} className={ARCH_CARD}>
                <Photo
                  photo={card.photo}
                  overlay="bottom"
                  sizes={CARD_SIZES}
                  className="absolute inset-0"
                  labelClassName="inset-x-2 top-1/3 justify-center text-center"
                />
                <h3 className={`absolute inset-x-2 bottom-4 text-center text-white sm:bottom-5.5 ${CARD_TITLE}`}>
                  {card.title}
                </h3>
              </Reveal>
            ) : (
              <Reveal
                as="li"
                key={card.title}
                index={index}
                className={`${ARCH_CARD} flex flex-col items-center justify-center gap-1.5 border border-stone bg-sand px-3 pt-12 pb-4 text-center sm:gap-3 sm:px-7 sm:pt-15 sm:pb-7`}
              >
                <RsvpIcon className="size-6 text-cocoa sm:size-8.5" />
                <h3 className={CARD_TITLE}>{card.title}</h3>
                <p className="text-[0.75rem] leading-snug text-taupe sm:text-small">{card.body}</p>
              </Reveal>
            ),
          )}
        </ul>
      </Container>
    </section>
  );
}
