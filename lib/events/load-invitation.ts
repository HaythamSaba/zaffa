import type { Logger } from "@/lib/logger";
import { buildInvitation, type EventRows, type InvitationData } from "./build-invitation";
import { isValidSlug } from "./slug";

/** Where invitation rows come from (Supabase in the app, a fake in tests). */
export interface EventSource {
  /** The published event with this slug, or null. */
  fetchPublished(slug: string): Promise<EventRows | null>;
  /** A draft (or any) event whose preview token matches, or null. */
  fetchDraftForPreview(slug: string, token: string): Promise<EventRows | null>;
}

export type LoadResult =
  | { readonly status: "ok"; readonly invitation: InvitationData; readonly preview: boolean }
  | { readonly status: "not-found" }
  | { readonly status: "unavailable" };

function reasonOf(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

/**
 * Loads one invitation. Unknown slugs are "not-found"; a database or data
 * problem is "unavailable" (logged, never thrown) so guests see a friendly page.
 */
export async function loadInvitation(
  slug: string,
  previewToken: string | undefined,
  source: EventSource,
  logger: Logger,
): Promise<LoadResult> {
  if (!isValidSlug(slug)) return { status: "not-found" };

  try {
    const published = await source.fetchPublished(slug);
    if (published) {
      return { status: "ok", invitation: buildInvitation(published), preview: false };
    }

    if (previewToken) {
      const draft = await source.fetchDraftForPreview(slug, previewToken);
      if (draft) return { status: "ok", invitation: buildInvitation(draft), preview: true };
    }

    return { status: "not-found" };
  } catch (error) {
    logger.error("Invitation could not be loaded", {
      slug,
      reason: reasonOf(error),
      kind: error instanceof Error ? error.name : typeof error,
    });
    return { status: "unavailable" };
  }
}
