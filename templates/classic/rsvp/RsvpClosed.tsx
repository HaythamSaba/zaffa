import type { Monogram } from "@/lib/events/monogram";
import type { Languages, LocalizedText } from "@/lib/i18n/bilingual";
import { Bi } from "../Bi";
import { MonogramMark } from "../ornaments";

type Props = {
  languages: Languages;
  title: LocalizedText;
  message: LocalizedText;
  callLabel: LocalizedText;
  phone: string;
  phoneHref: string;
  monogram: Monogram | null;
};

/** After the deadline: "RSVP is now closed" with the couple's number (spec Q23). */
export function RsvpClosed({ languages, title, message, callLabel, phone, phoneHref, monogram }: Props) {
  return (
    <div className="flex flex-col items-center gap-5.5 bg-classic-parchment px-6 py-10 text-center text-classic-ink">
      <div aria-hidden="true" className="flex size-21 items-center justify-center rounded-full border border-classic-gold">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="stroke-classic-umber">
          <rect x="4" y="5" width="16" height="15" rx="1.5" />
          <path d="M4 9.5h16M8.5 3v4M15.5 3v4" />
        </svg>
      </div>

      <div className="flex flex-col gap-0.5">
        <Bi
          text={title}
          languages={languages}
          as="h3"
          restAs="p"
          className="m-0 font-normal"
          en="classic-caps text-[1.0625rem]"
          ar="text-2xl font-bold"
          arDisplay
        />
      </div>

      <div className="flex flex-col gap-0.5">
        <Bi text={message} languages={languages} className="m-0" en="text-lg leading-normal" ar="text-base leading-[1.8]" />
      </div>

      <a
        href={phoneHref}
        className="flex min-h-14.5 w-full flex-col items-center justify-center bg-classic-umber p-1.5 text-classic-white no-underline transition-colors hover:bg-classic-ink"
      >
        <Bi text={callLabel} languages={languages} as="span" en="classic-caps text-[0.6875rem]" ar="text-[0.9375rem]" />
        <span dir="ltr" className="font-bodoni text-[0.9375rem] tracking-[0.06em]">
          {phone}
        </span>
      </a>

      <MonogramMark monogram={monogram} />
    </div>
  );
}
