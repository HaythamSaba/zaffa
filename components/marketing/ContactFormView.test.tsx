// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { initialContactState, type ContactFormState } from "@/lib/contact/types";
import { ContactFormView } from "./ContactFormView";

function renderView(state: ContactFormState = initialContactState, isPending = false) {
  return render(<ContactFormView state={state} formAction={vi.fn()} isPending={isPending} />);
}

afterEach(cleanup);

describe("ContactFormView", () => {
  test("labels every visible field", () => {
    renderView();

    for (const label of [
      "Your names",
      "Email",
      "Wedding date",
      "Languages",
      "Package",
      "Wedding city",
      "Anything else?",
    ]) {
      expect(screen.getByLabelText(label)).toBeTruthy();
    }
  });

  test("marks required fields as required", () => {
    renderView();

    expect(screen.getByLabelText("Your names").hasAttribute("required")).toBe(true);
    expect(screen.getByLabelText("Email").hasAttribute("required")).toBe(true);
  });

  test("hides the honeypot from people and assistive tech", () => {
    const { container } = renderView();
    const honeypot = container.querySelector<HTMLInputElement>('input[name="website"]');

    expect(honeypot).not.toBeNull();
    expect(honeypot?.tabIndex).toBe(-1);
    expect(honeypot?.getAttribute("autocomplete")).toBe("off");
    expect(honeypot?.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  test("shows field errors linked to their inputs", () => {
    renderView({
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: { email: "Enter a valid email address." },
      values: { names: "Sara & Omar", email: "nope" },
    });

    const email = screen.getByLabelText("Email");
    const errorId = email.getAttribute("aria-describedby");

    expect(email.getAttribute("aria-invalid")).toBe("true");
    expect(errorId && document.getElementById(errorId)?.textContent).toBe(
      "Enter a valid email address.",
    );
    expect(screen.getByLabelText("Your names").getAttribute("aria-invalid")).toBeNull();
  });

  test("keeps what the visitor typed after an error", () => {
    renderView({
      status: "error",
      message: "Please check the highlighted fields.",
      values: { names: "Sara & Omar", city: "Vienna", package: "premium" },
    });

    expect((screen.getByLabelText("Your names") as HTMLInputElement).value).toBe("Sara & Omar");
    expect((screen.getByLabelText("Wedding city") as HTMLInputElement).value).toBe("Vienna");
    expect((screen.getByLabelText("Package") as HTMLSelectElement).value).toBe("premium");
  });

  test("announces the error message as an alert", () => {
    renderView({ status: "error", message: "Too many messages." });

    expect(screen.getByRole("alert").textContent).toContain("Too many messages.");
  });

  test("announces success politely", () => {
    renderView({ status: "success", message: "Thank you!" });

    expect(screen.getByRole("status").textContent).toContain("Thank you!");
  });

  test("disables the submit button while sending", () => {
    renderView(initialContactState, true);
    const button = screen.getByRole("button", { name: /sending/i }) as HTMLButtonElement;

    expect(button.disabled).toBe(true);
    expect(button.type).toBe("submit");
  });

  test("submits by default", () => {
    renderView();

    expect((screen.getByRole("button", { name: "Send inquiry" }) as HTMLButtonElement).type).toBe(
      "submit",
    );
  });
});
