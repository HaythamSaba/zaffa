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

  return async (host) => {
    const cached = cache.get(host);
    if (cached && cached.expiresAt > now()) return cached.slug;

    const slug = await fetchSlug(host);
    cache.delete(host);
    cache.set(host, { slug, expiresAt: now() + options.ttlMs });
    if (cache.size > maxEntries) {
      const oldest = cache.keys().next().value;
      if (oldest !== undefined) cache.delete(oldest);
    }
    return slug;
  };
}
