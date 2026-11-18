import "server-only";
import { cache } from "react";
import { logger } from "@/lib/logger";
import { loadInvitation, type LoadResult } from "./load-invitation";
import { supabaseEventSource } from "./supabase-source";

/**
 * Loads an invitation once per request (the layout and the page both need
 * it). Published rows are also cached across requests in supabase-source.
 */
export const getInvitation = cache(
  (slug: string, previewToken?: string): Promise<LoadResult> =>
    loadInvitation(slug, previewToken, supabaseEventSource, logger),
);
