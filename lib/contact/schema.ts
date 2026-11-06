import { z } from "zod";
import {
  CONTACT_FIELDS,
  PACKAGE_CHOICES,
  isContactField,
  type FieldErrors,
} from "./types";

export const MAX_NAMES_LENGTH = 120;
export const MAX_EMAIL_LENGTH = 254;
export const MAX_SHORT_TEXT_LENGTH = 200;
export const MAX_MESSAGE_LENGTH = 2000;

const DAY_MS = 24 * 60 * 60 * 1000;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const NOT_TEXT = "Please enter text.";

/** FormData gives null for missing fields; blank strings mean "not provided". */
function blankToUndefined(value: unknown): unknown {
  if (value === null) return undefined;
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
}

function optionalText(max: number, label: string) {
  return z.preprocess(
    blankToUndefined,
    z
      .string({ error: NOT_TEXT })
      .trim()
      .max(max, `${label} must be at most ${max} characters.`)
      .optional(),
  );
}

/** Safe on any input: Zod 4 still runs refinements after a failed regex. */
function isRealDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/** Earliest allowed date: yesterday (UTC), to tolerate visitors' time zones. */
function earliestDate(now: Date): string {
  return new Date(now.getTime() - DAY_MS).toISOString().slice(0, 10);
}

function createContactSchema(now: Date) {
  return z.object({
    names: z.preprocess(
      (value) => (value === null ? "" : value),
      z
        .string({ error: NOT_TEXT })
        .trim()
        .min(1, "Please enter your names.")
        .max(MAX_NAMES_LENGTH, `Names must be at most ${MAX_NAMES_LENGTH} characters.`),
    ),
    email: z.preprocess(
      (value) => (value === null ? "" : value),
      z
        .string({ error: NOT_TEXT })
        .trim()
        .min(1, "Please enter your email address.")
        .max(MAX_EMAIL_LENGTH, "That email address is too long.")
        .pipe(z.email("Enter a valid email address.")),
    ),
    weddingDate: z.preprocess(
      blankToUndefined,
      z
        .string({ error: NOT_TEXT })
        .refine(isRealDate, "Enter a valid date.")
        .refine(
          (value) => !isRealDate(value) || value >= earliestDate(now),
          "The wedding date can't be in the past.",
        )
        .optional(),
    ),
    languages: optionalText(MAX_SHORT_TEXT_LENGTH, "Languages"),
    package: z.preprocess(
      blankToUndefined,
      z.enum(PACKAGE_CHOICES, { error: "Please choose a package from the list." }).default("unsure"),
    ),
    city: optionalText(MAX_SHORT_TEXT_LENGTH, "City"),
    message: optionalText(MAX_MESSAGE_LENGTH, "Your message"),
  });
}

export type ContactInquiry = z.infer<ReturnType<typeof createContactSchema>>;

export type ParseResult =
  | { success: true; data: ContactInquiry }
  | { success: false; fieldErrors: FieldErrors };

export function parseContactForm(formData: FormData, now: Date = new Date()): ParseResult {
  const raw = Object.fromEntries(CONTACT_FIELDS.map((field) => [field, formData.get(field)]));
  const result = createContactSchema(now).safeParse(raw);

  if (result.success) return { success: true, data: result.data };

  const fieldErrors = result.error.issues.reduce<FieldErrors>((errors, issue) => {
    const field = issue.path[0];
    if (!isContactField(field) || errors[field]) return errors;
    return { ...errors, [field]: issue.message };
  }, {});

  return { success: false, fieldErrors };
}
