import type { InvitationData } from "@/lib/events/build-invitation";
import { formatLongDate } from "@/lib/i18n/format";
import { ArchPhoto } from "../ArchPhoto";
import { Bi } from "../Bi";
import { formatContextOf, localize } from "../localize";
import { StarDivider } from "../ornaments";

type Props = { invitation: InvitationData };

/** The hero: hosts line, couple photo in an arch, names (the page's h1), date and place. */
export function Welcome({ invitation }: Props) {
  const { languages, texts } = invitation;
  const context = formatContextOf(invitation);
  const venueLine = localize((lang) =>
    [texts["venue.name"]?.[lang], texts.place?.[lang]].filter(Boolean).join(" · "),
  );

  return (
    <section
      aria-labelledby="invitation-names"
      className="flex flex-col items-center gap-5.5 px-7 pt-11 pb-12 text-center"
    >
      <div className="flex flex-col gap-1">
        <Bi
          text={texts["welcome.hosts"]}
          languages={languages}
          className="m-0 text-classic-umber"
          en="classic-caps text-[0.6875rem]"
          ar="text-[0.9375rem]"
        />
      </div>

      <div className="rounded-classic-arch border border-classic-gold p-2">
        <ArchPhoto
          photo={invitation.heroPhoto}
          languages={languages}
          sizes="234px"
          priority
          className="h-76 w-58.5"
        />
      </div>

      <div id="invitation-names" tabIndex={-1} className="flex flex-col outline-none">
        <Bi
          text={texts.names}
          languages={languages}
          as="h1"
          restAs="p"
          className="m-0 font-normal"
          en="font-script text-[clamp(2.5rem,13vw,3.625rem)] leading-[1.1]"
          ar="text-[2.375rem] leading-normal font-bold"
          arDisplay
        />
      </div>

      <div className="flex flex-col gap-0.5">
        <Bi
          text={texts["welcome.message"]}
          languages={languages}
          className="m-0"
          en="text-[1.1875rem] italic"
          ar="text-[1.0625rem]"
        />
      </div>

      <StarDivider lineClassName="w-14" />

      <div className="flex flex-col gap-1">
        <Bi
          text={localize((lang) => formatLongDate(invitation.startsAt, lang, context))}
          languages={languages}
          className="m-0"
          en="classic-caps text-[0.8125rem]"
          ar="text-[1.0625rem]"
        />
        <Bi
          text={venueLine}
          languages={languages}
          className="m-0 text-classic-smoke"
          en="mt-1.5 text-[1.0625rem]"
          ar="text-base"
        />
      </div>
    </section>
  );
}
