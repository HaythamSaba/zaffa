"use client";

import { useEffect, useRef } from "react";
import type { Monogram } from "@/lib/events/monogram";
import type { Languages } from "@/lib/i18n/bilingual";
import { Bi } from "../Bi";
import { MonogramMark } from "../ornaments";
import type { CalendarLink, RsvpCopy } from "./copy";

export interface ReceivedReply {
  readonly name: string;
  readonly guestCount: number;
  readonly attending: boolean;
}

type Props = {
  languages: Languages;
  /** theme_settings.arabicLocale, for the guest count's digits. */
  arabicLocale: string;
  copy: RsvpCopy;
  reply: ReceivedReply;
  calendar: CalendarLink;
  monogram: Monogram | null;
  onBack: () => void;
};

/** "RSVP received": thanks, a summary of the reply, add to calendar. Focus moves to the title. */
export function RsvpReceived({ languages, arabicLocale, copy, reply, calendar, monogram, onBack }: Props) {
  const titleRef = useRef<HTMLDivElement>(null);
  const { received } = copy;

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col items-center gap-5.5 bg-classic-parchment px-6 py-10 text-center text-classic-ink">
      <div aria-hidden="true" className="flex size-21 items-center justify-center rounded-full border border-classic-gold">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="stroke-classic-umber">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </div>

      {/* Focus moves here, which announces the title; no live region too (it would read twice). */}
      <div ref={titleRef} tabIndex={-1} className="flex flex-col outline-none">
        <Bi
          text={received.title}
          languages={languages}
          as="h3"
          restAs="p"
          className="m-0 font-normal"
          en="font-script text-5xl leading-tight"
          ar="text-3xl font-bold"
          arDisplay
        />
      </div>

      <div className="flex flex-col gap-0.5">
        <Bi
          text={reply.attending ? received.accepted : received.declined}
          languages={languages}
          className="m-0"
          en="text-lg"
          ar="text-base leading-[1.8]"
        />
      </div>

      <div className="flex w-full flex-col gap-2.5 border border-classic-gold p-4.5">
        <p className="m-0 text-xs text-classic-umber">{received.yourReply}</p>
        <p dir="auto" className="m-0 text-lg">
          {reply.name}
        </p>
        <Bi
          text={{
            ...(copy.guests.en ? { en: `${copy.guests.en}: ${reply.guestCount}` } : {}),
            ...(copy.guests.ar
              ? { ar: `${copy.guests.ar}: ${new Intl.NumberFormat(arabicLocale).format(reply.guestCount)}` }
              : {}),
          }}
          languages={languages}
          className="m-0"
          en="text-[1.0625rem]"
          ar="text-[0.9375rem]"
        />
        <Bi
          text={reply.attending ? copy.accept : copy.decline}
          languages={languages}
          className="m-0"
          en="text-[1.0625rem]"
          ar="text-[0.9375rem]"
        />
      </div>

      {reply.attending && (
        <a
          href={calendar.href}
          download={calendar.fileName}
          className="flex min-h-14 w-full flex-col items-center justify-center bg-classic-umber p-1.5 text-classic-white no-underline transition-colors hover:bg-classic-ink"
        >
          <Bi text={received.calendar} languages={languages} as="span" en="classic-caps text-[0.6875rem]" ar="text-[0.9375rem]" />
        </a>
      )}

      <button
        type="button"
        onClick={onBack}
        className="flex min-h-13 w-full cursor-pointer flex-col items-center justify-center border border-classic-umber bg-transparent p-1.5 text-classic-umber transition-colors hover:bg-classic-cream"
      >
        <Bi text={received.back} languages={languages} as="span" en="classic-caps text-[0.6875rem]" ar="text-sm" />
      </button>

      <div className="flex flex-col gap-0.5">
        <Bi text={received.change} languages={languages} className="m-0 text-sm text-classic-smoke" />
      </div>

      <MonogramMark monogram={monogram} />
    </div>
  );
}
