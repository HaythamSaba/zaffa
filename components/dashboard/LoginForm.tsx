"use client";

import { useActionState } from "react";
import type { LoginFormState } from "@/app/sites/[slug]/dashboard/actions";
import { dashboardMessage } from "@/lib/dashboard/messages";

type LoginAction = (state: LoginFormState, formData: FormData) => Promise<LoginFormState>;

const INITIAL_STATE: LoginFormState = { status: "idle" };

/**
 * The couple's own login, gated by a shared password (CLAUDE.md: "Only the
 * couple, with the shared password"). Plain English UI; see
 * lib/dashboard/messages.ts for why this isn't bilingual like the invitation.
 */
export function LoginForm({ action }: { action: LoginAction }) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  return (
    <main
      dir="ltr"
      lang="en"
      className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-classic-parchment px-5 py-10 text-classic-ink"
    >
      <form action={formAction} className="flex w-full max-w-90 flex-col gap-4.5">
        <h1 className="classic-caps m-0 text-center text-lg text-classic-ink">
          {dashboardMessage("login.title")}
        </h1>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">{dashboardMessage("login.password")}</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            autoFocus
            className="min-h-12 border border-classic-smoke bg-classic-white px-3.5 text-[1.0625rem] text-classic-ink"
          />
        </label>

        {state.status === "error" && (
          <p
            role="alert"
            className="m-0 border border-classic-gold bg-classic-cream px-3.5 py-2.5 text-sm text-classic-ink"
          >
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="classic-caps min-h-12.5 cursor-pointer bg-classic-umber text-xs text-classic-white transition-colors hover:bg-classic-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? dashboardMessage("login.submitting") : dashboardMessage("login.submit")}
        </button>
      </form>
    </main>
  );
}
