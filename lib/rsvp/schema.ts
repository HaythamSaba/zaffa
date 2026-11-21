import { z } from "zod";
import type { RsvpField, RsvpFieldErrors } from "./types";

export const MAX_NAME_LENGTH = 120;
export const MAX_NOTES_LENGTH = 1000;
export const MIN_GUESTS = 1;
export const MAX_GUESTS = 20;

const RSVP_FIELDS = ["name", "guestCount", "attending", "notes"] as const;
const NOT_TEXT = "Please enter text.";

function isRsvpField(key: unknown): key is RsvpField {
  return typeof key === "string" && (RSVP_FIELDS as readonly string[]).includes(key);
}

/** FormData gives null for missing fields; blank strings mean "not provided". */
function blankToUndefined(value: unknown): unknown {
  if (value === null) return undefined;
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
}

const rsvpSchema = z.object({
  name: z.preprocess(
    (value) => (value === null ? "" : value),
    z
      .string({ error: NOT_TEXT })
      .trim()
      .min(1, "Please enter a name.")
      .max(MAX_NAME_LENGTH, `Name must be at most ${MAX_NAME_LENGTH} characters.`),
  ),
  guestCount: z.preprocess(
    (value) => (value === null ? "" : value),
    z.coerce
      .number({ error: "Please enter a number." })
      .int("Please enter a whole number.")
      .min(MIN_GUESTS, `Enter at least ${MIN_GUESTS} guest.`)
      .max(MAX_GUESTS, `Enter at most ${MAX_GUESTS} guests.`),
  ),
  attending: z.preprocess(
    (value) => (value === null ? "" : value),
    z.enum(["yes", "no"], { error: "Please say whether you'll attend." }).transform((value) => value === "yes"),
  ),
  notes: z.preprocess(
    blankToUndefined,
    z
      .string({ error: NOT_TEXT })
      .trim()
      .max(MAX_NOTES_LENGTH, `Notes must be at most ${MAX_NOTES_LENGTH} characters.`)
      .optional(),
  ),
});

export type RsvpSubmission = z.infer<typeof rsvpSchema>;

export type ParseResult =
  | { success: true; data: RsvpSubmission }
  | { success: false; fieldErrors: RsvpFieldErrors };

export function parseRsvpForm(formData: FormData): ParseResult {
  const raw = Object.fromEntries(RSVP_FIELDS.map((field) => [field, formData.get(field)]));
  const result = rsvpSchema.safeParse(raw);

  if (result.success) return { success: true, data: result.data };

  const fieldErrors = result.error.issues.reduce<RsvpFieldErrors>((errors, issue) => {
    const field = issue.path[0];
    if (!isRsvpField(field) || errors[field]) return errors;
    return { ...errors, [field]: issue.message };
  }, {});

  return { success: false, fieldErrors };
}
