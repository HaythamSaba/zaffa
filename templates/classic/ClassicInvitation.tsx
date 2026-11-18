import type { ReactNode } from "react";
import type { InvitationData } from "@/lib/events/build-invitation";
import { monogramFor } from "@/lib/events/monogram";
import { invitationSections, showsOpeningScreen } from "@/lib/events/sections";
import type { SectionId } from "@/lib/events/types";
import { formatNumericDate } from "@/lib/i18n/format";
import { message } from "@/lib/i18n/messages";
import { Bi } from "./Bi";
import { formatContextOf, primaryLang } from "./localize";
import { CornerFlourish, MonogramMark, Seal, StarDivider } from "./ornaments";
import { CountdownSection } from "./sections/CountdownSection";
import { Gallery } from "./sections/Gallery";
import { RsvpSection } from "./sections/RsvpSection";
import { Schedule } from "./sections/Schedule";
import { Contact, DressCode, Story } from "./sections/TextSections";
import { Venue } from "./sections/Venue";
import { Welcome } from "./sections/Welcome";
import { OpeningGate } from "./OpeningGate";

export type ClassicInvitationProps = {
  invitation: InvitationData;
  /** Decided on the server at request time (isRsvpOpen). */
  isRsvpOpen: boolean;
  /** The server's clock, so the countdown's first paint matches. */
  serverNow: number;
  /** Draft opened with a preview token. */
  isPreview?: boolean;
};

const OPENING_TITLE_ID = "opening-title";

function OpeningCard({ invitation }: { invitation: InvitationData }) {
  const { languages, texts } = invitation;
  const context = formatContextOf(invitation);

  return (
    <>
      <CornerFlourish className="start-3.5 top-3.5 rtl:-scale-x-100" />
      <CornerFlourish className="end-3.5 top-3.5 -scale-x-100 rtl:scale-x-100" />
      <CornerFlourish className="start-3.5 bottom-3.5 -scale-y-100 rtl:-scale-100" />
      <CornerFlourish className="end-3.5 bottom-3.5 -scale-100 rtl:-scale-y-100" />

      <Seal monogram={monogramFor(texts.names, languages)} />

      <div id={OPENING_TITLE_ID} className="flex flex-col gap-1">
        <Bi text={message("opening.invited")} languages={languages} className="m-0 text-classic-umber" en="font-bodoni text-[0.8125rem] tracking-[0.32em] uppercase" ar="text-[1.0625rem]" />
      </div>
      <div className="flex flex-col gap-0.5">
        <Bi text={message("opening.weddingOf")} languages={languages} className="m-0 text-classic-smoke" en="text-[1.0625rem] italic" ar="text-base" />
      </div>
      <div className="flex flex-col">
        <Bi
          text={texts.names}
          languages={languages}
          className="m-0"
          en="font-script text-[clamp(2.25rem,11vw,3.375rem)] leading-[1.15]"
          ar="text-4xl leading-normal font-bold"
          arDisplay
        />
      </div>

      <StarDivider />

      <div className="flex flex-col gap-0.5">
        <p className="m-0 font-bodoni text-[0.9375rem] tracking-[0.12em]">
          {formatNumericDate(invitation.startsAt, primaryLang(invitation), context)}
        </p>
        <Bi text={texts.place} languages={languages} className="m-0 text-[0.9375rem] text-classic-smoke" />
      </div>
    </>
  );
}

function renderSection(id: SectionId, props: ClassicInvitationProps): ReactNode {
  const { invitation } = props;
  const monogram = monogramFor(invitation.texts.names, invitation.languages);
  switch (id) {
    case "welcome":
      return <Welcome key={id} invitation={invitation} />;
    case "countdown":
      return <CountdownSection key={id} invitation={invitation} serverNow={props.serverNow} />;
    case "story":
      return <Story key={id} invitation={invitation} />;
    case "venue":
      return <Venue key={id} invitation={invitation} />;
    case "schedule":
      return <Schedule key={id} invitation={invitation} />;
    case "dress_code":
      return <DressCode key={id} invitation={invitation} />;
    case "gallery":
      return <Gallery key={id} invitation={invitation} />;
    case "rsvp":
      return <RsvpSection key={id} invitation={invitation} isOpen={props.isRsvpOpen} monogram={monogram} />;
    case "contact":
      return <Contact key={id} invitation={invitation} />;
  }
}

/** Template 1, "Classic Elegance". Receives the event data as props; renders no data access. */
export function ClassicInvitation(props: ClassicInvitationProps) {
  const { invitation, isPreview = false } = props;
  const { languages } = invitation;
  const monogram = monogramFor(invitation.texts.names, languages);

  const page = (
    <div className="mx-auto flex min-h-dvh w-full max-w-120 flex-col overflow-x-clip bg-classic-parchment shadow-classic-card">
      {isPreview && (
        <div className="flex flex-col bg-classic-umber px-4 py-2 text-center text-sm text-classic-white">
          <Bi text={message("preview.banner")} languages={languages} className="m-0" />
        </div>
      )}
      <main>{invitationSections(invitation).map((id) => renderSection(id, props))}</main>
      <footer className="mt-auto flex flex-col items-center gap-1 border-t border-classic-rule p-7 text-center">
        <MonogramMark monogram={monogram} />
        <Bi
          text={message("footer.madeWith")}
          languages={languages}
          className="m-0 text-xs text-classic-smoke"
          en="tracking-[0.16em] uppercase"
        />
      </footer>
    </div>
  );

  if (!showsOpeningScreen(invitation.package)) return page;

  return (
    <OpeningGate
      labelledBy={OPENING_TITLE_ID}
      card={<OpeningCard invitation={invitation} />}
      buttonLabel={
        <Bi text={message("opening.open")} languages={languages} as="span" en="font-bodoni text-xs tracking-[0.26em] uppercase" ar="text-[0.9375rem]" />
      }
    >
      {page}
    </OpeningGate>
  );
}
