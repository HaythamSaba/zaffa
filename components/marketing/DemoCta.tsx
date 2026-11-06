import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/site-config";

export function DemoCta() {
  return (
    <section
      id="demo"
      aria-labelledby="demo-title"
      className="surface-dark bg-indigo py-20 text-paper md:py-24"
    >
      <Container className="flex flex-wrap items-center justify-between gap-8">
        <div className="flex flex-[1_1_32.5rem] flex-col gap-2.5">
          <h2
            id="demo-title"
            className="font-display text-h1 font-semibold text-balance"
          >
            Open a sample wedding on your phone
          </h2>
          <p className="max-w-140 text-paper-muted">
            Click through a complete invitation for a fictional couple, in two
            languages, exactly as your guests would see it.
          </p>
        </div>
        <ButtonLink href={siteConfig.demoUrl} variant="saffron">
          View the sample invitation
        </ButtonLink>
      </Container>
    </section>
  );
}
