import bcrypt from "bcryptjs";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { signSession } from "@/lib/dashboard/session";

const SECRET = "test-secret-at-least-32-bytes-long-ok-ok";

vi.mock("@/lib/dashboard/env", () => ({
  getDashboardSessionSecret: () => SECRET,
}));

const mockGetDashboardEvent = vi.fn();
const mockUpdateRsvpRow = vi.fn();
const mockDeleteRsvpRow = vi.fn();
vi.mock("@/lib/dashboard/rsvp-store", () => ({
  getDashboardEvent: (...args: unknown[]) => mockGetDashboardEvent(...args),
  updateRsvpRow: (...args: unknown[]) => mockUpdateRsvpRow(...args),
  deleteRsvpRow: (...args: unknown[]) => mockDeleteRsvpRow(...args),
}));

let cookieValue: string | undefined;
const mockCookieSet = vi.fn();
const mockCookieDelete = vi.fn();
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: () => (cookieValue ? { value: cookieValue } : undefined),
    set: mockCookieSet,
    delete: mockCookieDelete,
  }),
  headers: async () => new Headers(),
}));

const { login, logout, saveRsvpEdit, removeRsvp } = await import("./actions");

const REAL_PASSWORD = "correct-horse-battery-staple";
const REAL_HASH = bcrypt.hashSync(REAL_PASSWORD, 4); // low cost: tests only
const REAL_EVENT = {
  id: "event-real",
  passwordHash: REAL_HASH,
  isDemo: false,
  coupleNames: "Sara & Omar",
  startsAt: new Date("2027-06-12T16:00:00Z"),
  rsvpDeadline: new Date("2027-05-01T21:59:59Z"),
  timeZone: "Europe/Vienna",
};
const DEMO_HASH = bcrypt.hashSync("demo-password", 4);
const DEMO_EVENT = { ...REAL_EVENT, id: "event-demo", passwordHash: DEMO_HASH, isDemo: true };

function sessionFor(event: { id: string; passwordHash: string }, now = new Date(), ttlMs?: number) {
  return signSession(event.id, event.passwordHash, now, SECRET, ttlMs);
}

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

beforeEach(() => {
  cookieValue = undefined;
  mockGetDashboardEvent.mockReset();
  mockUpdateRsvpRow.mockReset();
  mockDeleteRsvpRow.mockReset();
  mockCookieSet.mockReset();
  mockCookieDelete.mockReset();
});

describe("saveRsvpEdit / removeRsvp: demo events are read-only server-side", () => {
  test("rejects saveRsvpEdit on the demo event even with a technically valid session", async () => {
    mockGetDashboardEvent.mockResolvedValue(DEMO_EVENT);
    cookieValue = sessionFor(DEMO_EVENT);

    const result = await saveRsvpEdit("layla-and-adam", "rsvp-1", { name: "Hacked" });

    expect(result).toEqual({ ok: false });
    expect(mockUpdateRsvpRow).not.toHaveBeenCalled();
  });

  test("rejects removeRsvp on the demo event even with a technically valid session", async () => {
    mockGetDashboardEvent.mockResolvedValue(DEMO_EVENT);
    cookieValue = sessionFor(DEMO_EVENT);

    const result = await removeRsvp("layla-and-adam", "rsvp-1");

    expect(result).toEqual({ ok: false });
    expect(mockDeleteRsvpRow).not.toHaveBeenCalled();
  });

  test("saves an edit on a real (non-demo) event with a valid session", async () => {
    mockGetDashboardEvent.mockResolvedValue(REAL_EVENT);
    mockUpdateRsvpRow.mockResolvedValue(true);
    cookieValue = sessionFor(REAL_EVENT);

    const result = await saveRsvpEdit("sara-and-omar", "rsvp-1", { name: "New name" });

    expect(result).toEqual({ ok: true });
    expect(mockUpdateRsvpRow).toHaveBeenCalledWith(REAL_EVENT.id, "rsvp-1", { name: "New name" });
  });

  test("rejects an edit that fails validation (e.g. guest count out of range) even with a valid session", async () => {
    mockGetDashboardEvent.mockResolvedValue(REAL_EVENT);
    cookieValue = sessionFor(REAL_EVENT);

    const result = await saveRsvpEdit("sara-and-omar", "rsvp-1", { guestCount: 21 });

    expect(result).toEqual({ ok: false });
    expect(mockUpdateRsvpRow).not.toHaveBeenCalled();
  });

  test("deletes an rsvp on a real (non-demo) event with a valid session", async () => {
    mockGetDashboardEvent.mockResolvedValue(REAL_EVENT);
    mockDeleteRsvpRow.mockResolvedValue(true);
    cookieValue = sessionFor(REAL_EVENT);

    const result = await removeRsvp("sara-and-omar", "rsvp-1");

    expect(result).toEqual({ ok: true });
    expect(mockDeleteRsvpRow).toHaveBeenCalledWith(REAL_EVENT.id, "rsvp-1");
  });
});

describe("saveRsvpEdit / removeRsvp: a session only works for the event it was signed for", () => {
  test("a session signed for the demo event cannot edit a different, real event", async () => {
    // The attacker has a valid demo session but targets a slug that resolves
    // to a different event (different id and password hash).
    mockGetDashboardEvent.mockResolvedValue(REAL_EVENT);
    cookieValue = sessionFor(DEMO_EVENT);

    const result = await saveRsvpEdit("sara-and-omar", "rsvp-1", { name: "Hacked" });

    expect(result).toEqual({ ok: false });
    expect(mockUpdateRsvpRow).not.toHaveBeenCalled();
  });

  test("a session signed for a real event cannot edit the demo event", async () => {
    mockGetDashboardEvent.mockResolvedValue(DEMO_EVENT);
    cookieValue = sessionFor(REAL_EVENT);

    const result = await saveRsvpEdit("layla-and-adam", "rsvp-1", { name: "Hacked" });

    expect(result).toEqual({ ok: false });
    expect(mockUpdateRsvpRow).not.toHaveBeenCalled();
  });

  test("a session signed for a real event cannot delete from a different real event", async () => {
    const otherEvent = { ...REAL_EVENT, id: "event-other", passwordHash: bcrypt.hashSync("other", 4) };
    mockGetDashboardEvent.mockResolvedValue(otherEvent);
    cookieValue = sessionFor(REAL_EVENT);

    const result = await removeRsvp("other-couple", "rsvp-1");

    expect(result).toEqual({ ok: false });
    expect(mockDeleteRsvpRow).not.toHaveBeenCalled();
  });
});

describe("saveRsvpEdit / removeRsvp: other ways a request can fail to authenticate", () => {
  test("rejects with no session cookie at all", async () => {
    mockGetDashboardEvent.mockResolvedValue(REAL_EVENT);

    const result = await saveRsvpEdit("sara-and-omar", "rsvp-1", {});

    expect(result).toEqual({ ok: false });
    expect(mockUpdateRsvpRow).not.toHaveBeenCalled();
  });

  test("rejects when the event has no password configured yet", async () => {
    mockGetDashboardEvent.mockResolvedValue({ ...REAL_EVENT, passwordHash: null });
    cookieValue = "irrelevant";

    const result = await saveRsvpEdit("sara-and-omar", "rsvp-1", {});

    expect(result).toEqual({ ok: false });
  });

  test("rejects an expired session", async () => {
    mockGetDashboardEvent.mockResolvedValue(REAL_EVENT);
    cookieValue = sessionFor(REAL_EVENT, new Date(Date.now() - 1000), 1);

    const result = await saveRsvpEdit("sara-and-omar", "rsvp-1", {});

    expect(result).toEqual({ ok: false });
  });

  test("a session signed before a password reset is rejected after the reset", async () => {
    const beforeReset = { ...REAL_EVENT, passwordHash: bcrypt.hashSync("old-password", 4) };
    cookieValue = sessionFor(beforeReset);
    // getDashboardEvent now returns the event with its NEW hash, as it would after password:set.
    mockGetDashboardEvent.mockResolvedValue(REAL_EVENT);

    const result = await saveRsvpEdit("sara-and-omar", "rsvp-1", {});

    expect(result).toEqual({ ok: false });
    expect(mockUpdateRsvpRow).not.toHaveBeenCalled();
  });
});

describe("login", () => {
  test("sets a session cookie on the correct password", async () => {
    mockGetDashboardEvent.mockResolvedValue(REAL_EVENT);

    const state = await login("sara-and-omar", { status: "idle" }, form({ password: REAL_PASSWORD }));

    expect(state).toEqual({ status: "success" });
    expect(mockCookieSet).toHaveBeenCalledWith(
      "dashboard_session",
      expect.any(String),
      expect.objectContaining({ httpOnly: true, secure: true, sameSite: "strict" }),
    );
  });

  test("rejects an incorrect password without setting a cookie", async () => {
    mockGetDashboardEvent.mockResolvedValue(REAL_EVENT);

    const state = await login("sara-and-omar", { status: "idle" }, form({ password: "wrong" }));

    expect(state.status).toBe("error");
    expect(mockCookieSet).not.toHaveBeenCalled();
  });

  test("rejects when no password has been set for the event", async () => {
    mockGetDashboardEvent.mockResolvedValue({ ...REAL_EVENT, passwordHash: null });

    const state = await login("sara-and-omar", { status: "idle" }, form({ password: "anything" }));

    expect(state.status).toBe("error");
    expect(mockCookieSet).not.toHaveBeenCalled();
  });
});

describe("logout", () => {
  test("deletes the session cookie", async () => {
    await logout();

    expect(mockCookieDelete).toHaveBeenCalledWith("dashboard_session");
  });
});
