import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { initialContactState } from "@/lib/contact/types";

const sendMock = vi.fn();
const headerStore = { current: new Headers() };

vi.mock("next/headers", () => ({
  headers: async () => headerStore.current,
}));

vi.mock("resend", () => ({
  Resend: vi.fn(function Resend() {
    return { emails: { send: sendMock } };
  }),
}));

function validForm(): FormData {
  const data = new FormData();
  data.set("names", "Sara & Omar");
  data.set("email", "sara@example.com");
  return data;
}

async function loadAction() {
  vi.resetModules();
  return (await import("./actions")).submitInquiry;
}

const sendEnv = {
  RESEND_API_KEY: "re_test_key",
  CONTACT_TO_EMAIL: "studio@example.com",
  CONTACT_FROM_EMAIL: "onboarding@resend.dev",
};

function stubEnv(vars: Record<string, string>) {
  for (const [key, value] of Object.entries(vars)) vi.stubEnv(key, value);
}

describe("submitInquiry server action", () => {
  beforeEach(() => {
    sendMock.mockReset().mockResolvedValue({ data: { id: "email_1" }, error: null });
    headerStore.current = new Headers({ "x-real-ip": "203.0.113.7" });
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  test("dry run outside production succeeds without sending email", async () => {
    stubEnv({ NODE_ENV: "development", CONTACT_DRY_RUN: "1" });
    const submitInquiry = await loadAction();

    const state = await submitInquiry(initialContactState, validForm());

    expect(state.status).toBe("success");
    expect(sendMock).not.toHaveBeenCalled();
  });

  test("CONTACT_DRY_RUN is ignored in production: the email is really sent", async () => {
    stubEnv({ NODE_ENV: "production", CONTACT_DRY_RUN: "1", ...sendEnv });
    const submitInquiry = await loadAction();

    const state = await submitInquiry(initialContactState, validForm());

    expect(state.status).toBe("success");
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({ to: "studio@example.com", replyTo: "sara@example.com" }),
    );
  });

  test("production with missing Resend config shows a friendly error and logs it", async () => {
    stubEnv({ NODE_ENV: "production", CONTACT_DRY_RUN: "1" });
    const submitInquiry = await loadAction();

    const state = await submitInquiry(initialContactState, validForm());

    expect(state.status).toBe("error");
    expect(state.message).not.toMatch(/RESEND|CONTACT_/);
    expect(console.error).toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });

  test("rate-limits by the Vercel client IP", async () => {
    stubEnv({ NODE_ENV: "development", CONTACT_DRY_RUN: "1" });
    const submitInquiry = await loadAction();

    const states = [];
    for (let i = 0; i < 6; i++) states.push(await submitInquiry(initialContactState, validForm()));

    expect(states.slice(0, 5).every((s) => s.status === "success")).toBe(true);
    expect(states[5].status).toBe("error");
    expect(states[5].message).toMatch(/too many/i);
  });

  test("a different client IP gets its own allowance", async () => {
    stubEnv({ NODE_ENV: "development", CONTACT_DRY_RUN: "1" });
    const submitInquiry = await loadAction();
    for (let i = 0; i < 5; i++) await submitInquiry(initialContactState, validForm());

    headerStore.current = new Headers({ "x-forwarded-for": "198.51.100.9, 10.0.0.1" });
    const state = await submitInquiry(initialContactState, validForm());

    expect(state.status).toBe("success");
  });
});
