import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const steps = [
  {
    title: "Choose your package",
    body: "Tell us about your wedding. We agree on the package, extras and price, and you pay a 50% deposit.",
  },
  {
    title: "Share your details",
    body: "Fill in a short form with your names, date, venue and story, and upload your photos.",
  },
  {
    title: "Approve the translation",
    body: "Send your own translation or let us prepare one. Nothing goes live until you approve every word.",
  },
  {
    title: "Preview and refine",
    body: "Watch your invitation take shape on a private preview link. Two rounds of changes are included.",
  },
  {
    title: "Share with your guests",
    body: "Pay the remaining 50%, and your invitation goes live at its own address, ready for WhatsApp.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-title" className="bg-blush py-20 md:py-26">
      <Container className="flex flex-col gap-12 md:gap-14">
        <SectionHeading id="how-title" eyebrow="How it works">
          From first message to live invitation in about a week
        </SectionHeading>

        <ol className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,13.125rem),1fr))] gap-5 lg:grid-cols-5">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="flex flex-col gap-2.5 border-t-2 border-indigo pt-5"
            >
              <span
                aria-hidden="true"
                className="font-display text-[2.5rem] leading-none font-semibold text-coral-deep"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-[1.125rem] leading-snug font-bold text-indigo">
                {step.title}
              </h3>
              <p className="text-small leading-relaxed text-dusk">{step.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
