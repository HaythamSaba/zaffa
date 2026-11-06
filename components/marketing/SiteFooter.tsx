import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { footerNav, siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="surface-dark bg-indigo pt-14 pb-10 text-paper-muted">
      <Container className="flex flex-col gap-9">
        <div className="flex flex-wrap justify-between gap-8">
          <div className="flex max-w-90 flex-col gap-3">
            <span className="text-[2rem] text-paper">
              <Logo hasDot />
            </span>
            <p className="text-small leading-relaxed">
              Multilingual digital wedding invitations with RSVP and guest
              management. Made in Ljubljana for couples across Europe.
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-10 gap-y-1 text-small">
              {footerNav.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-11 items-center rounded-sm underline-offset-4 hover:text-paper hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-wrap justify-between gap-3 border-t border-paper/20 pt-6 text-sm">
          <span>
            © {siteConfig.copyrightYear} Zaffa · {siteConfig.legalName}
          </span>
          <span>{siteConfig.location}</span>
        </div>
      </Container>
    </footer>
  );
}
