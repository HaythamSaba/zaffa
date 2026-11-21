// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { message } from "@/lib/i18n/messages";
import type { RsvpFormState } from "@/lib/rsvp/types";
import { RsvpForm } from "./RsvpForm";
import type { RsvpCopy } from "./copy";

afterEach(cleanup);

const copy: RsvpCopy = {
  name: { en: "Full name" },
  namePlaceholder: "e.g. The Haddad family",
  attending: { en: "Will you attend?" },
  accept: { en: "Joyfully accept" },
  decline: { en: "Regretfully decline" },
  guests: { en: "Number of guests" },
  notes: { en: "Notes" },
  notesPlaceholder: "Anything else",
  send: { en: "Send reply" },
  privacy: { en: "Your reply is private." },
  note: { en: "Replies open soon." },
  received: {
    title: { en: "Thank you" },
    accepted: { en: "Your reply has reached them." },
    declined: { en: "Your reply has reached them." },
    yourReply: "Your reply",
    calendar: { en: "Add to calendar" },
    back: { en: "Back to the invitation" },
    change: { en: "Message them directly." },
  },
};

const calendar = { href: "data:text/calendar,x", fileName: "invite.ics" };

function renderForm(action: (state: RsvpFormState, formData: FormData) => Promise<RsvpFormState>) {
  return render(
    <RsvpForm
      languages="en"
      arabicLocale="ar-EG"
      copy={copy}
      isDemo={false}
      calendar={calendar}
      monogram={null}
      action={action}
    />,
  );
}

function fillAndSubmit() {
  fireEvent.change(screen.getByRole("textbox", { name: /Full name/ }), {
    target: { value: "The Haddad family" },
  });
  fireEvent.submit(screen.getByRole("button", { name: /Send reply/ }).closest("form")!);
}

describe("RsvpForm (real, non-demo path)", () => {
  test("submits to the bound action and shows the received screen with its reply", async () => {
    const action = vi.fn().mockResolvedValue({
      status: "success",
      reply: { name: "The Haddad family", guestCount: 2, attending: true },
    } satisfies RsvpFormState);
    renderForm(action);

    fillAndSubmit();

    expect(await screen.findByText("Thank you")).toBeTruthy();
    expect(action).toHaveBeenCalledTimes(1);
  });

  test("shows the server's localized error and keeps the form", async () => {
    const action = vi
      .fn()
      .mockResolvedValue({ status: "error", code: "closed", message: "RSVP is now closed." } satisfies RsvpFormState);
    renderForm(action);

    fillAndSubmit();

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain(message("rsvp.error.closed").en);
    expect(screen.getByRole("button", { name: /Send reply/ })).toBeTruthy();
  });

  test("includes a hidden honeypot field bots tend to fill", () => {
    const { container } = renderForm(vi.fn());

    const honeypot = container.querySelector<HTMLInputElement>('input[name="rsvp-note"]');
    expect(honeypot).not.toBeNull();
    expect(honeypot?.tabIndex).toBe(-1);
    expect(honeypot?.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  test("disables the submit button while the action is pending", async () => {
    let resolveAction!: (state: RsvpFormState) => void;
    const action = vi.fn(
      () => new Promise<RsvpFormState>((resolve) => { resolveAction = resolve; }),
    );
    renderForm(action);

    fillAndSubmit();

    const button = await screen.findByRole("button", { name: /Sending/i });
    expect((button as HTMLButtonElement).disabled).toBe(true);

    resolveAction({ status: "success", reply: { name: "The Haddad family", guestCount: 2, attending: true } });
    expect(await screen.findByText("Thank you")).toBeTruthy();
  });
});
