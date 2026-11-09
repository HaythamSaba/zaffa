import type { ComponentType } from "react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig, type ContactChannel } from "@/lib/site-config";
import { ContactForm } from "./ContactForm";
import { ChatIcon, InstagramIcon, MailIcon } from "./icons";

type Channel = ContactChannel & { Icon: ComponentType<{ className?: string }> };

const channels: readonly Channel[] = [
  { ...siteConfig.contact.email, Icon: MailIcon },
  { ...siteConfig.contact.whatsapp, Icon: ChatIcon },
  { ...siteConfig.contact.instagram, Icon: InstagramIcon },
];

/** The inquiry form: the target of every "Request your invitation" button. */
export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="py-24 nav:py-32">
      <Container className="grid items-start gap-12 nav:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] nav:gap-16">
        <Reveal className="flex flex-col gap-5.5">
          <SectionHeading id="contact-title" eyebrow="Contact">
            Tell us about <b>your wedding</b>
          </SectionHeading>
          <p className="text-[0.9375rem] leading-[1.85] text-taupe">
            Send us a few details and we&rsquo;ll reply within a day with
            availability and next steps. Prefer to chat? Message us directly.
          </p>
          <ul className="flex flex-col gap-2">
            {channels.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  className="inline-flex min-h-11 items-center gap-3 text-small font-semibold text-cocoa hover:text-taupe"
                >
                  <Icon className="size-5.5 text-taupe" />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal index={1} className="min-w-0">
          <ContactForm />
        </Reveal>
      </Container>
    </section>
  );
}
