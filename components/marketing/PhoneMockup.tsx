const countdown = [
  { value: "218", unit: "days" },
  { value: "06", unit: "hours" },
  { value: "41", unit: "min" },
  { value: "09", unit: "sec" },
] as const;

const schedule = [
  { time: "16:00", label: "Ceremony" },
  { time: "19:00", label: "Dinner & dancing" },
] as const;

/**
 * Static illustration of a sample invitation. Exposed to assistive tech as a
 * single image; numbers are fixed so there is no hydration mismatch or shift.
 * Real sizes (not a CSS scale) on phones, so it never leaves dead space below.
 */
export function PhoneMockup() {
  return (
    <div
      role="img"
      aria-label="A sample invitation for Sara and Omar on a phone: date, countdown, venue, schedule and an RSVP button"
      className="h-144 w-72 max-w-full shrink-0 rounded-phone bg-indigo-deep p-3 shadow-phone md:h-160 md:w-80 lg:rotate-2"
    >
      <div className="flex h-full flex-col items-center gap-4 overflow-hidden rounded-screen bg-indigo px-6 pt-10 pb-6 text-center text-paper md:gap-4.5 md:pt-12 md:pb-7">
        <p className="text-[0.6875rem] uppercase tracking-[0.27em] text-saffron text-balance">
          You&rsquo;re invited
          <br />
          to our wedding
        </p>
        <div className="h-px w-10 bg-saffron" />
        <p className="font-display text-[2.5rem] leading-none font-semibold md:text-[2.75rem]">
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

        <p className="text-[0.8125rem]">Villa Rosa, Vienna</p>

        <dl className="w-full divide-y divide-paper/15 border-y border-paper/15 text-[0.8125rem]">
          {schedule.map((item) => (
            <div key={item.time} className="flex items-baseline justify-between py-2.5">
              <dt className="font-display text-base text-saffron">{item.time}</dt>
              <dd>{item.label}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-auto w-full rounded-full bg-saffron py-3 text-sm font-bold text-indigo">
          RSVP
        </div>
      </div>
    </div>
  );
}
