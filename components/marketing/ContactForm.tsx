import type { ReactNode } from "react";
import { packageOptionLabel } from "@/lib/format";
import { packages } from "@/lib/site-config";

/*
 * Phase 2: presentational markup only. Phase 3 turns this into a client
 * component bound to a server action (zod validation, honeypot, rate limit,
 * success/error states). Until then the submit button does not submit.
 */

const fieldClass =
  "min-h-12 w-full rounded-xl border border-dusk bg-paper px-3.5 text-body font-normal text-indigo placeholder:text-dusk/80";

function Field({
  label,
  children,
  isWide = false,
}: {
  label: string;
  children: ReactNode;
  isWide?: boolean;
}) {
  return (
    <label
      className={`flex flex-col gap-2 text-sm font-semibold text-indigo ${isWide ? "col-span-full" : ""}`}
    >
      {label}
      {children}
    </label>
  );
}

export function ContactForm() {
  return (
    <form
      aria-labelledby="contact-title"
      className="grid min-w-0 flex-[999_1_30rem] grid-cols-[repeat(auto-fit,minmax(min(100%,13.75rem),1fr))] gap-5 rounded-panel border border-line bg-white p-6 md:p-9"
    >
      <Field label="Your names">
        <input name="names" type="text" autoComplete="name" placeholder="Sara & Omar" className={fieldClass} />
      </Field>
      <Field label="Email">
        <input name="email" type="email" autoComplete="email" placeholder="you@example.com" className={fieldClass} />
      </Field>
      <Field label="Wedding date">
        <input name="weddingDate" type="date" className={fieldClass} />
      </Field>
      <Field label="Languages">
        <input
          name="languages"
          type="text"
          placeholder="e.g. your families' languages"
          className={fieldClass}
        />
      </Field>
      <Field label="Package">
        <select name="package" defaultValue="unsure" className={`${fieldClass} px-3`}>
          <option value="unsure">Not sure yet</option>
          {packages.map((pkg) => (
            <option key={pkg.id} value={pkg.id}>
              {packageOptionLabel(pkg)}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Wedding city">
        <input name="city" type="text" placeholder="e.g. Berlin" className={fieldClass} />
      </Field>
      <Field label="Anything else?" isWide>
        <textarea
          name="message"
          rows={4}
          placeholder="Tell us about your wedding, or anything you'd like on your invitation"
          className={`${fieldClass} resize-y py-3`}
        />
      </Field>

      <div className="col-span-full flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-95 text-[0.8125rem] text-dusk">
          We only use these details to reply to you. See our{" "}
          <a href="/privacy" className="text-coral underline underline-offset-2 hover:text-coral-deep">
            privacy notice
          </a>
          .
        </p>
        <button
          type="button"
          className="min-h-13 cursor-pointer rounded-full bg-coral px-7.5 text-base font-bold text-white hover:bg-coral-deep motion-safe:transition-colors active:translate-y-px"
        >
          Send inquiry
        </button>
      </div>
    </form>
  );
}
