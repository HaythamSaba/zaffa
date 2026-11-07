import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { mainNav } from "@/lib/site-config";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur-sm">
      <Container className="flex h-header items-center justify-between gap-6">
        <Link
          href="/#top"
          aria-label="Zaffa home"
          className="inline-flex min-h-11 items-center rounded-md text-coral text-[1.75rem] sm:text-[2.125rem]"
        >
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex gap-8">
            {mainNav.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center rounded-sm text-small font-medium text-indigo underline-offset-6 hover:text-coral-deep hover:underline decoration-saffron decoration-2"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <ButtonLink href="/#contact" size="md" className="shrink-0 px-5.5">
          <span className="sm:hidden">Request</span>
          <span className="hidden sm:inline">Request your invitation</span>
        </ButtonLink>
      </Container>
    </header>
  );
}
