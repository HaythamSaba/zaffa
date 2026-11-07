export class ContactConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContactConfigError";
  }
}

export type ContactConfig =
  | { mode: "dry-run" }
  | { mode: "send"; apiKey: string; to: string; from: string };

type Env = Readonly<Record<string, string | undefined>>;

const REQUIRED = ["RESEND_API_KEY", "CONTACT_TO_EMAIL", "CONTACT_FROM_EMAIL"] as const;

/**
 * Reads contact-form settings. CONTACT_DRY_RUN=1 skips sending, but is ignored
 * when NODE_ENV is "production" so it can never silently disable the live form.
 * Throws ContactConfigError naming (never echoing) any missing variables.
 */
export function getContactConfig(env: Env = process.env): ContactConfig {
  const isProduction = env.NODE_ENV === "production";
  if (!isProduction && env.CONTACT_DRY_RUN === "1") return { mode: "dry-run" };

  const values = REQUIRED.map((name) => [name, env[name]?.trim() ?? ""] as const);
  const missing = values.filter(([, value]) => value === "").map(([name]) => name);

  if (missing.length > 0) {
    throw new ContactConfigError(`Missing contact form configuration: ${missing.join(", ")}`);
  }

  const [apiKey, to, from] = values.map(([, value]) => value);
  return { mode: "send", apiKey, to, from };
}
