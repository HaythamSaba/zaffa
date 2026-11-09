import type { ReactNode } from "react";
import Link from "next/link";
import { HONEYPOT_FIELD, type ContactField, type ContactFormState } from "@/lib/contact/types";
import { packageOptionLabel } from "@/lib/format";
import { packages } from "@/lib/site-config";
import { ErrorIcon } from "./icons";

type Props = {
  state: ContactFormState;
  formAction: (formData: FormData) => void;
  isPending: boolean;
};

// Square fields. Mocha border = 4.84:1 on Ivory (meets the 3:1 needed for input
// outlines; Linen would not). Rosewood marks invalid fields, always with a message.
const fieldBase =
  "min-h-12 w-full border bg-ivory px-3.5 text-body font-normal text-cocoa placeholder:text-mocha";

function fieldClass(hasError: boolean, extra = ""): string {
  const border = hasError ? "border-2 border-rosewood" : "border-mocha";
  return `${fieldBase} ${border} ${extra}`;
}

type FieldProps = {
  name: ContactField;
  label: string;
  error?: string;
  isWide?: boolean;
  children: (a11y: {
    id: string;
    "aria-invalid"?: true;
    "aria-describedby"?: string;
  }) => ReactNode;
};

function Field({ name, label, error, isWide = false, children }: FieldProps) {
  const id = `contact-${name}`;
  const errorId = `${id}-error`;
  const a11y = error ? { id, "aria-invalid": true as const, "aria-describedby": errorId } : { id };

  return (
    <div className={`flex flex-col gap-2 ${isWide ? "col-span-full" : ""}`}>
      <label htmlFor={id} className="text-[0.8125rem] font-semibold text-cocoa">
        {label}
      </label>
      {children(a11y)}
      {error && (
        <p id={errorId} className="flex items-center gap-1.5 text-sm font-semibold text-rosewood">
          <ErrorIcon className="size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

export function ContactFormView({ state, formAction, isPending }: Props) {
  const errors = state.fieldErrors ?? {};
  const values = state.values ?? {};
  const isError = state.status === "error";
  const isSuccess = state.status === "success";

  return (
    <form
      action={formAction}
      aria-labelledby="contact-title"
      className="relative grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,13.75rem),1fr))] gap-5 border border-linen bg-white p-6 shadow-frame nav:p-9"
    >
      <Field name="names" label="Your names" error={errors.names}>
        {(a11y) => (
          <input {...a11y} name="names" type="text" required autoComplete="name" placeholder="Sara & Omar" defaultValue={values.names} className={fieldClass(!!errors.names)} />
        )}
      </Field>
      <Field name="email" label="Email" error={errors.email}>
        {(a11y) => (
          <input {...a11y} name="email" type="email" required autoComplete="email" placeholder="you@example.com" defaultValue={values.email} className={fieldClass(!!errors.email)} />
        )}
      </Field>
      <Field name="weddingDate" label="Wedding date" error={errors.weddingDate}>
        {(a11y) => (
          <input {...a11y} name="weddingDate" type="date" defaultValue={values.weddingDate} className={fieldClass(!!errors.weddingDate)} />
        )}
      </Field>
      <Field name="languages" label="Languages" error={errors.languages}>
        {(a11y) => (
          <input {...a11y} name="languages" type="text" placeholder="e.g. your families' languages" defaultValue={values.languages} className={fieldClass(!!errors.languages)} />
        )}
      </Field>
      <Field name="package" label="Package" error={errors.package}>
        {(a11y) => (
          <select {...a11y} name="package" defaultValue={values.package ?? "unsure"} className={fieldClass(!!errors.package, "px-3")}>
            <option value="unsure">Not sure yet</option>
            {packages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {packageOptionLabel(pkg)}
              </option>
            ))}
          </select>
        )}
      </Field>
      <Field name="city" label="Wedding city" error={errors.city}>
        {(a11y) => (
          <input {...a11y} name="city" type="text" autoComplete="address-level2" placeholder="e.g. Berlin" defaultValue={values.city} className={fieldClass(!!errors.city)} />
        )}
      </Field>
      <Field name="message" label="Anything else?" error={errors.message} isWide>
        {(a11y) => (
          <textarea {...a11y} name="message" rows={4} placeholder="Tell us about your wedding, or anything you'd like on your invitation" defaultValue={values.message} className={fieldClass(!!errors.message, "resize-y py-3")} />
        )}
      </Field>

      {/* Honeypot: invisible to people and screen readers; bots tend to fill it. */}
      <div aria-hidden="true" className="absolute -start-[9999px] top-0 size-px overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className="col-span-full flex flex-col gap-4">
        {isError && state.message && (
          <p role="alert" className="flex items-start gap-2 border-2 border-rosewood bg-white px-4 py-3 text-small font-semibold text-cocoa">
            <ErrorIcon className="mt-0.5 size-5 shrink-0 text-rosewood" />
            {state.message}
          </p>
        )}
        <p role="status" className={isSuccess ? "border border-taupe bg-sand px-4 py-3 text-small font-semibold text-cocoa" : "sr-only"}>
          {isSuccess ? state.message : ""}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-95 text-[0.8125rem] text-mocha">
            We only use these details to reply to you. See our{" "}
            <Link href="/privacy" className="text-taupe underline underline-offset-2 hover:text-cocoa">
              privacy notice
            </Link>
            .
          </p>
          <button
            type="submit"
            disabled={isPending}
            className="label min-h-12 cursor-pointer bg-taupe px-8 text-white hover:bg-cocoa disabled:cursor-wait disabled:opacity-70 motion-safe:transition-colors"
          >
            {isPending ? "Sending…" : "Send inquiry"}
          </button>
        </div>
      </div>
    </form>
  );
}
