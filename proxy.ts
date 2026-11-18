import { NextResponse, type NextRequest } from "next/server";
import { logger } from "@/lib/logger";
import { getRoutingConfig } from "@/lib/routing/config";
import { fetchPublishedSlug, fetchSlugForHost } from "@/lib/routing/fetch-host-slug";
import { createCachedLookup } from "@/lib/routing/host-cache";
import { UNAVAILABLE_PATH, routeRequest, type HostLookup, type RouteLookups } from "@/lib/routing/resolve-host";

/**
 * Host-based routing (CLAUDE.md "Routing"):
 * - MARKETING_HOSTS (and Vercel's own deployment hosts) serve the marketing
 *   site; /sample there serves the demo couple.
 * - <slug>.ROOT_DOMAIN rewrites to /sites/<slug> after checking a published
 *   event has that slug (else a real 404; ?preview= links skip the check).
 * - Any other host (custom domain, per-couple *.vercel.app) is looked up in
 *   event_hosts.
 * Both lookups are cached for 60 s, misses included. Guests never see /sites/.
 */

const LOOKUP_CACHE_TTL_MS = 60_000;
/** Matches no route, so Next renders the 404 page with a 404 status. */
const NOT_FOUND_PATH = "/__not-found";

const routing = getRoutingConfig();

function cachedAndLogged(name: string, fetch: HostLookup): HostLookup {
  return createCachedLookup(
    async (key) => {
      try {
        return await fetch(key);
      } catch (error) {
        logger.error(`${name} failed`, {
          key,
          reason: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    },
    { ttlMs: LOOKUP_CACHE_TTL_MS },
  );
}

const lookups: RouteLookups = {
  host: cachedAndLogged("Host lookup", fetchSlugForHost),
  publishedSlug: cachedAndLogged("Published slug check", fetchPublishedSlug),
};

function rewriteTo(request: NextRequest, pathname: string): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.rewrite(url);
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const decision = await routeRequest(
    {
      host: request.headers.get("host"),
      pathname: request.nextUrl.pathname,
      hasPreviewToken: request.nextUrl.searchParams.has("preview"),
    },
    routing,
    lookups,
  );

  switch (decision.action) {
    case "next":
      return NextResponse.next();
    case "rewrite":
      return rewriteTo(request, decision.pathname);
    case "unavailable":
      return rewriteTo(request, UNAVAILABLE_PATH);
    case "not-found":
      return rewriteTo(request, NOT_FOUND_PATH);
  }
}

export const config = {
  matcher: [
    // Everything except Next internals and static files from public/.
    "/((?!_next/static|_next/image|favicon\\.ico|images/|brand/|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico|woff2?|txt|xml)$).*)",
  ],
};
