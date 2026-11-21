import { describe, expect, test, vi } from "vitest";
import { createRateLimiter } from "@/lib/rate-limit";
import { handleRsvpSubmission, type SubmitRsvpDeps } from "./handle-submission";
import { RSVP_HONEYPOT_FIELD } from "./types";

const NOW = new Date("2027-04-01T10:00:00Z");
const SLUG = "sara-and-omar";

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const valid = { name: "The Haddad family", guestCount: "2", attending: "yes", notes: "Vegetarian" };

function deps(overrides: Partial<SubmitRsvpDeps> = {}): SubmitRsvpDeps {
  return {
    ip: "203.0.113.7",
    limiter: createRateLimiter({ limit: 5, windowMs: 60_000 }),
    logger: { warn: vi.fn(), error: vi.fn() },
    now: () => NOW,
    lookupEvent: vi.fn().mockResolvedValue({ id: "event-1", isOpen: true, isDemo: false }),
    insert: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("handleRsvpSubmission", () => {
  test("saves a valid reply and returns it for the received screen", async () => {
    const d = deps();

    const state = await handleRsvpSubmission(SLUG, form(valid), d);

    expect(state).toEqual({
      status: "success",
      reply: { name: "The Haddad family", guestCount: 2, attending: true },
    });
    expect(d.insert).toHaveBeenCalledWith("event-1", {
      name: "The Haddad family",
      guestCount: 2,
      attending: true,
      notes: "Vegetarian",
    });
  });

  test("returns field errors and never inserts when invalid", async () => {
    const d = deps();

    const state = await handleRsvpSubmission(SLUG, form({ ...valid, guestCount: "0" }), d);

    expect(state.status).toBe("error");
    expect(state.status === "error" && state.code).toBe("invalid");
    expect(state.status === "error" && state.fieldErrors?.guestCount).toBeTruthy();
    expect(d.insert).not.toHaveBeenCalled();
  });

  test("pretends to succeed for bots that fill the honeypot, without inserting", async () => {
    const d = deps();

    const state = await handleRsvpSubmission(
      SLUG,
      form({ ...valid, [RSVP_HONEYPOT_FIELD]: "http://spam.example" }),
      d,
    );

    expect(state.status).toBe("success");
    expect(d.insert).not.toHaveBeenCalled();
    expect(d.lookupEvent).not.toHaveBeenCalled();
    expect(d.logger.warn).toHaveBeenCalled();
  });

  test("blocks after the rate limit with a friendly message", async () => {
    const d = deps({ limiter: createRateLimiter({ limit: 1, windowMs: 60_000 }) });
    await handleRsvpSubmission(SLUG, form(valid), d);

    const state = await handleRsvpSubmission(SLUG, form(valid), d);

    expect(state.status).toBe("error");
    expect(state.status === "error" && state.code).toBe("rateLimited");
    expect(state.status === "error" && state.message).toMatch(/too many/i);
    expect(d.insert).toHaveBeenCalledTimes(1);
  });

  test("does not count invalid submissions toward the rate limit", async () => {
    const d = deps({ limiter: createRateLimiter({ limit: 1, windowMs: 60_000 }) });
    await handleRsvpSubmission(SLUG, form({ ...valid, guestCount: "0" }), d);

    const state = await handleRsvpSubmission(SLUG, form(valid), d);

    expect(state.status).toBe("success");
  });

  test("rejects when the event can no longer accept RSVPs (deadline passed server-side)", async () => {
    const d = deps({ lookupEvent: vi.fn().mockResolvedValue({ id: "event-1", isOpen: false, isDemo: false }) });

    const state = await handleRsvpSubmission(SLUG, form(valid), d);

    expect(state.status).toBe("error");
    expect(state.status === "error" && state.code).toBe("closed");
    expect(state.status === "error" && state.message).toMatch(/closed/i);
    expect(d.insert).not.toHaveBeenCalled();
  });

  test("rejects when the event doesn't exist", async () => {
    const d = deps({ lookupEvent: vi.fn().mockResolvedValue(null) });

    const state = await handleRsvpSubmission(SLUG, form(valid), d);

    expect(state.status).toBe("error");
    expect(d.insert).not.toHaveBeenCalled();
  });

  test("the demo event pretends to succeed without inserting", async () => {
    const d = deps({ lookupEvent: vi.fn().mockResolvedValue({ id: "demo-1", isOpen: true, isDemo: true }) });

    const state = await handleRsvpSubmission(SLUG, form(valid), d);

    expect(state.status).toBe("success");
    expect(d.insert).not.toHaveBeenCalled();
  });

  test("shows a retryable error and logs details when the insert fails", async () => {
    const d = deps({ insert: vi.fn().mockRejectedValue(new Error("connection reset")) });

    const state = await handleRsvpSubmission(SLUG, form(valid), d);

    expect(state.status).toBe("error");
    expect(state.status === "error" && state.code).toBe("failed");
    expect(state.status === "error" && state.message).not.toContain("connection reset");
    expect(d.logger.error).toHaveBeenCalledWith(
      expect.stringContaining("insert failed"),
      expect.objectContaining({ reason: "connection reset" }),
    );
  });

  test("shares one rate-limit bucket when the IP is unknown", async () => {
    const d = deps({ ip: null, limiter: createRateLimiter({ limit: 1, windowMs: 60_000 }) });
    await handleRsvpSubmission(SLUG, form(valid), d);

    const state = await handleRsvpSubmission(SLUG, form(valid), d);

    expect(state.status === "error" && state.message).toMatch(/too many/i);
  });
});
