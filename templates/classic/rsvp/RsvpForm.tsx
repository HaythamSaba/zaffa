"use client";

import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import type { Monogram } from "@/lib/events/monogram";
import type { Languages, LocalizedText } from "@/lib/i18n/bilingual";
import { message } from "@/lib/i18n/messages";
import { initialRsvpState, RSVP_HONEYPOT_FIELD, type SubmitRsvpAction } from "@/lib/rsvp/types";
import { Bi } from "../Bi";
import type { CalendarLink, RsvpCopy } from "./copy";
import { RsvpReceived, type ReceivedReply } from "./RsvpReceived";

type Props = {
  languages: Languages;
  arabicLocale: string;
  copy: RsvpCopy;
  /** The demo couple: "Send reply" shows the received screen without saving anything. */
  isDemo: boolean;
  calendar: CalendarLink;
  monogram: Monogram | null;
  /** `submitRsvp` already bound to this invitation's slug (unused in demo mode). */
  action: SubmitRsvpAction;
};

const MAX_GUESTS = 20;
const MAX_NAME = 120;
const MAX_NOTES = 1000;

const fieldClass =
  "min-h-12 w-full border border-classic-smoke bg-classic-white px-3.5 py-2.5 text-[1.0625rem] text-classic-ink";

/** English and Arabic side by side on one line, as in the reference (wraps on narrow screens). */
function FieldLabel({ text, languages }: { text: LocalizedText; languages: Languages }) {
  return (
    <span className="flex flex-wrap items-baseline justify-between gap-x-2.5">
      <Bi text={text} languages={languages} as="span" className="font-semibold" en="text-base" ar="text-[0.9375rem]" />
    </span>
  );
}

/**
 * The RSVP form. The demo couple ("isDemo") simulates the received screen
 * entirely client-side and never calls `action`. A real event submits to the
 * bound server action, which validates, rate-limits and saves with the
 * service role; fields and limits match the database: name up to 120
 * characters, 1-20 guests, notes up to 1000.
 */
export function RsvpForm({ languages, arabicLocale, copy, isDemo, calendar, monogram, action }: Props) {
  const [demoReply, setDemoReply] = useState<ReceivedReply | null>(null);
  const [state, formAction, isPending] = useActionState(action, initialRsvpState);
  const [dismissed, setDismissed] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const returningRef = useRef(false);

  const reply: ReceivedReply | null = isDemo
    ? demoReply
    : !dismissed && state.status === "success"
      ? state.reply
      : null;

  // After "Back to the invitation", put focus back on the form (not <body>).
  useEffect(() => {
    if (reply === null && returningRef.current) {
      returningRef.current = false;
      nameRef.current?.focus();
    }
  }, [reply]);

  function handleBack() {
    returningRef.current = true;
    rootRef.current?.closest("section")?.scrollIntoView?.({ block: "start" });
    if (isDemo) setDemoReply(null);
    else setDismissed(true);
  }

  function handleDemoSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setDemoReply({
      name: String(data.get("name") ?? "").trim(),
      guestCount: Number(data.get("guestCount") ?? 1),
      attending: data.get("attending") === "yes",
    });
  }

  if (reply) {
    return (
      <div ref={rootRef}>
        <RsvpReceived
          languages={languages}
          arabicLocale={arabicLocale}
          copy={copy}
          reply={reply}
          calendar={calendar}
          monogram={monogram}
          onBack={handleBack}
        />
      </div>
    );
  }

  const errorText = !isDemo && state.status === "error" ? message(`rsvp.error.${state.code}`) : null;

  return (
    <form
      onSubmit={isDemo ? handleDemoSubmit : () => setDismissed(false)}
      action={isDemo ? undefined : formAction}
      className="flex flex-col gap-4.5 bg-classic-parchment px-4.5 py-6 text-classic-ink"
    >
      <label className="flex flex-col gap-1.5">
        <FieldLabel text={copy.name} languages={languages} />
        <input
          ref={nameRef}
          name="name"
          type="text"
          required
          maxLength={MAX_NAME}
          autoComplete="name"
          dir="auto"
          placeholder={copy.namePlaceholder}
          className={fieldClass}
        />
      </label>

      <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
        <legend className="mb-1.5 w-full p-0">
          <FieldLabel text={copy.attending} languages={languages} />
        </legend>
        {(
          [
            ["yes", copy.accept],
            ["no", copy.decline],
          ] as const
        ).map(([value, text]) => (
          <label
            key={value}
            className="flex min-h-14 cursor-pointer items-center gap-3 border border-classic-smoke bg-classic-white px-3.5 py-2"
          >
            <input
              type="radio"
              name="attending"
              value={value}
              defaultChecked={value === "yes"}
              required
              className="m-0 size-5 accent-classic-umber"
            />
            <span className="flex flex-col">
              <Bi text={text} languages={languages} as="span" en="text-[1.0625rem]" ar="text-[0.9375rem]" />
            </span>
          </label>
        ))}
      </fieldset>

      <label className="flex flex-col gap-1.5">
        <FieldLabel text={copy.guests} languages={languages} />
        <input
          name="guestCount"
          type="number"
          inputMode="numeric"
          required
          min={1}
          max={MAX_GUESTS}
          defaultValue={2}
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <FieldLabel text={copy.notes} languages={languages} />
        <textarea
          name="notes"
          rows={3}
          maxLength={MAX_NOTES}
          dir="auto"
          placeholder={copy.notesPlaceholder}
          className={fieldClass}
        />
      </label>

      {/* Honeypot: invisible to people and screen readers; bots tend to fill it. */}
      {!isDemo && (
        <div aria-hidden="true" className="absolute -start-[9999px] top-0 size-px overflow-hidden">
          <label htmlFor="rsvp-honeypot">Leave this field blank</label>
          <input
            id="rsvp-honeypot"
            name={RSVP_HONEYPOT_FIELD}
            type="text"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </div>
      )}

      {errorText && (
        <div role="alert" dir="auto" className="m-0 border border-classic-gold px-3.5 py-2.5 text-[0.9375rem]">
          <Bi text={errorText} languages={languages} as="span" />
        </div>
      )}

      <button
        type="submit"
        disabled={!isDemo && isPending}
        aria-busy={!isDemo && isPending}
        className="flex min-h-14.5 cursor-pointer flex-col items-center justify-center bg-classic-umber px-1.5 py-1.5 text-classic-white transition-colors hover:bg-classic-ink disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-classic-umber"
      >
        <Bi
          text={!isDemo && isPending ? message("rsvp.sending") : copy.send}
          languages={languages}
          as="span"
          en="classic-caps text-xs"
          ar="text-[0.9375rem]"
        />
      </button>

      <div className="flex flex-col gap-0.5 text-center">
        <Bi text={copy.note} languages={languages} className="m-0 text-sm text-classic-umber" />
        <Bi
          text={copy.privacy}
          languages={languages}
          className="m-0 text-[0.8125rem] text-classic-smoke"
          en="leading-normal"
          ar="leading-[1.7]"
        />
      </div>
    </form>
  );
}
