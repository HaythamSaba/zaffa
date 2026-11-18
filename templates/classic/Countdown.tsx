"use client";

import { useEffect, useState } from "react";
import { timeUntil, type TimeRemaining } from "@/lib/events/rsvp-window";
import { pickLanguages, type Languages, type LocalizedText } from "@/lib/i18n/bilingual";
import { formatCount, type FormatContext, type Lang } from "@/lib/i18n/format";
import { Bi } from "./Bi";

type Unit = keyof TimeRemaining;

type Props = {
  /** The wedding, as epoch milliseconds. */
  target: number;
  /** The server's clock when the page was rendered, so the first paint matches. */
  serverNow: number;
  languages: Languages;
  digitsLang: Lang;
  context: FormatContext;
  labels: Readonly<Record<Unit, LocalizedText>>;
  title: LocalizedText;
};

const UNITS: readonly Unit[] = ["days", "hours", "minutes", "seconds"];
const TICK_MS = 1000;

/** Live countdown to the wedding; renders the server's numbers first, then ticks. */
export function Countdown({ target, serverNow, languages, digitsLang, context, labels, title }: Props) {
  const [now, setNow] = useState(serverNow);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  const remaining = timeUntil(new Date(target), new Date(now));
  // One language only: the page's main one (the timer has no lang of its own).
  const label = pickLanguages(title, languages)[0]?.value;

  return (
    <div role="timer" aria-label={label} className="grid w-full grid-cols-4 gap-2">
      {UNITS.map((unit) => (
        <div key={unit} className="flex flex-col gap-0.5 border border-classic-champagne/50 py-3">
          <span className="font-bodoni text-[1.75rem] leading-tight tabular-nums">
            {formatCount(remaining[unit], digitsLang, context)}
          </span>
          <Bi
            text={labels[unit]}
            languages={languages}
            as="span"
            className="text-xs text-classic-champagne"
          />
        </div>
      ))}
    </div>
  );
}
