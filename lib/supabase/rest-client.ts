import { PostgrestClient } from "@supabase/postgrest-js";
import type { Database } from "./database.types";
import { fetchWithTimeout } from "./fetch-with-timeout";

/**
 * We only need Supabase's REST API, so we use its PostgREST client directly
 * instead of @supabase/supabase-js (whose realtime module throws on Node 20
 * without a WebSocket polyfill, and which would add auth code we don't use).
 */
export type RestClient = PostgrestClient<Database>;

/**
 * Supabase API keys go in the `apikey` header. Legacy keys are JWTs and are
 * also sent as the bearer token; new sb_publishable_/sb_secret_ keys are not.
 */
export function apiKeyHeaders(key: string): Record<string, string> {
  return key.startsWith("eyJ") ? { apikey: key, Authorization: `Bearer ${key}` } : { apikey: key };
}

export function createRestClient(projectUrl: string, key: string): RestClient {
  return new PostgrestClient<Database>(`${projectUrl}/rest/v1`, {
    headers: apiKeyHeaders(key),
    fetch: fetchWithTimeout,
  });
}
