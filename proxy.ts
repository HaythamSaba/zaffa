import { NextResponse, type NextRequest } from "next/server";
import { logger } from "@/lib/logger";
import { getRoutingConfig } from "@/lib/routing/config";
import { fetchSlugForHost } from "@/lib/routing/fetch-host-slug";
import { createCachedLookup } from "@/lib/routing/host-cache";
import { UNAVAILABLE_PATH, routeRequest } from "@/lib/routing/resolve-host";

/**
 * Host-based routing (CLAUDE.md "Routing"):
 * - MARKETING_HOSTS (and Vercel's own deployment hosts) serve the marketing
 *   site; /sample there serves the demo couple.
 * - <slug>.ROOT_DOMAIN rewrites to /sites/<slug> with no database lookup.
 * - Any other host (custom domain, per-couple *.vercel.app) is looked up in
 *   event_hosts (cached 60 s, misses included).
 * Guests never see /sites/ in the address bar.
 */

const HOST_CACHE_TTL_MS = 60_000;
/** Matches no route, so Next renders the 404 page with a 404 status. */
const NOT_FOUND_PATH = "/__not-found";

const routing = getRoutingConfig();

const lookup = createCachedLookup(
  async (host) => {
    try {
      return await fetchSlugForHost(host);
    } catch (error) {
      logger.error("Host lookup failed", {
        host,
        reason: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  },
  { ttlMs: HOST_CACHE_TTL_MS },
);

function rewriteTo(request: NextRequest, pathname: string): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.rewrite(url);
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const decision = await routeRequest(
    { host: request.headers.get("host"), pathname: request.nextUrl.pathname },
    routing,
    lookup,
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
