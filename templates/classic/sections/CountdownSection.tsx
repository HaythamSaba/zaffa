import type { InvitationData } from "@/lib/events/build-invitation";
import { message } from "@/lib/i18n/messages";
import { Bi } from "../Bi";
import { Countdown } from "../Countdown";
import { formatContextOf, primaryLang } from "../localize";

type Props = { invitation: InvitationData; serverNow: number };

export function CountdownSection({ invitation, serverNow }: Props) {
  const { languages } = invitation;
  const title = message("countdown.title");

  return (
    <section
      aria-labelledby="countdown-title"
      className="classic-on-dark flex flex-col items-center gap-5 bg-classic-ink px-6 py-10 text-center text-classic-parchment"
    >
      <div className="flex flex-col gap-0.5">
        <Bi id="countdown-title" text={title} languages={languages} className="m-0 text-classic-champagne" en="classic-caps text-[0.6875rem]" ar="text-[0.9375rem]" />
      </div>
      <Countdown
        target={invitation.startsAt.getTime()}
        serverNow={serverNow}
        languages={languages}
        digitsLang={primaryLang(invitation)}
        context={formatContextOf(invitation)}
        title={title}
        labels={{
          days: message("countdown.days"),
          hours: message("countdown.hours"),
          minutes: message("countdown.minutes"),
          seconds: message("countdown.seconds"),
        }}
      />
    </section>
  );
}
