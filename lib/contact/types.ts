export const CONTACT_FIELDS = [
  "names",
  "email",
  "weddingDate",
  "languages",
  "package",
  "city",
  "message",
] as const;

export type ContactField = (typeof CONTACT_FIELDS)[number];

/** Hidden field that humans never fill in. */
export const HONEYPOT_FIELD = "website";

export const PACKAGE_CHOICES = ["unsure", "essential", "premium", "bespoke"] as const;

export type PackageChoice = (typeof PACKAGE_CHOICES)[number];

export type FieldErrors = Partial<Record<ContactField, string>>;

export type FieldValues = Partial<Record<ContactField, string>>;

export interface ContactFormState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: FieldErrors;
  /** Echoed back on error so the visitor keeps what they typed. */
  values?: FieldValues;
}

export const initialContactState: ContactFormState = { status: "idle" };

export function isContactField(key: unknown): key is ContactField {
  return typeof key === "string" && (CONTACT_FIELDS as readonly string[]).includes(key);
}
