import { describe, expect, test, vi } from "vitest";
import { buildInquiryEmail, sendInquiryEmail, type EmailClient } from "./email";
import type { ContactInquiry } from "./schema";

const inquiry: ContactInquiry = {
  names: "Sara & Omar",
  email: "sara@example.com",
  package: "premium",
  weddingDate: "2027-06-12",
  languages: "both families' languages",
  city: "Vienna",
  message: "Hello <b>there</b>",
};

const config = { to: "studio@example.com", from: "onboarding@resend.dev" };

describe("buildInquiryEmail", () => {
  test("addresses the studio and replies to the couple", () => {
    const email = buildInquiryEmail(inquiry, config);

    expect(email.to).toBe("studio@example.com");
    expect(email.from).toBe("onboarding@resend.dev");
    expect(email.replyTo).toBe("sara@example.com");
  });

  test("includes every field in a plain-text body, untouched", () => {
    const { text } = buildInquiryEmail(inquiry, config);

    expect(text).toContain("Sara & Omar");
    expect(text).toContain("Premium");
    expect(text).toContain("2027-06-12");
    expect(text).toContain("Vienna");
    expect(text).toContain("Hello <b>there</b>");
  });

  test("shows a dash for missing optional fields", () => {
    const { text } = buildInquiryEmail(
      { names: "A & B", email: "a@example.com", package: "unsure" },
      config,
    );

    expect(text).toMatch(/Wedding date: —/);
    expect(text).toMatch(/Package: Not sure yet/);
  });

  test("keeps single-line fields on one line so they can't fake extra body lines", () => {
    const { text } = buildInquiryEmail(
      {
        ...inquiry,
        names: "Sara\nEmail: attacker@example.com",
        city: "Vienna\r\nPackage: Bespoke",
        languages: "a\nb",
      },
      config,
    );
    const lines = text.split("\n");

    expect(lines.filter((line) => line.startsWith("Email:"))).toEqual(["Email: sara@example.com"]);
    expect(lines.filter((line) => line.startsWith("Package:"))).toHaveLength(1);
    expect(text).toContain("Names: Sara Email: attacker@example.com");
  });

  test("strips line breaks from the subject to prevent header injection", () => {
    const { subject } = buildInquiryEmail(
      { ...inquiry, names: "Sara\r\nBcc: victim@example.com" },
      config,
    );

    expect(subject).not.toMatch(/[\r\n]/);
    expect(subject.startsWith("New inquiry: ")).toBe(true);
  });
});

describe("sendInquiryEmail", () => {
  function client(result: Awaited<ReturnType<EmailClient["send"]>>): EmailClient {
    return { send: vi.fn().mockResolvedValue(result) };
  }

  test("returns ok when the provider accepts the email", async () => {
    const emailClient = client({ data: { id: "email_1" }, error: null });

    const result = await sendInquiryEmail(inquiry, config, emailClient);

    expect(result).toEqual({ ok: true, id: "email_1" });
    expect(emailClient.send).toHaveBeenCalledWith(
      expect.objectContaining({ replyTo: "sara@example.com", to: "studio@example.com" }),
    );
  });

  test("returns a failure when the provider reports an error", async () => {
    const emailClient = client({ data: null, error: { name: "validation_error", message: "bad from" } });

    const result = await sendInquiryEmail(inquiry, config, emailClient);

    expect(result).toEqual({ ok: false, reason: "validation_error: bad from" });
  });

  test("returns a failure when the provider throws", async () => {
    const emailClient: EmailClient = { send: vi.fn().mockRejectedValue(new Error("network down")) };

    const result = await sendInquiryEmail(inquiry, config, emailClient);

    expect(result).toEqual({ ok: false, reason: "network down" });
  });
});
