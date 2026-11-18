import "server-only";
import { headers } from "next/headers";
import { cache } from "react";
import { getClientIp } from "@/lib/client-ip";
import { logger } from "@/lib/logger";
import { createRateLimiter } from "@/lib/rate-limit";
import { PREVIEW_TOKEN_HEADER } from "@/lib/routing/resolve-host";
import { loadInvitation, type LoadResult } from "./load-invitation";
import { isPlausiblePreviewToken } from "./preview-token";
import { supabaseEventSource } from "./supabase-source";

/** Draft previews query the database uncached (service role), so they're rate-limited per IP. */
const PREVIEWS_PER_WINDOW = 30;
const PREVIEW_WINDOW_MS = 60_000;
const previewLimiter = createRateLimiter({ limit: PREVIEWS_PER_WINDOW, windowMs: PREVIEW_WINDOW_MS });

/** The ?preview= token proxy.ts passed on (only well-formed tokens), for layouts and pages. */
async function requestPreviewToken(): Promise<string | undefined> {
  const token = (await headers()).get(PREVIEW_TOKEN_HEADER);
  return isPlausiblePreviewToken(token) ? token : undefined;
}

/**
 * Loads an invitation once per request (the layout, metadata and page all
 * need it), including a draft when the request carries a valid preview token.
 * Published rows are also cached across requests in supabase-source.
 */
export const getInvitation = cache(async (slug: string): Promise<LoadResult> => {
  let previewToken = await requestPreviewToken();
  if (previewToken) {
    const ip = getClientIp(await headers()) ?? "unknown";
    if (!previewLimiter.check(`preview:${ip}`).allowed) {
      logger.warn("Draft preview lookups rate-limited", { slug });
      previewToken = undefined;
    }
  }
  return loadInvitation(slug, previewToken, supabaseEventSource, logger);
});
