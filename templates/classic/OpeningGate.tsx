"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Phase = "closed" | "opening" | "open";

type Props = {
  /** The opening card's content (seal, names, date), rendered on the server. */
  card: ReactNode;
  /** The button's stacked label. */
  buttonLabel: ReactNode;
  /** id of the element that names the dialog (the "You're invited" line). */
  labelledBy: string;
  /** The invitation itself, hidden from interaction until opened. */
  children: ReactNode;
};

const FADE_MS = 700;

/**
 * The opening screen (Premium and Bespoke). A full-screen card over the
 * invitation; "Open invitation" fades it away and moves focus to the names.
 * Without JavaScript the card is hidden and the invitation shows directly.
 * Respects prefers-reduced-motion (no fade).
 */
export function OpeningGate({ card, buttonLabel, labelledBy, children }: Props) {
  const [phase, setPhase] = useState<Phase>("closed");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const content = contentRef.current;
    if (!content || phase === "open") return;
    content.inert = true;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      content.inert = false;
      document.body.style.overflow = overflow;
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "opening") return;
    const timer = window.setTimeout(() => setPhase("open"), FADE_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === "open") document.getElementById("invitation-names")?.focus();
  }, [phase]);

  function handleOpen() {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    setPhase(reduceMotion ? "open" : "opening");
  }

  return (
    <>
      <noscript>
        <style>{"[data-opening-screen]{display:none!important}"}</style>
      </noscript>
      {phase !== "open" && (
        <div
          data-opening-screen=""
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          className={`fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-classic-cream p-7 transition-opacity duration-700 ease-out motion-reduce:transition-none ${
            phase === "opening" ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          <div className="relative flex min-h-full w-full max-w-100 flex-col items-center justify-center gap-5.5 border border-classic-gold bg-classic-parchment px-7 py-10 text-center shadow-classic-card outline outline-classic-gold -outline-offset-8">
            {card}
            <button
              type="button"
              onClick={handleOpen}
              className="mt-2.5 flex min-h-14.5 w-58 cursor-pointer flex-col items-center justify-center bg-classic-umber px-4 py-2 text-classic-white transition-colors hover:bg-classic-ink"
            >
              {buttonLabel}
            </button>
          </div>
        </div>
      )}
      <div ref={contentRef}>{children}</div>
    </>
  );
}
