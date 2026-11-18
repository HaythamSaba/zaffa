import { getPublicClient } from "@/lib/supabase/public";

/**
 * event_hosts → events.slug with the publishable key. RLS only returns hosts
 * of published events, so drafts never resolve from a custom domain.
 */
export async function fetchSlugForHost(host: string): Promise<string | null> {
  const { data, error } = await getPublicClient()
    .from("event_hosts")
    .select("events(slug)")
    .eq("host", host)
    .maybeSingle();
  if (error) throw new Error(`Supabase: ${error.message}`);
  return data?.events?.slug ?? null;
}

/** The slug if a published event has it, else null (RLS hides drafts). */
export async function fetchPublishedSlug(slug: string): Promise<string | null> {
  const { data, error } = await getPublicClient()
    .from("events")
    .select("slug")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw new Error(`Supabase: ${error.message}`);
  return data?.slug ?? null;
}
