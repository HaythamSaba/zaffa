import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { headerNav, type NavLink } from "@/lib/site-config";

type Props = {
  /** "overlay": white, over the hero photo. "solid": Cocoa on Ivory (legal pages). */
  variant?: "overlay" | "solid";
};

const variantClass = {
  overlay: "surface-photo absolute inset-x-0 top-0 z-20 text-white",
  solid: "relative border-b border-linen bg-ivory text-cocoa",
} as const;

const linkHover = {
  overlay: "hover:text-sand",
  solid: "hover:text-taupe",
} as const;

function NavItems({ links, hover }: { links: readonly NavLink[]; hover: string }) {
  return (
    <>
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className={`label inline-flex min-h-11 items-center tracking-[0.16em] ${hover}`}
          >
            {link.label}
          </Link>
        </li>
      ))}
    </>
  );
}

/** Nav split around the centred logo; below 900px only the logo and a "Contact" link. */
export function SiteHeader({ variant = "overlay" }: Props) {
  const hover = linkHover[variant];

  return (
    <header className={variantClass[variant]}>
      <Container>
        <nav aria-label="Main" className="grid h-22 grid-cols-[1fr_auto_1fr] items-center gap-6 nav:h-26">
          <ul className="hidden gap-10 nav:flex">
            <NavItems links={headerNav.start} hover={hover} />
          </ul>

          <Link
            href="/#top"
            aria-label="Zaffa home"
            className="col-start-2 inline-flex min-h-11 items-center"
          >
            <Logo />
          </Link>

          <ul className="col-start-3 hidden justify-end gap-10 nav:flex">
            <NavItems links={headerNav.end} hover={hover} />
          </ul>

          <Link
            href="/#contact"
            className={`label col-start-3 inline-flex min-h-11 items-center justify-self-end tracking-[0.16em] nav:hidden ${hover}`}
          >
            Contact
          </Link>
        </nav>
      </Container>
    </header>
  );
}
