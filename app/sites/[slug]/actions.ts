"use server";

import { headers } from "next/headers";
import { getClientIp } from "@/lib/client-ip";
import { logger } from "@/lib/logger";
import { createRateLimiter } from "@/lib/rate-limit";
import { handleRsvpSubmission } from "@/lib/rsvp/handle-submission";
import { insertRsvp, lookupEventForRsvp } from "@/lib/rsvp/rsvp-store";
import type { RsvpFormState } from "@/lib/rsvp/types";

const RSVPS_PER_WINDOW = 5;
const WINDOW_MS = 10 * 60 * 1000;

const limiter = createRateLimiter({ limit: RSVPS_PER_WINDOW, windowMs: WINDOW_MS });

/**
 * Bound to a slug with `submitRsvp.bind(null, slug)` before being handed to a
 * client component, so the slug can't be tampered with from the form itself.
 */
export async function submitRsvp(
  slug: string,
  _previous: RsvpFormState,
  formData: FormData,
): Promise<RsvpFormState> {
  const requestHeaders = await headers();

  return handleRsvpSubmission(slug, formData, {
    ip: getClientIp(requestHeaders),
    limiter,
    logger,
    now: () => new Date(),
    lookupEvent: lookupEventForRsvp,
    insert: insertRsvp,
  });
}
