const FALLBACK_SITE_URL = "http://localhost:3000";

type Env = Readonly<Record<string, string | undefined>>;

/**
 * Public origin of the marketing site, from NEXT_PUBLIC_SITE_URL.
 * Used for metadataBase, canonical URLs, the sitemap and robots.txt.
 * Invalid or non-http(s) values fall back to localhost.
 */
export function getSiteUrl(env: Env = process.env): URL {
  const raw = env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return new URL(FALLBACK_SITE_URL);

  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return new URL(FALLBACK_SITE_URL);
    }
    return new URL(url.origin);
  } catch {
    return new URL(FALLBACK_SITE_URL);
  }
}
