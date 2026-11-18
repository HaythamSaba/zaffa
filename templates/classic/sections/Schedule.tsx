import type { InvitationData } from "@/lib/events/build-invitation";
import { formatWallClock } from "@/lib/i18n/format";
import { message } from "@/lib/i18n/messages";
import { Bi } from "../Bi";
import { formatContextOf, primaryLang } from "../localize";
import { SectionHeading } from "../SectionHeading";

type Props = { invitation: InvitationData };

/** "The day" (Premium): the order of events, times as local wall-clock times. */
export function Schedule({ invitation }: Props) {
  const { languages } = invitation;
  const context = formatContextOf(invitation);
  const timeLang = primaryLang(invitation);
  const title = message("schedule.title");

  return (
    <section aria-label={title.en ?? title.ar} className="flex flex-col items-center gap-5.5 px-7 py-13">
      <SectionHeading text={title} languages={languages} />
      <ol className="m-0 flex w-full list-none flex-col p-0">
        {invitation.schedule.map((item) => (
          <li
            key={item.id}
            className="grid grid-cols-[5.25rem_1fr] gap-3.5 border-b border-classic-rule py-3.5 text-start last:border-b-0"
          >
            <span className="font-bodoni text-base text-classic-umber">
              {formatWallClock(item.time, timeLang, context)}
            </span>
            <span className="flex flex-col">
              <Bi text={item.title} languages={languages} as="span" en="text-lg" ar="text-base" />
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
