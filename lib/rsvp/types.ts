/** Hidden field that humans never fill in (distinct from the contact form's). */
export const RSVP_HONEYPOT_FIELD = "rsvp-note";

export type RsvpField = "name" | "guestCount" | "attending" | "notes";

export type RsvpFieldErrors = Partial<Record<RsvpField, string>>;

/** What the "received" screen shows back; never more than what was saved. */
export interface RsvpReply {
  readonly name: string;
  readonly guestCount: number;
  readonly attending: boolean;
}

/** Lets the (bilingual) UI pick its own localized copy instead of the server's English text. */
export type RsvpErrorCode = "invalid" | "rateLimited" | "closed" | "failed";

export type RsvpFormState =
  | { readonly status: "idle" }
  | { readonly status: "success"; readonly reply: RsvpReply }
  | {
      readonly status: "error";
      readonly code: RsvpErrorCode;
      readonly message: string;
      readonly fieldErrors?: RsvpFieldErrors;
    };

export const initialRsvpState: RsvpFormState = { status: "idle" };

/** A real, bound Server Action: `(prevState, formData) => RsvpFormState`. */
export type SubmitRsvpAction = (
  state: RsvpFormState,
  formData: FormData,
) => Promise<RsvpFormState>;
