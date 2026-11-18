import type { InvitationData } from "@/lib/events/build-invitation";
import { message } from "@/lib/i18n/messages";
import { Bi } from "../Bi";
import { telHref } from "../localize";
import { SectionHeading } from "../SectionHeading";

type Props = { invitation: InvitationData };

/** "Our story": the couple's own words. */
export function Story({ invitation }: Props) {
  const { languages, texts } = invitation;
  const title = message("story.title");
  return (
    <section aria-labelledby="story-title" className="flex flex-col items-center gap-4.5 px-7 py-13 text-center">
      <SectionHeading id="story-title" text={title} languages={languages} />
      <Bi text={texts.story} languages={languages} className="m-0" en="text-lg leading-[1.6]" ar="text-[1.0625rem] leading-[1.9]" />
    </section>
  );
}

/** Dress code (Premium). */
export function DressCode({ invitation }: Props) {
  const { languages, texts } = invitation;
  const title = message("dressCode.title");
  return (
    <section aria-labelledby="dress-code-title" className="flex flex-col items-center gap-3 bg-classic-cream px-7 py-11 text-center">
      <SectionHeading id="dress-code-title" text={title} languages={languages} />
      <div className="flex flex-col gap-0.5">
        <Bi text={texts.dress_code} languages={languages} className="m-0" en="text-lg" ar="text-base" />
      </div>
    </section>
  );
}

/** "Questions?": who to call, with the couple's number. */
export function Contact({ invitation }: Props) {
  const { languages, texts } = invitation;
  const title = message("contact.title");
  const name = texts["contact.name"];
  return (
    <section aria-labelledby="contact-title" className="flex flex-col items-center gap-2.5 px-7 py-11 text-center">
      <SectionHeading id="contact-title" text={title} languages={languages} size="sm" />
      {name && (
        <div className="flex flex-col gap-0.5">
          <Bi text={message("contact.message", { name })} languages={languages} className="m-0" en="text-[1.0625rem]" ar="text-base" />
        </div>
      )}
      <a
        href={telHref(invitation.contactPhone)}
        dir="ltr"
        className="inline-flex min-h-11 items-center font-bodoni text-lg tracking-[0.06em] text-classic-umber hover:text-classic-ink"
      >
        {invitation.contactPhone}
      </a>
    </section>
  );
}
