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
