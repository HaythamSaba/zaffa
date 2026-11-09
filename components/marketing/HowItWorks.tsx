import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const steps = [
  { title: "Consultation", body: "Pick a package and pay a 50% deposit." },
  { title: "Your story", body: "A short form, your photos, your words." },
  { title: "Translation", body: "Nothing goes live until you approve every word." },
  { title: "Preview", body: "A private link and two rounds of changes." },
  { title: "Celebration", body: "Your own address, ready for WhatsApp." },
] as const;

function StepDot({ isLast }: { isLast: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex size-4.75 items-center justify-center rounded-full border border-taupe ${isLast ? "bg-taupe" : "bg-sand"}`}
    >
      <span className={`size-1.75 rounded-full ${isLast ? "bg-ivory" : "bg-taupe"}`} />
    </span>
  );
}

export function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-title" className="bg-sand py-24 nav:py-30">
      <Container className="flex flex-col gap-14 nav:gap-17.5">
        <Reveal className="flex flex-col items-center gap-3.5">
          <SectionHeading id="how-title" align="center">
            From hello to <b>&ldquo;we&rsquo;re invited&rdquo;</b>
          </SectionHeading>
          <p className="font-display text-xl text-taupe italic">in about one week</p>
        </Reveal>

        <div className="relative">
          <div aria-hidden="true" className="absolute inset-x-[10%] top-2.25 hidden h-px bg-stone nav:block" />
          <ol className="relative grid gap-10 nav:grid-cols-5 nav:gap-8">
            {steps.map((step, index) => (
              <Reveal
                as="li"
                key={step.title}
                index={index}
                className="flex flex-col items-center gap-3.5 text-center"
              >
                <StepDot isLast={index === steps.length - 1} />
                <h3 className="caps text-xl">
                  <b>{step.title}</b>
                </h3>
                <p className="max-w-60 text-small leading-[1.7] text-taupe">{step.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
