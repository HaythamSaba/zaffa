import type { InvitationData } from "@/lib/events/build-invitation";
import { buildIcs, icsDataUrl } from "@/lib/events/calendar";
import type { Monogram } from "@/lib/events/monogram";
import { pickLanguages, type LocalizedText } from "@/lib/i18n/bilingual";
import { formatDate } from "@/lib/i18n/format";
import { message } from "@/lib/i18n/messages";
import { Bi } from "../Bi";
import { formatContextOf, localize, primaryLang, telHref } from "../localize";
import type { CalendarLink, RsvpCopy } from "../rsvp/copy";
import { RsvpClosed } from "../rsvp/RsvpClosed";
import { RsvpForm } from "../rsvp/RsvpForm";

type Props = {
  invitation: InvitationData;
  isOpen: boolean;
  monogram: Monogram | null;
};

/** The first shown language's value, for attributes that hold one string (placeholders). */
function single(text: LocalizedText, invitation: InvitationData): string {
  return pickLanguages(text, invitation.languages)[0]?.value ?? "";
}

function joined(text: LocalizedText, invitation: InvitationData): string {
  return pickLanguages(text, invitation.languages)
    .map((part) => part.value)
    .join(" · ");
}

function rsvpCopy(invitation: InvitationData): RsvpCopy {
  const names = invitation.texts.names ?? {};
  const contactName = invitation.texts["contact.name"] ?? names;
  const notes = message("rsvp.notes");
  const optional = message("rsvp.optional");

  return {
    name: message("rsvp.name"),
    namePlaceholder: single(message("rsvp.namePlaceholder"), invitation),
    attending: message("rsvp.attending"),
    accept: message("rsvp.accept"),
    decline: message("rsvp.decline"),
    guests: message("rsvp.guests"),
    notes: localize((lang) => `${notes[lang] ?? ""} ${optional[lang] ?? ""}`.trim()),
    notesPlaceholder: single(message("rsvp.notesPlaceholder"), invitation),
    send: message("rsvp.send"),
    privacy: message("rsvp.privacy", { names }),
    note: message(invitation.settings.demo ? "rsvp.demoNote" : "rsvp.opensSoon"),
    received: {
      title: message("received.title"),
      accepted: message("received.accepted", { names }),
      declined: message("received.declined", { names }),
      yourReply: joined(message("received.yourReply"), invitation),
      calendar: message("received.calendar"),
      back: message("received.back"),
      change: message("received.change", { name: contactName }),
    },
  };
}

function calendarLink(invitation: InvitationData): CalendarLink {
  const lang = primaryLang(invitation);
  const names = invitation.texts.names?.[lang] ?? invitation.slug;
  const venue = invitation.texts["venue.name"]?.[lang];
  const ics = buildIcs({
    uid: `${invitation.slug}@zaffa`,
    title: names,
    start: invitation.startsAt,
    location: [venue, invitation.venueAddress].filter(Boolean).join(", "),
    stamp: invitation.startsAt,
  });
  return { href: icsDataUrl(ics), fileName: `${invitation.slug}.ics` };
}

/** "Will you join us?": the form before the deadline, the closed notice after it. */
export function RsvpSection({ invitation, isOpen, monogram }: Props) {
  const { languages } = invitation;
  const context = formatContextOf(invitation);
  const deadline = localize((lang) => formatDate(invitation.rsvpDeadline, lang, context));
  const contactName = invitation.texts["contact.name"] ?? invitation.texts.names ?? {};

  return (
    <section
      id="rsvp"
      aria-labelledby="rsvp-title"
      className="classic-on-dark flex flex-col gap-5.5 bg-classic-ink px-5.5 py-13"
    >
      <div className="flex flex-col items-center gap-1 text-center text-classic-parchment">
        <Bi
          id="rsvp-title"
          text={message("rsvp.title")}
          languages={languages}
          as="h2"
          restAs="p"
          className="m-0 font-normal"
          en="font-script text-[2.75rem] leading-[1.1]"
          ar="text-[1.625rem] font-bold"
          arDisplay
        />
        {isOpen && (
          <Bi
            text={message("rsvp.replyBy", { date: deadline })}
            languages={languages}
            className="m-0 text-classic-champagne"
            en="mt-2 text-base"
            ar="text-[0.9375rem]"
          />
        )}
      </div>

      {isOpen ? (
        <RsvpForm
          languages={languages}
          arabicLocale={invitation.settings.arabicLocale}
          copy={rsvpCopy(invitation)}
          isDemo={invitation.settings.demo}
          calendar={calendarLink(invitation)}
          monogram={monogram}
        />
      ) : (
        <RsvpClosed
          languages={languages}
          title={message("closed.title")}
          message={message("closed.message", { date: deadline, name: contactName })}
          callLabel={message("closed.call", { name: contactName })}
          phone={invitation.contactPhone}
          phoneHref={telHref(invitation.contactPhone)}
          monogram={monogram}
        />
      )}
    </section>
  );
}
