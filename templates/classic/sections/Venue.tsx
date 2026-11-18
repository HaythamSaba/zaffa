import type { InvitationData } from "@/lib/events/build-invitation";
import { mapLinkFor } from "@/lib/events/map-url";
import { formatLongDate, formatTime } from "@/lib/i18n/format";
import { message } from "@/lib/i18n/messages";
import { Bi } from "../Bi";
import { formatContextOf, localize } from "../localize";
import { SectionHeading } from "../SectionHeading";

type Props = { invitation: InvitationData };

/** "The celebration": venue, address, date and time, and a directions link. */
export function Venue({ invitation }: Props) {
  const { languages, texts } = invitation;
  const context = formatContextOf(invitation);
  const title = message("venue.title");
  const mapLink = mapLinkFor(invitation);
  const when = localize(
    (lang) => `${formatLongDate(invitation.startsAt, lang, context)} · ${formatTime(invitation.startsAt, lang, context)}`,
  );

  return (
    <section aria-label={title.en ?? title.ar} className="flex flex-col items-center gap-5 bg-classic-cream px-6 py-13 text-center">
      <SectionHeading text={title} languages={languages} />

      <div className="flex w-full flex-col gap-3.5 border border-classic-gold bg-classic-parchment px-4.5 py-5.5">
        <div className="flex flex-col gap-0.5">
          <Bi
            text={texts["venue.name"]}
            languages={languages}
            className="m-0"
            en="font-bodoni text-[1.375rem]"
            ar="text-xl"
            arDisplay
          />
          {invitation.venueAddress && (
            <p dir="auto" className="m-0 mt-1.5 text-base text-classic-smoke">
              {invitation.venueAddress}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-0.5">
          <Bi text={when} languages={languages} className="m-0" en="text-[1.0625rem]" ar="text-base" />
        </div>

        <div aria-hidden="true" className="classic-map-pattern flex h-37.5 items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" strokeWidth="1.4" className="stroke-classic-umber">
            <path d="M12 21s-6.5-6.1-6.5-11.2A6.5 6.5 0 0 1 18.5 9.8C18.5 14.9 12 21 12 21z" />
            <circle cx="12" cy="9.8" r="2.3" />
          </svg>
        </div>

        {mapLink && (
          <a
            href={mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-13 flex-col items-center justify-center border border-classic-umber p-1.5 text-classic-umber no-underline transition-colors hover:bg-classic-cream"
          >
            <Bi text={message("venue.directions")} languages={languages} as="span" en="classic-caps text-[0.6875rem]" ar="text-sm" />
          </a>
        )}
      </div>
    </section>
  );
}
