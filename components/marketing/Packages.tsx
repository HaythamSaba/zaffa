import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatEuro } from "@/lib/format";
import { addOns, packages, type Package } from "@/lib/site-config";

function PackageCard({ pkg, index }: { pkg: Package; index: number }) {
  const isFeatured = pkg.featured === true;
  const surface = isFeatured
    ? "surface-dark bg-indigo text-paper shadow-phone"
    : "border border-line bg-blush text-indigo";
  const muted = isFeatured ? "text-paper-muted" : "text-dusk";

  return (
    <Reveal
      as="li"
      index={index}
      className={`flex flex-col gap-5 rounded-panel p-8 md:p-9 ${surface}`}
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-h4 font-bold">{pkg.name}</h3>
          {pkg.badge && (
            <span className="rounded-full bg-saffron px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-indigo">
              {pkg.badge}
            </span>
          )}
        </div>
        <p className={`text-small ${muted}`}>{pkg.tagline}</p>
      </div>

      <p className="font-display text-price font-semibold">
        {pkg.priceFrom && (
          <span className={`font-sans text-[1.125rem] font-medium ${muted}`}>
            from{" "}
          </span>
        )}
        {formatEuro(pkg.priceEur)}
      </p>

      <ul className="flex list-disc flex-col gap-2.5 ps-5 text-small marker:text-current">
        {pkg.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>

      <ButtonLink
        href="#contact"
        size="md"
        variant={isFeatured ? "saffron" : "outline"}
        className="mt-auto w-full text-base"
      >
        {pkg.cta}
      </ButtonLink>
    </Reveal>
  );
}

export function Packages() {
  return (
    <section id="packages" aria-labelledby="packages-title" className="py-20 md:py-26">
      <Container className="flex flex-col gap-12 md:gap-14">
        <Reveal>
          <SectionHeading id="packages-title" eyebrow="Packages">
            Clear prices, language choice always included
          </SectionHeading>
        </Reveal>

        <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,18.75rem),1fr))] items-stretch gap-6">
          {packages.map((pkg, index) => (
            <PackageCard key={pkg.id} pkg={pkg} index={index} />
          ))}
        </ul>

        <Reveal className="flex flex-wrap items-center gap-x-10 gap-y-4 rounded-card border border-dashed border-dusk px-7 py-7 md:px-8">
          <h3 className="text-body font-bold text-indigo">Add-ons</h3>
          <ul className="flex flex-wrap gap-x-8 gap-y-2.5 text-small text-indigo">
            {addOns.map((addOn) => (
              <li key={addOn.name}>
                {addOn.name} · {addOn.price}
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
