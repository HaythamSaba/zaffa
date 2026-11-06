import type { ComponentType } from "react";
import { Container } from "@/components/ui/Container";
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
      <Container className="flex flex-wrap items-start gap-12 md:gap-14">
        <div className="flex flex-[1_1_21.25rem] flex-col gap-5.5">
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
        </div>

        <ContactForm />
      </Container>
    </section>
  );
}
