import { Container } from "@/components/ui/Container";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { photos } from "@/lib/photos";

const faqs = [
  {
    question: "How long does it take?",
    answer:
      "About one week once we have your content and deposit. Rush delivery in 3 days is available.",
  },
  {
    question: "Which languages can we use?",
    answer:
      "One language, or more shown together on the same page. Tell us which you need and we will confirm.",
  },
  {
    question: "Who translates the texts?",
    answer:
      "Send us your own translation, or let us prepare one. Either way, you approve every word before anything goes live.",
  },
  {
    question: "How do guests RSVP?",
    answer:
      "You share one link. Each household enters their name, how many are coming and whether they'll attend.",
  },
  {
    question: "How does payment work?",
    answer:
      "50% when we agree on everything, and 50% when your invitation is ready to go live. Two rounds of changes are included.",
  },
  {
    question: "What happens after the wedding?",
    answer:
      "Your invitation stays online for 3 months. You get a CSV of your guest list, and guest data is deleted within about 30 days.",
  },
] as const;

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="pt-5 pb-24 nav:pb-32">
      <Container className="grid items-start gap-12 nav:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] nav:gap-16">
        {/* Framed photo, desktop only. */}
        <Reveal className="hidden bg-white p-2.5 shadow-frame nav:block">
          <Photo
            photo={photos.faqTable}
            sizes="(min-width: 900px) 40vw, 1px"
            className="relative h-110"
          />
        </Reveal>

        <Reveal index={1} className="flex min-w-0 flex-col gap-6">
          <SectionHeading id="faq-title">
            Frequently asked <b>questions</b>
          </SectionHeading>
          <div className="flex flex-col">
            {faqs.map((faq) => (
              <details key={faq.question} className="group border-b border-linen py-3">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-1.5 text-small font-semibold text-cocoa hover:text-taupe [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <span
                    aria-hidden="true"
                    className="text-lg leading-none text-taupe motion-safe:transition-transform motion-safe:duration-200 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="pt-2 pb-2 text-small leading-[1.8] text-taupe">{faq.answer}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
