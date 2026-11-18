import type { HostLookup } from "./resolve-host";

export interface CachedLookupOptions {
  /** How long a result (found or not) is reused. */
  readonly ttlMs: number;
  readonly now?: () => number;
  /** Oldest entries are evicted beyond this many hosts. */
  readonly maxEntries?: number;
}

const DEFAULT_MAX_ENTRIES = 1000;

interface Entry {
  readonly slug: string | null;
  readonly expiresAt: number;
}

/**
 * Wraps a host → slug lookup with a small in-memory cache. Misses are cached
 * too, so unknown hosts don't reach the database on every request. Errors are
 * never cached. Per server instance, like lib/rate-limit.ts.
 */
export function createCachedLookup(fetchSlug: HostLookup, options: CachedLookupOptions): HostLookup {
  const now = options.now ?? Date.now;
  const maxEntries = options.maxEntries ?? DEFAULT_MAX_ENTRIES;
  const cache = new Map<string, Entry>();
  /** Lookups in flight: concurrent requests for the same key share one query. */
  const pending = new Map<string, Promise<string | null>>();

  function remember(host: string, slug: string | null): void {
    cache.delete(host);
    cache.set(host, { slug, expiresAt: now() + options.ttlMs });
    if (cache.size > maxEntries) {
      const oldest = cache.keys().next().value;
      if (oldest !== undefined) cache.delete(oldest);
    }
  }

  return (host) => {
    const cached = cache.get(host);
    if (cached && cached.expiresAt > now()) return Promise.resolve(cached.slug);

    const inFlight = pending.get(host);
    if (inFlight) return inFlight;

    const request = fetchSlug(host)
      .then((slug) => {
        remember(host, slug);
        return slug;
      })
      .finally(() => pending.delete(host));
    pending.set(host, request);
    return request;
  };
}
