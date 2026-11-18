import { isValidSlug } from "@/lib/events/slug";
import type { RoutingConfig } from "./config";

/** Lowercase DNS name: labels of letters, digits and inner hyphens. */
const HOST = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/;
const MAX_HOST_LENGTH = 253;
const SITES_PREFIX = "/sites";
const SAMPLE_PREFIX = "/sample";
/** Page shown when a custom domain's invitation can't be looked up (app/(status)/invitation-unavailable). */
export const UNAVAILABLE_PATH = "/invitation-unavailable";

export type HostRoute =
  | { readonly kind: "marketing" }
  | { readonly kind: "slug"; readonly slug: string }
  | { readonly kind: "lookup"; readonly host: string }
  | { readonly kind: "unknown" };

export type RouteDecision =
  | { readonly action: "next" }
  | { readonly action: "rewrite"; readonly pathname: string }
  | { readonly action: "not-found" }
  | { readonly action: "unavailable" };

/** Resolves a host from event_hosts to a slug, or null when none matches. */
export type HostLookup = (host: string) => Promise<string | null>;

export interface RouteLookups {
  /** Custom domains and per-couple *.vercel.app names → slug (event_hosts). */
  readonly host: HostLookup;
  /** The slug itself if a published event has it, else null (ROOT_DOMAIN subdomains). */
  readonly publishedSlug: HostLookup;
}

/** Request header proxy.ts sets on invitation rewrites: the public path prefix ("" or "/sample"). */
export const INVITATION_PREFIX_HEADER = "x-zaffa-invitation-prefix";

/**
 * The part of the public URL that stands for /sites/<slug>: "" on a couple's
 * own host, "/sample" for the demo on the marketing site. Used to build
 * absolute URLs guests can open (e.g. the WhatsApp preview image).
 */
export function publicPrefixFor(publicPathname: string, rewrittenPathname: string): string {
  const rest = rewrittenPathname.replace(/^\/sites\/[^/]+/, "");
  if (!rest) return publicPathname === "/" ? "" : publicPathname;
  return publicPathname.slice(0, publicPathname.length - rest.length);
}

/** "Layla.Example.com:3000" → "layla.example.com"; null for anything malformed (incl. IPv6). */
export function normalizeHost(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const host = raw.trim().toLowerCase().replace(/:\d+$/, "").replace(/\.$/, "");
  if (host.length === 0 || host.length > MAX_HOST_LENGTH || !HOST.test(host)) return null;
  return host;
}

export function classifyHost(rawHost: string | null | undefined, config: RoutingConfig): HostRoute {
  const host = normalizeHost(rawHost);
  if (!host) return { kind: "unknown" };
  if (config.marketingHosts.has(host)) return { kind: "marketing" };

  if (config.rootDomain && host.endsWith(`.${config.rootDomain}`)) {
    const label = host.slice(0, -(config.rootDomain.length + 1));
    return isValidSlug(label) ? { kind: "slug", slug: label } : { kind: "unknown" };
  }

  // event_hosts only stores names with a dot; single labels can't match.
  return host.includes(".") ? { kind: "lookup", host } : { kind: "unknown" };
}

function isUnder(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function siteRewrite(slug: string, pathname: string): RouteDecision {
  const rest = pathname === "/" ? "" : pathname;
  return { action: "rewrite", pathname: `${SITES_PREFIX}/${slug}${rest}` };
}

function marketingRoute(pathname: string, config: RoutingConfig): RouteDecision {
  if (isUnder(pathname, SAMPLE_PREFIX)) {
    return siteRewrite(config.demoSlug, pathname.slice(SAMPLE_PREFIX.length) || "/");
  }
  if (isUnder(pathname, SITES_PREFIX)) {
    return config.allowSitesPath ? { action: "next" } : { action: "not-found" };
  }
  return { action: "next" };
}

function coupleRoute(slug: string, pathname: string): RouteDecision {
  // Guests never see /sites/, and one couple's host can't reach another couple.
  if (isUnder(pathname, SITES_PREFIX)) return { action: "not-found" };
  return siteRewrite(slug, pathname);
}

/**
 * Decides what the proxy does with a request. A failing lookup (e.g. Supabase
 * unreachable) becomes "unavailable" so guests see a friendly page.
 */
export async function routeRequest(
  request: { readonly host: string | null; readonly pathname: string; readonly hasPreviewToken?: boolean },
  config: RoutingConfig,
  lookups: RouteLookups,
): Promise<RouteDecision> {
  const route = classifyHost(request.host, config);

  switch (route.kind) {
    case "marketing":
      return marketingRoute(request.pathname, config);
    case "slug":
      return subdomainRoute(route.slug, request, lookups.publishedSlug);
    case "unknown":
      return { action: "not-found" };
    case "lookup": {
      let slug: string | null;
      try {
        slug = await lookups.host(route.host);
      } catch {
        return { action: "unavailable" };
      }
      return slug ? coupleRoute(slug, request.pathname) : { action: "not-found" };
    }
  }
}

/**
 * <slug>.ROOT_DOMAIN: a real 404 when no published event has the slug. Draft
 * preview links skip the check (the page validates the token), and a failed
 * check still rewrites so the page can show "temporarily unavailable".
 */
async function subdomainRoute(
  slug: string,
  request: { readonly pathname: string; readonly hasPreviewToken?: boolean },
  publishedSlug: HostLookup,
): Promise<RouteDecision> {
  if (request.hasPreviewToken) return coupleRoute(slug, request.pathname);
  try {
    if ((await publishedSlug(slug)) === null) return { action: "not-found" };
  } catch {
    // Fall through: the page shows the unavailable notice.
  }
  return coupleRoute(slug, request.pathname);
}
