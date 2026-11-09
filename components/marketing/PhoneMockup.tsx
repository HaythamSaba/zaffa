import { Photo } from "@/components/ui/Photo";
import { photos } from "@/lib/photos";

const countdown = [
  { value: "218", unit: "days" },
  { value: "06", unit: "hours" },
  { value: "41", unit: "min" },
  { value: "09", unit: "sec" },
] as const;

/**
 * Static illustration of a sample invitation in the Linen & Arches style.
 * Exposed to assistive tech as one image; fixed numbers, so no hydration
 * mismatch or layout shift.
 */
export function PhoneMockup() {
  return (
    <div
      role="img"
      aria-label="A sample invitation for Sara and Omar on a phone: photo, date, venue, countdown and an RSVP button"
      className="h-136 w-68 max-w-full shrink-0 rounded-[2.875rem] bg-espresso p-2.75 shadow-phone nav:h-150 nav:w-75"
    >
      <div className="flex h-full flex-col overflow-hidden rounded-[2.25rem] bg-ivory">
        <Photo
          photo={photos.phoneCouple}
          sizes="300px"
          className="relative h-50 shrink-0 rounded-[0_0_50%_50%/0_0_30%_30%] nav:h-57.5"
        />
        <div className="flex flex-col items-center gap-2.5 px-5 pt-5 text-center">
          <p className="label text-[0.5625rem] text-mocha">Together with their families</p>
          <p className="font-display text-[1.875rem] leading-tight tracking-[0.12em] uppercase nav:text-[2.125rem]">
            Sara <i className="tracking-normal normal-case">&amp;</i> Omar
          </p>
          <p className="font-display text-base text-taupe italic">Saturday, 12 June 2027 · Vienna</p>
          <div className="my-1.5 grid w-full grid-cols-4 gap-1.5">
            {countdown.map((item) => (
              <div key={item.unit} className="border border-linen py-1.5">
                <p className="font-display text-xl leading-tight">{item.value}</p>
                <p className="text-[0.5rem] tracking-widest text-mocha uppercase">{item.unit}</p>
              </div>
            ))}
          </div>
          <span className="label w-full bg-taupe py-2.75 text-[0.625rem] text-white">
            Joyfully RSVP
          </span>
        </div>
      </div>
    </div>
  );
}
