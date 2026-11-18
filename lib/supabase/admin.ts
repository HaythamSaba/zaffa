import "server-only";
import { getServiceRoleKey, getSupabasePublicConfig } from "./env";
import { createRestClient, type RestClient } from "./rest-client";

let client: RestClient | undefined;

/**
 * Supabase REST client with the service-role key. BYPASSES RLS. Server code
 * only (guarded by `server-only`); never pass its results to the client
 * unfiltered. Used for draft previews now and the couple's dashboard in week 3.
 */
export function getAdminClient(): RestClient {
  if (!client) {
    const { url } = getSupabasePublicConfig();
    client = createRestClient(url, getServiceRoleKey());
  }
  return client;
}
