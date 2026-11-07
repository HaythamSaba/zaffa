import { describe, expect, test, vi } from "vitest";
import { createRateLimiter } from "@/lib/rate-limit";
import { HONEYPOT_FIELD, handleInquiry, type InquiryDeps } from "./handle-inquiry";

const NOW = new Date("2026-11-06T12:00:00Z");

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const valid = { names: "Sara & Omar", email: "sara@example.com", city: "Vienna" };

function deps(overrides: Partial<InquiryDeps> = {}): InquiryDeps {
  return {
    ip: "203.0.113.7",
    limiter: createRateLimiter({ limit: 5, windowMs: 60_000 }),
    deliver: vi.fn().mockResolvedValue({ ok: true }),
    logger: { warn: vi.fn(), error: vi.fn() },
    now: () => NOW,
    ...overrides,
  };
}

describe("handleInquiry", () => {
  test("delivers a valid inquiry and returns success without echoing values", async () => {
    const d = deps();

    const state = await handleInquiry(form(valid), d);

    expect(state.status).toBe("success");
    expect(state.values).toBeUndefined();
    expect(d.deliver).toHaveBeenCalledWith(
      expect.objectContaining({ names: "Sara & Omar", email: "sara@example.com" }),
    );
  });

  test("returns field errors and the submitted values when invalid", async () => {
    const d = deps();

    const state = await handleInquiry(form({ ...valid, email: "nope" }), d);

    expect(state.status).toBe("error");
    expect(state.fieldErrors?.email).toBeTruthy();
    expect(state.values?.names).toBe("Sara & Omar");
    expect(state.values?.city).toBe("Vienna");
    expect(d.deliver).not.toHaveBeenCalled();
  });

  test("pretends to succeed for bots that fill the honeypot, without delivering", async () => {
    const d = deps();

    const state = await handleInquiry(form({ ...valid, [HONEYPOT_FIELD]: "http://spam.example" }), d);

    expect(state.status).toBe("success");
    expect(d.deliver).not.toHaveBeenCalled();
    expect(d.logger.warn).toHaveBeenCalled();
  });

  test("blocks after the rate limit with a friendly message", async () => {
    const d = deps({ limiter: createRateLimiter({ limit: 1, windowMs: 60_000 }) });
    await handleInquiry(form(valid), d);

    const state = await handleInquiry(form(valid), d);

    expect(state.status).toBe("error");
    expect(state.message).toMatch(/too many/i);
    expect(d.deliver).toHaveBeenCalledTimes(1);
  });

  test("does not count invalid submissions toward the rate limit (typos don't lock people out)", async () => {
    const d = deps({ limiter: createRateLimiter({ limit: 1, windowMs: 60_000 }) });
    await handleInquiry(form({ names: "" }), d);
    await handleInquiry(form({ ...valid, email: "typo" }), d);

    const state = await handleInquiry(form(valid), d);

    expect(state.status).toBe("success");
  });

  test("does not count honeypot submissions toward the shared rate limit", async () => {
    const d = deps({ ip: null, limiter: createRateLimiter({ limit: 1, windowMs: 60_000 }) });
    await handleInquiry(form({ ...valid, [HONEYPOT_FIELD]: "spam" }), d);

    const state = await handleInquiry(form(valid), d);

    expect(state.status).toBe("success");
  });

  test("caps echoed values so oversized input isn't reflected back in full", async () => {
    const d = deps();

    const state = await handleInquiry(form({ ...valid, message: "a".repeat(10_000) }), d);

    expect(state.status).toBe("error");
    expect(state.values?.message?.length).toBe(2000);
  });

  test("shares one rate-limit bucket when the IP is unknown", async () => {
    const d = deps({ ip: null, limiter: createRateLimiter({ limit: 1, windowMs: 60_000 }) });
    await handleInquiry(form(valid), d);

    const state = await handleInquiry(form(valid), d);

    expect(state.message).toMatch(/too many/i);
  });

  test("shows a retryable error and logs details when delivery fails", async () => {
    const d = deps({ deliver: vi.fn().mockResolvedValue({ ok: false, reason: "network down" }) });

    const state = await handleInquiry(form(valid), d);

    expect(state.status).toBe("error");
    expect(state.message).toMatch(/couldn.t send/i);
    expect(state.message).not.toContain("network down");
    expect(state.values?.names).toBe("Sara & Omar");
    expect(d.logger.error).toHaveBeenCalledWith(
      expect.stringContaining("delivery failed"),
      expect.objectContaining({ reason: "network down" }),
    );
  });

  test("shows a retryable error when delivery throws (e.g. missing config)", async () => {
    const d = deps({ deliver: vi.fn().mockRejectedValue(new Error("RESEND_API_KEY missing")) });

    const state = await handleInquiry(form(valid), d);

    expect(state.status).toBe("error");
    expect(state.message).not.toContain("RESEND_API_KEY");
    expect(d.logger.error).toHaveBeenCalled();
  });

  test("never echoes the honeypot or unknown fields back to the client", async () => {
    const d = deps();

    const state = await handleInquiry(form({ email: "nope", secret: "x", names: "A" }), d);

    expect(state.values).not.toHaveProperty("secret");
    expect(state.values).not.toHaveProperty(HONEYPOT_FIELD);
  });
});
