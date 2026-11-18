/** How long a Supabase request may take before the invitation shows as unavailable. */
export const SUPABASE_TIMEOUT_MS = 5000;

/**
 * fetch with a timeout, so an unreachable database fails fast (and guests see
 * the "temporarily unavailable" page) instead of hanging the request.
 */
export function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const timeout = AbortSignal.timeout(SUPABASE_TIMEOUT_MS);
  const signal = init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
  return fetch(input, { ...init, signal });
}
