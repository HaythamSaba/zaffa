const countdown = [
  { value: "218", unit: "days" },
  { value: "06", unit: "hours" },
  { value: "41", unit: "min" },
  { value: "09", unit: "sec" },
] as const;

/**
 * Static illustration of a sample invitation. Exposed to assistive tech as a
 * single image; numbers are fixed so there is no hydration mismatch or shift.
 */
export function PhoneMockup() {
  return (
    <div
      role="img"
      aria-label="A sample invitation for Sara and Omar on a phone: date, countdown, venue and an RSVP button"
      className="h-160 w-80 max-w-full shrink-0 rounded-phone bg-indigo-deep p-3 shadow-phone max-md:scale-[0.92]"
    >
      <div className="flex h-full flex-col items-center gap-4.5 overflow-hidden rounded-screen bg-indigo px-6 pt-12 pb-7 text-center text-paper">
        <p className="text-[0.6875rem] uppercase tracking-[0.27em] text-saffron">
          You&rsquo;re invited to our wedding
        </p>
        <div className="h-px w-10 bg-saffron" />
        <p className="font-display text-[2.75rem] leading-none font-semibold">
          Sara &amp; Omar
        </p>
        <p className="text-sm">Saturday, 12 June 2027</p>

        <div className="grid w-full grid-cols-4 gap-2">
          {countdown.map((item) => (
            <div
              key={item.unit}
              className="rounded-[0.625rem] border border-saffron/50 py-2"
            >
              <p className="text-xl leading-tight font-semibold">{item.value}</p>
              <p className="text-[0.625rem] text-saffron">{item.unit}</p>
            </div>
          ))}
        </div>

        <p className="mt-1 text-[0.8125rem]">Villa Rosa, Vienna</p>

        <div className="mt-auto w-full rounded-full bg-saffron py-3 text-sm font-bold text-indigo">
          RSVP
        </div>
      </div>
    </div>
  );
}
