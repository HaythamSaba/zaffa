"use server";

import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";
import { getClientIp } from "@/lib/client-ip";
import { checkDashboardLogin } from "@/lib/dashboard/auth";
import { getDashboardSessionSecret } from "@/lib/dashboard/env";
import { dashboardMessage } from "@/lib/dashboard/messages";
import { getDashboardEvent, updateRsvpRow, deleteRsvpRow } from "@/lib/dashboard/rsvp-store";
import { SESSION_COOKIE_NAME, SESSION_TTL_MS, signSession } from "@/lib/dashboard/session";
import type { RsvpEdit } from "@/lib/dashboard/types";
import { logger } from "@/lib/logger";
import { createRateLimiter } from "@/lib/rate-limit";

const LOGIN_ATTEMPTS_PER_WINDOW = 10;
const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const limiter = createRateLimiter({ limit: LOGIN_ATTEMPTS_PER_WINDOW, windowMs: LOGIN_WINDOW_MS });

// Never matches a real password; keeps "no password set yet" on the same
// bcrypt-timed, rate-limited path as a real check, and off the same bucket.
const UNCONFIGURED_HASH = bcrypt.hashSync("zaffa-dashboard-not-configured", 12);

export type LoginFormState = { status: "idle" } | { status: "success" } | { status: "error"; message: string };

/** Bound to a slug with `login.bind(null, slug)` before being handed to the login form. */
export async function login(
  slug: string,
  _previous: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const password = String(formData.get("password") ?? "");
  const ip = getClientIp(await headers());

  const event = await getDashboardEvent(slug);
  const result = await checkDashboardLogin(event?.passwordHash ?? UNCONFIGURED_HASH, password, {
    limiter,
    ip,
    slug,
  });

  if (!result.ok) {
    if (result.reason === "rateLimited") {
      return { status: "error", message: dashboardMessage("login.error.rateLimited") };
    }
    if (!event?.passwordHash) {
      logger.warn("[dashboard] login attempted before a password was set", { slug });
      return { status: "error", message: dashboardMessage("login.error.unconfigured") };
    }
    return { status: "error", message: dashboardMessage("login.error.invalid") };
  }

  // event.passwordHash is set whenever checkDashboardLogin can succeed (never against UNCONFIGURED_HASH).
  const token = signSession(event!.id, event!.passwordHash!, new Date(), getDashboardSessionSecret());
  (await cookies()).set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: SESSION_TTL_MS / 1000,
  });

  return { status: "success" };
}

export async function logout(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE_NAME);
}

export interface SaveRsvpResult {
  readonly ok: boolean;
}

/** Bound to a slug and event id; the couple can edit or delete, per CLAUDE.md's dashboard rules. */
export async function saveRsvpEdit(eventId: string, id: string, edit: RsvpEdit): Promise<SaveRsvpResult> {
  const ok = await updateRsvpRow(eventId, id, edit);
  return { ok };
}

export async function removeRsvp(eventId: string, id: string): Promise<SaveRsvpResult> {
  const ok = await deleteRsvpRow(eventId, id);
  return { ok };
}
