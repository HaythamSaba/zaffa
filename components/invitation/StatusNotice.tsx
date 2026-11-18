import { message, type MessageKey } from "@/lib/i18n/messages";
import { Bi } from "@/templates/classic/Bi";

type Kind = "unavailable" | "not-found";

const COPY: Readonly<Record<Kind, { title: MessageKey; body: MessageKey }>> = {
  unavailable: { title: "unavailable.title", body: "unavailable.message" },
  "not-found": { title: "notFound.title", body: "notFound.message" },
};

type Props = { kind: Kind };

/**
 * A friendly full-page notice on invitation routes when an invitation can't be
 * shown: "temporarily unavailable" (database unreachable, bad data) or "not
 * found". We don't know the couple's languages here, so it shows both.
 */
export function StatusNotice({ kind }: Props) {
  const { title, body } = COPY[kind];
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-120 flex-col items-center justify-center gap-5 bg-classic-parchment px-7 py-16 text-center">
      <div aria-hidden="true" className="flex size-21 items-center justify-center rounded-full border border-classic-gold">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" strokeWidth="1.4" strokeLinecap="round" className="stroke-classic-umber">
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5v5M12 15.8v.2" />
        </svg>
      </div>
      <div className="flex flex-col gap-1">
        <Bi
          text={message(title)}
          languages="en+ar"
          as="h1"
          restAs="p"
          className="m-0 font-normal"
          en="font-bodoni text-xl"
          ar="text-2xl font-bold"
          arDisplay
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <Bi text={message(body)} languages="en+ar" className="m-0 text-classic-smoke" en="text-[1.0625rem]" ar="text-base" />
      </div>
    </main>
  );
}
