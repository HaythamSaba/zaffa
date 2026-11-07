"use server";

import { headers } from "next/headers";
import { getClientIp } from "@/lib/client-ip";
import { createResendClient, sendInquiryEmail } from "@/lib/contact/email";
import { getContactConfig } from "@/lib/contact/env";
import { handleInquiry, type DeliverResult } from "@/lib/contact/handle-inquiry";
import type { ContactInquiry } from "@/lib/contact/schema";
import type { ContactFormState } from "@/lib/contact/types";
import { logger } from "@/lib/logger";
import { createRateLimiter } from "@/lib/rate-limit";

const INQUIRIES_PER_WINDOW = 5;
const WINDOW_MS = 10 * 60 * 1000;

const limiter = createRateLimiter({ limit: INQUIRIES_PER_WINDOW, windowMs: WINDOW_MS });

async function deliver(inquiry: ContactInquiry): Promise<DeliverResult> {
  const config = getContactConfig();
  if (config.mode === "dry-run") {
    logger.warn("[contact] CONTACT_DRY_RUN=1: inquiry accepted, email not sent");
    return { ok: true };
  }
  return sendInquiryEmail(inquiry, config, createResendClient(config.apiKey));
}

export async function submitInquiry(
  _previous: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const requestHeaders = await headers();

  return handleInquiry(formData, {
    ip: getClientIp(requestHeaders),
    limiter,
    deliver,
    logger,
    now: () => new Date(),
  });
}
