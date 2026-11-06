import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const faqs = [
  {
    question: "How long does it take?",
    answer:
      "About one week, starting once we have all your content and your deposit. Need it sooner? Rush delivery in 3 days is available.",
  },
  {
    question: "Which languages can we use?",
    answer:
      "Every package includes your choice of languages: one, or more shown together on the same page. Tell us which you need and we will confirm.",
  },
  {
    question: "Who translates the texts?",
    answer:
      "You can send your own translation, or we prepare one for you. Either way, you approve every word before anything goes live.",
  },
  {
    question: "How do guests RSVP?",
    answer:
      "You share one link. Each household enters their name, how many people are coming and whether they'll attend, with an optional note. After your deadline, the form closes and shows your contact number.",
  },
  {
    question: "How does payment work?",
    answer:
      "50% when we agree on everything, and 50% when your invitation is ready to go live. Two rounds of changes are included.",
  },
  {
    question: "What happens after the wedding?",
    answer:
      "Your invitation stays online for 3 months after the wedding. You get a CSV of your guest list, and guest data is deleted within about 30 days.",
  },
] as const;

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="bg-blush py-20 md:py-26">
      <Container className="flex flex-wrap items-start gap-12 md:gap-14">
        <SectionHeading id="faq-title" eyebrow="FAQ" className="flex-[1_1_18.75rem]">
          Questions couples ask
        </SectionHeading>

        <div className="flex min-w-0 flex-[999_1_32.5rem] flex-col">
          {faqs.map((faq) => (
            <details key={faq.question} className="group border-b border-line py-3">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded-md py-2 text-[1.125rem] font-semibold text-indigo [&::-webkit-details-marker]:hidden hover:text-coral-deep">
                {faq.question}
                <span
                  aria-hidden="true"
                  className="text-2xl leading-none text-coral-deep motion-safe:transition-transform motion-safe:duration-200 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="pt-2 pb-3 text-dusk">{faq.answer}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
