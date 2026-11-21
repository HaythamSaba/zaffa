// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { buildInvitation, type EventRows } from "@/lib/events/build-invitation";
import { demoRows } from "@/lib/events/fixtures";
import { initialRsvpState } from "@/lib/rsvp/types";
import { ClassicInvitation } from "./ClassicInvitation";

afterEach(cleanup);

const BEFORE_DEADLINE = new Date("2027-04-01T10:00:00Z").getTime();
// The demo couple never calls this (it simulates client-side); only its shape matters here.
const NOOP_RSVP_ACTION = vi.fn().mockResolvedValue(initialRsvpState);

function renderInvitation(rows: EventRows = demoRows(), isRsvpOpen = true) {
  return render(
    <ClassicInvitation
      invitation={buildInvitation(rows)}
      isRsvpOpen={isRsvpOpen}
      serverNow={BEFORE_DEADLINE}
      rsvpAction={NOOP_RSVP_ACTION}
    />,
  );
}

function openInvitation() {
  fireEvent.click(screen.getByRole("button", { name: /Open invitation/ }));
}

describe("ClassicInvitation (demo: Premium, English + Arabic)", () => {
  test("starts with the opening screen, then shows the invitation", () => {
    renderInvitation();

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("You're invited")).toBeTruthy();
    expect(within(dialog).getByText("أنتم مدعوون").getAttribute("dir")).toBe("rtl");
  });

  test("has exactly one h1, the couple's names", () => {
    renderInvitation();
    const headings = screen.getAllByRole("heading", { level: 1, hidden: true });
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe("Layla & Adam");
  });

  test("every Arabic block is marked dir=rtl lang=ar, and Arabic never gets caps", () => {
    const { container } = renderInvitation();
    const arabic = [...container.querySelectorAll("*")].filter(
      (element) =>
        element.children.length === 0 && /[؀-ۿ]/.test(element.textContent ?? "") && element.tagName !== "STYLE",
    );

    expect(arabic.length).toBeGreaterThan(20);
    for (const element of arabic) {
      const block = element.closest("[lang]");
      expect(block?.getAttribute("lang"), element.textContent ?? "").toBe("ar");
      expect(block?.getAttribute("dir")).toBe("rtl");
      expect(block?.className).not.toMatch(/classic-caps|uppercase|tracking/);
    }
  });

  test("shows every Premium section", () => {
    renderInvitation();
    openInvitation();
    for (const name of ["Our story", "The celebration", "The day", "Dress code", "Moments"]) {
      expect(screen.getByRole("region", { name })).toBeTruthy();
    }
  });

  test("the demo's Send reply shows the received screen without saving", () => {
    renderInvitation();
    openInvitation();
    fireEvent.change(screen.getByRole("textbox", { name: /Full name/ }), {
      target: { value: "The Haddad family" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /Send reply/ }).closest("form")!);

    expect(screen.getByText("Thank you")).toBeTruthy();
    expect(screen.getByText("The Haddad family")).toBeTruthy();
    expect(screen.getByText("Number of guests: 2")).toBeTruthy();
    expect(screen.getByText("عدد الضيوف: ٢")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Add to calendar/ }).getAttribute("download")).toBe(
      "layla-and-adam.ics",
    );
  });

  test("after the deadline the form is replaced by RSVP closed and the couple's number", () => {
    renderInvitation(demoRows(), false);
    openInvitation();

    expect(screen.queryByRole("button", { name: /Send reply/ })).toBeNull();
    expect(screen.getByText("RSVP is now closed")).toBeTruthy();
    expect(screen.getByText(/Replies closed on 1 May 2027/)).toBeTruthy();
    const call = screen.getByRole("link", { name: /Call Layla/ });
    expect(call.getAttribute("href")).toBe("tel:+436600000000");
  });
});

describe("package gating", () => {
  test("Essential has no opening screen and hides schedule, dress code and gallery", () => {
    const rows = demoRows();
    rows.event.package = "essential";
    renderInvitation(rows);

    expect(screen.queryByRole("dialog")).toBeNull();
    for (const name of ["The day", "Dress code", "Moments"]) {
      expect(screen.queryByRole("region", { name })).toBeNull();
    }
    expect(screen.getByRole("region", { name: "Our story" })).toBeTruthy();
  });
});

describe("languages", () => {
  test("an English-only invitation shows no Arabic", () => {
    const rows = demoRows();
    rows.event.languages = "en";
    const { container } = renderInvitation(rows);
    expect(container.textContent).not.toMatch(/[؀-ۿ]/);
  });

  test("an Arabic-only invitation puts Arabic in the headings and shows no English couple text", () => {
    const rows = demoRows();
    rows.event.languages = "ar";
    renderInvitation(rows);

    const h1 = screen.getAllByRole("heading", { level: 1, hidden: true })[0];
    expect(h1.textContent).toBe("ليلى وآدم");
    expect(screen.queryByText("Our story")).toBeNull();
    expect(screen.queryByText("We met in Vienna.")).toBeNull();
  });

  test("arabicLocale ar-SY shows Levantine month names", () => {
    const rows = demoRows();
    rows.event.theme_settings = { ...(rows.event.theme_settings as object), arabicLocale: "ar-SY" };
    renderInvitation(rows);
    expect(screen.getAllByText(/حزيران/).length).toBeGreaterThan(0);
  });
});
