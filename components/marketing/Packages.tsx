import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatEuro } from "@/lib/format";
import { addOns, packages, type Package } from "@/lib/site-config";
import { Blossom, SmallSprig, Sprig } from "./botanicals";

const icons = { "small-sprig": SmallSprig, sprig: Sprig, blossom: Blossom } as const;

function PackageCard({ pkg, index }: { pkg: Package; index: number }) {
  const isFeatured = pkg.featured === true;
  const Icon = icons[pkg.icon];
  // Premium: Ivory/Sand on Taupe (6.07 / 5.30:1). Others: Cocoa/Taupe on Ivory.
  const surface = isFeatured
    ? "surface-photo bg-taupe text-ivory"
    : "border border-linen text-cocoa";
  const muted = isFeatured ? "text-sand" : "text-taupe";

  return (
    <Reveal
      as="li"
      index={index}
      className={`relative flex flex-col items-center gap-4 rounded-arch px-8.5 pt-22.5 pb-8.5 text-center ${surface}`}
    >
      {pkg.badge && (
        <span className="label absolute top-11 text-[0.625rem] text-sand">{pkg.badge}</span>
      )}
      <Icon className={`size-10 ${muted}`} />
      <h3 className="caps text-[1.625rem]">
        <b>{pkg.name}</b>
      </h3>
      <p className="font-display text-price font-medium">
        {pkg.priceFrom && (
          <span className="me-1 align-middle font-sans text-[0.8125rem] tracking-[0.1em] text-mocha uppercase">
            from
          </span>
        )}
        {formatEuro(pkg.priceEur)}
      </p>
      <ul className={`text-small leading-loose ${muted}`}>
        {pkg.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      <ButtonLink
        href="#contact"
        variant={isFeatured ? "light" : "outline"}
        className="mt-auto w-full"
      >
        {pkg.cta}
      </ButtonLink>
    </Reveal>
  );
}

export function Packages() {
  const addOnLine = addOns.map((addOn) => `${addOn.name} ${addOn.price}`).join(" · ");

  return (
    <section id="packages" aria-labelledby="packages-title" className="py-24 nav:py-32">
      <Container className="flex flex-col gap-15">
        <Reveal className="flex flex-col items-center gap-3.5">
          <SectionHeading id="packages-title" align="center">
            Our <b>packages</b>
          </SectionHeading>
          <p className="text-center text-small text-mocha">
            Your choice of languages is included in every package.
          </p>
        </Reveal>

        <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] items-stretch gap-7">
          {packages.map((pkg, index) => (
            <PackageCard key={pkg.id} pkg={pkg} index={index} />
          ))}
        </ul>

        <Reveal>
          <p className="text-center text-[0.8125rem] leading-[1.8] text-mocha">
            Add-ons · {addOnLine}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
