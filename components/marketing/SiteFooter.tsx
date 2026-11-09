import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { footerNav, siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="py-14">
      <Container className="flex flex-col items-center gap-4.5 text-center">
        <Logo hasMark={false} className="text-cocoa" />
        <nav aria-label="Footer">
          <ul className="flex flex-wrap justify-center gap-x-7">
            {footerNav.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="label inline-flex min-h-11 items-center tracking-[0.14em] text-taupe hover:text-cocoa"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="text-xs text-mocha">
          © {siteConfig.copyrightYear} Zaffa · Made in Ljubljana for couples across Europe
        </p>
      </Container>
    </footer>
  );
}
