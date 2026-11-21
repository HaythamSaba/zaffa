import type { Logger } from "@/lib/logger";
import type { RateLimiter } from "@/lib/rate-limit";
import { parseRsvpForm, type RsvpSubmission } from "./schema";
import { RSVP_HONEYPOT_FIELD, type RsvpFormState } from "./types";

const UNKNOWN_IP_KEY = "unknown";

export const RSVP_MESSAGES = {
  rateLimited: "Too many replies from your connection. Please wait a few minutes and try again.",
  closed: "RSVP is now closed for this event.",
  failed: "We couldn't save your reply right now. Please try again in a moment.",
} as const;

export interface EventRsvpStatus {
  readonly id: string;
  readonly isOpen: boolean;
  readonly isDemo: boolean;
}

export interface SubmitRsvpDeps {
  ip: string | null;
  limiter: RateLimiter;
  logger: Logger;
  now(): Date;
  lookupEvent(slug: string, now: Date): Promise<EventRsvpStatus | null>;
  insert(eventId: string, submission: RsvpSubmission): Promise<void>;
}

function replyOf(submission: RsvpSubmission) {
  return { name: submission.name, guestCount: submission.guestCount, attending: submission.attending };
}

/** A best-effort reply for a bot's honeypot submission; never saved, so exactness doesn't matter. */
function honeypotReply(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim().slice(0, 120),
    guestCount: Number(formData.get("guestCount")) || 1,
    attending: formData.get("attending") === "yes",
  };
}

/**
 * Order: honeypot → validation → rate limit → fresh server-side event lookup
 * (never trust the page's own props for whether RSVPs are open) → insert.
 * The demo event pretends to succeed without writing anything, even if posted
 * to directly: "demo" behavior is a property of the data, not just the UI.
 */
export async function handleRsvpSubmission(
  slug: string,
  formData: FormData,
  deps: SubmitRsvpDeps,
): Promise<RsvpFormState> {
  const honeypot = formData.get(RSVP_HONEYPOT_FIELD);
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    deps.logger.warn("[rsvp] honeypot triggered; reply dropped", { slug });
    return { status: "success", reply: honeypotReply(formData) };
  }

  const parsed = parseRsvpForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      code: "invalid",
      message: "Please check the highlighted fields.",
      fieldErrors: parsed.fieldErrors,
    };
  }

  if (!deps.limiter.check(deps.ip ?? UNKNOWN_IP_KEY).allowed) {
    return { status: "error", code: "rateLimited", message: RSVP_MESSAGES.rateLimited };
  }

  const now = deps.now();
  const event = await deps.lookupEvent(slug, now);
  if (!event || !event.isOpen) {
    return { status: "error", code: "closed", message: RSVP_MESSAGES.closed };
  }

  if (event.isDemo) {
    return { status: "success", reply: replyOf(parsed.data) };
  }

  try {
    await deps.insert(event.id, parsed.data);
  } catch (error: unknown) {
    deps.logger.error("[rsvp] insert failed", {
      slug,
      reason: error instanceof Error ? error.message : "Unknown error",
    });
    return { status: "error", code: "failed", message: RSVP_MESSAGES.failed };
  }

  return { status: "success", reply: replyOf(parsed.data) };
}
