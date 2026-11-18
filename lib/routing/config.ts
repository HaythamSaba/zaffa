import { isValidSlug } from "@/lib/events/slug";
import { normalizeHost } from "./resolve-host";

export interface RoutingConfig {
  /** e.g. "zaffa.com"; subdomains of it map straight to slugs. Null = none. */
  readonly rootDomain: string | null;
  /** Hosts (lowercase, no port) that serve the marketing site. */
  readonly marketingHosts: ReadonlySet<string>;
  /** The couple served at /sample on the marketing hosts. */
  readonly demoSlug: string;
  /** /sites/<slug> directly on a marketing host (local testing only). */
  readonly allowSitesPath: boolean;
}

type Env = Readonly<Record<string, string | undefined>>;

export const DEFAULT_DEMO_SLUG = "layla-and-adam";
const DEVELOPMENT_MARKETING_HOSTS = ["localhost", "127.0.0.1"];
/** Vercel sets these to the deployment's own addresses; they serve marketing. */
const VERCEL_HOST_VARIABLES = ["VERCEL_URL", "VERCEL_BRANCH_URL", "VERCEL_PROJECT_PRODUCTION_URL"];

function hostList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((entry) => normalizeHost(entry))
    .filter((host): host is string => host !== null);
}

/** Reads ROOT_DOMAIN, MARKETING_HOSTS and DEMO_SLUG. Invalid values are ignored. */
export function getRoutingConfig(env: Env = process.env): RoutingConfig {
  const isProduction = env.NODE_ENV === "production";
  const rootDomain = normalizeHost(env.ROOT_DOMAIN);

  const hosts = [
    ...hostList(env.MARKETING_HOSTS),
    ...VERCEL_HOST_VARIABLES.flatMap((name) => hostList(env[name])),
    ...(isProduction ? [] : DEVELOPMENT_MARKETING_HOSTS),
    ...(rootDomain ? [rootDomain, `www.${rootDomain}`] : []),
  ];

  const demoSlug = env.DEMO_SLUG?.trim();

  return {
    rootDomain,
    marketingHosts: new Set(hosts),
    demoSlug: isValidSlug(demoSlug) ? demoSlug : DEFAULT_DEMO_SLUG,
    allowSitesPath: !isProduction,
  };
}
