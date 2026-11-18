import { getSupabasePublicConfig } from "./env";
import { createRestClient, type RestClient } from "./rest-client";

let client: RestClient | undefined;

/**
 * Supabase REST client with the publishable key: it sees exactly what a guest
 * may see (RLS). Used on the server and in proxy.ts.
 */
export function getPublicClient(): RestClient {
  if (!client) {
    const { url, anonKey } = getSupabasePublicConfig();
    client = createRestClient(url, anonKey);
  }
  return client;
}
