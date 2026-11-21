export class DashboardConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DashboardConfigError";
  }
}

type Env = Readonly<Record<string, string | undefined>>;

/** HMAC-SHA256 keys are safe well under this; a floor just catches accidental weak values. */
const MIN_SECRET_LENGTH = 32;

/** Reads the dashboard session-signing secret. Throws naming (never echoing) the problem. */
export function getDashboardSessionSecret(env: Env = process.env): string {
  const secret = env.DASHBOARD_SESSION_SECRET?.trim() ?? "";
  if (!secret) throw new DashboardConfigError("Missing dashboard configuration: DASHBOARD_SESSION_SECRET");
  if (secret.length < MIN_SECRET_LENGTH) {
    throw new DashboardConfigError(`DASHBOARD_SESSION_SECRET must be at least ${MIN_SECRET_LENGTH} characters`);
  }
  return secret;
}
