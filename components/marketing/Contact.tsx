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

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="py-20 md:py-26">
      <Container className="grid items-start gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <Reveal className="flex flex-col gap-5.5">
          <SectionHeading id="contact-title" eyebrow="Contact">
            Tell us about your wedding
          </SectionHeading>
          <p className="text-dusk">
            Send us a few details and we&rsquo;ll reply within a day with
            availability and next steps. Prefer to chat? Message us directly.
          </p>
          <ul className="flex flex-col gap-3">
            {channels.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  className="inline-flex min-h-11 items-center gap-3 rounded-md font-semibold text-indigo hover:text-coral-deep"
                >
                  <Icon className="size-5.5 text-coral-deep" />
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
