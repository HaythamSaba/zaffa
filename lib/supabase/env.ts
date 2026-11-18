type Env = Readonly<Record<string, string | undefined>>;

export class SupabaseConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupabaseConfigError";
  }
}

export interface SupabasePublicConfig {
  readonly url: string;
  /** The publishable (or legacy anon) key. Public by design; RLS protects data. */
  readonly anonKey: string;
}

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);

function missing(names: readonly string[]): SupabaseConfigError {
  return new SupabaseConfigError(`Missing Supabase configuration: ${names.join(", ")}`);
}

/** Reads the project URL and publishable key. Throws naming (never echoing) what is missing. */
export function getSupabasePublicConfig(env: Env = process.env): SupabasePublicConfig {
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

  const absent = [
    ...(url ? [] : ["NEXT_PUBLIC_SUPABASE_URL"]),
    ...(anonKey ? [] : ["NEXT_PUBLIC_SUPABASE_ANON_KEY"]),
  ];
  if (absent.length > 0) throw missing(absent);

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new SupabaseConfigError("NEXT_PUBLIC_SUPABASE_URL is not a valid URL");
  }
  const isLocal = LOCAL_HOSTS.has(parsed.hostname);
  if (parsed.protocol !== "https:" && !(isLocal && parsed.protocol === "http:")) {
    throw new SupabaseConfigError("NEXT_PUBLIC_SUPABASE_URL must use https");
  }

  return { url: parsed.origin, anonKey };
}

/** The server-only secret key. Bypasses RLS: only for lib/supabase/admin.ts. */
export function getServiceRoleKey(env: Env = process.env): string {
  const key = env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  if (!key) throw missing(["SUPABASE_SERVICE_ROLE_KEY"]);
  return key;
}
