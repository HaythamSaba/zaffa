import type { Logger } from "@/lib/logger";
import type { RateLimiter } from "@/lib/rate-limit";
import { siteConfig } from "@/lib/site-config";
import { MAX_MESSAGE_LENGTH, parseContactForm, type ContactInquiry } from "./schema";
import {
  CONTACT_FIELDS,
  HONEYPOT_FIELD,
  type ContactFormState,
  type FieldValues,
} from "./types";

export { HONEYPOT_FIELD };

const UNKNOWN_IP_KEY = "unknown";

export const CONTACT_MESSAGES = {
  success: "Thank you! We'll reply within a day with availability and next steps.",
  invalid: "Please check the highlighted fields.",
  rateLimited:
    "Too many messages from your connection. Please wait a few minutes and try again, or email us directly.",
  failed: `We couldn't send your message right now. Please try again in a moment, or email us at ${siteConfig.contact.email.label}.`,
} as const;

export type DeliverResult = { ok: true } | { ok: false; reason: string };

export interface InquiryDeps {
  ip: string | null;
  limiter: RateLimiter;
  deliver(inquiry: ContactInquiry): Promise<DeliverResult>;
  logger: Logger;
  now(): Date;
}

/** Longest value echoed back on error; matches the longest field (the message). */
const MAX_ECHO_LENGTH = MAX_MESSAGE_LENGTH;

function submittedValues(formData: FormData): FieldValues {
  return CONTACT_FIELDS.reduce<FieldValues>((values, field) => {
    const value = formData.get(field);
    return typeof value === "string"
      ? { ...values, [field]: value.slice(0, MAX_ECHO_LENGTH) }
      : values;
  }, {});
}

async function tryDeliver(inquiry: ContactInquiry, deps: InquiryDeps): Promise<DeliverResult> {
  try {
    return await deps.deliver(inquiry);
  } catch (error: unknown) {
    return { ok: false, reason: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Order: honeypot → validation → rate limit → delivery.
 * Only valid, deliverable inquiries count toward the limit, so typos never lock
 * a visitor out; invalid or bot submissions cost nothing because nothing is sent.
 */
export async function handleInquiry(
  formData: FormData,
  deps: InquiryDeps,
): Promise<ContactFormState> {
  const values = submittedValues(formData);

  const honeypot = formData.get(HONEYPOT_FIELD);
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    deps.logger.warn("[contact] honeypot triggered; inquiry dropped");
    return { status: "success", message: CONTACT_MESSAGES.success };
  }

  const parsed = parseContactForm(formData, deps.now());
  if (!parsed.success) {
    return {
      status: "error",
      message: CONTACT_MESSAGES.invalid,
      fieldErrors: parsed.fieldErrors,
      values,
    };
  }

  if (!deps.limiter.check(deps.ip ?? UNKNOWN_IP_KEY).allowed) {
    return { status: "error", message: CONTACT_MESSAGES.rateLimited, values };
  }

  const result = await tryDeliver(parsed.data, deps);
  if (!result.ok) {
    deps.logger.error("[contact] delivery failed", { reason: result.reason });
    return { status: "error", message: CONTACT_MESSAGES.failed, values };
  }

  return { status: "success", message: CONTACT_MESSAGES.success };
}
