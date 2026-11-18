import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getAdminClient } from "@/lib/supabase/admin";
import { getPublicClient } from "@/lib/supabase/public";
import {
  CONTENT_COLUMNS,
  EVENT_COLUMNS,
  MEDIA_COLUMNS,
  type EventRows,
} from "./build-invitation";
import type { EventSource } from "./load-invitation";
import { verifyPreviewToken } from "./preview-token";

const INVITATION_SELECT =
  `${EVENT_COLUMNS}, content(${CONTENT_COLUMNS}), media(${MEDIA_COLUMNS})` as const;

/** An events row with its content and media embedded (PostgREST). */
export type EmbeddedEventRow = EventRows["event"] & {
  content: EventRows["content"] | null;
  media: EventRows["media"] | null;
};

export function toEventRows(row: EmbeddedEventRow): EventRows {
  const { content, media, ...event } = row;
  return { event, content: content ?? [], media: media ?? [] };
}

/** How long a published invitation is served from cache before it's re-read. */
export const INVITATION_CACHE_PROFILE = "minutes";

/** Tag for revalidateTag() when the admin edits an event (week 3+). */
export function invitationCacheTag(slug: string): string {
  return `invitation:${slug}`;
}

/**
 * Published invitations through RLS, with the publishable key. Cached for a few
 * minutes; a failed request throws, and errors are never cached.
 */
async function fetchPublished(slug: string): Promise<EventRows | null> {
  "use cache";
  cacheLife(INVITATION_CACHE_PROFILE);
  cacheTag(invitationCacheTag(slug));

  const { data, error } = await getPublicClient()
    .from("events")
    .select(INVITATION_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw new Error(`Supabase: ${error.message}`);
  return data ? toEventRows(data as EmbeddedEventRow) : null;
}

/**
 * Drafts for the Vercel review links: the service-role client reads the row
 * (bypassing RLS) and the token is checked against preview_token_hash.
 */
async function fetchDraftForPreview(slug: string, token: string): Promise<EventRows | null> {
  const { data, error } = await getAdminClient()
    .from("events")
    .select(`${INVITATION_SELECT}, preview_token_hash`)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`Supabase: ${error.message}`);
  if (!data) return null;

  const { preview_token_hash: storedHash, ...row } = data as EmbeddedEventRow & {
    preview_token_hash: string | null;
  };
  return verifyPreviewToken(token, storedHash) ? toEventRows(row) : null;
}

export const supabaseEventSource: EventSource = { fetchPublished, fetchDraftForPreview };
