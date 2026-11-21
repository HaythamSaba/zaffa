"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { logout } from "@/app/sites/[slug]/dashboard/actions";
import { DEFAULT_ARABIC_LOCALE, formatDate } from "@/lib/i18n/format";
import { filterRsvps } from "@/lib/dashboard/filter";
import { dashboardMessage } from "@/lib/dashboard/messages";
import { summarizeRsvps } from "@/lib/dashboard/summary";
import type { AttendingFilter, RsvpRow } from "@/lib/dashboard/types";
import { GuestRow } from "./GuestRow";
import { StatsRow } from "./StatsRow";

type Props = {
  slug: string;
  rows: RsvpRow[];
  isDemo: boolean;
  coupleNames: string;
  startsAt: Date;
  rsvpDeadline: Date;
  timeZone: string;
  isRsvpOpen: boolean;
};

const FILTERS: readonly { value: AttendingFilter; label: Parameters<typeof dashboardMessage>[0] }[] = [
  { value: "all", label: "dashboard.filter.all" },
  { value: "attending", label: "dashboard.filter.attending" },
  { value: "notAttending", label: "dashboard.filter.notAttending" },
  { value: "hasNotes", label: "dashboard.filter.hasNotes" },
];

/** Small UI buttons: same caps/font as classic-caps, but less letter-spacing. */
const smallButtonCaps = "font-bodoni uppercase tracking-[0.1em]";

/** The couple's private guest list: stats, search, filters, an editable list, and CSV export. */
export function DashboardView({
  slug,
  rows,
  isDemo,
  coupleNames,
  startsAt,
  rsvpDeadline,
  timeZone,
  isRsvpOpen,
}: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<AttendingFilter>("all");
  // Guests never see /sites/<slug>; on a couple's host this is "/dashboard",
  // but on the marketing host's demo it's "/sample/dashboard" - never hardcode it.
  const pathname = usePathname();

  // Derived during render, not an effect: both are cheap, pure recomputations of `rows`.
  const summary = summarizeRsvps(rows);
  const filtered = filterRsvps(rows, { search, filter });

  const dateContext = { timeZone, arabicLocale: DEFAULT_ARABIC_LOCALE };
  const weddingDate = formatDate(startsAt, "en", dateContext);
  const rsvpStatus = isRsvpOpen
    ? `${dashboardMessage("dashboard.repliesCloseBy")} ${formatDate(rsvpDeadline, "en", dateContext)}`
    : dashboardMessage("dashboard.repliesClosed");

  return (
    <main
      dir="ltr"
      lang="en"
      className="mx-auto flex min-h-dvh max-w-150 flex-col gap-5 bg-classic-parchment px-4.5 py-6 text-classic-ink"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h1 className="classic-caps m-0 text-lg">{dashboardMessage("dashboard.title")}</h1>
          {coupleNames && (
            <p className="m-0 text-sm text-classic-smoke">
              {coupleNames} · {weddingDate}
            </p>
          )}
          <p className="m-0 text-xs text-classic-smoke">{rsvpStatus}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <a
            href={`${pathname}/export`}
            className={`${smallButtonCaps} flex min-h-9 cursor-pointer items-center justify-center border border-classic-umber px-2.5 text-[0.625rem] text-classic-umber no-underline`}
          >
            {dashboardMessage("dashboard.export")}
          </a>
          <form action={logout}>
            <button
              type="submit"
              className={`${smallButtonCaps} min-h-9 cursor-pointer border border-classic-smoke px-2.5 text-[0.625rem]`}
            >
              {dashboardMessage("dashboard.logout")}
            </button>
          </form>
        </div>
      </div>

      {isDemo && (
        <p className="m-0 border border-classic-gold bg-classic-cream px-3.5 py-2.5 text-sm">
          {dashboardMessage("dashboard.demoNotice")}
        </p>
      )}

      <StatsRow summary={summary} />

      <div className="flex flex-col gap-2.5">
        <label className="flex flex-col gap-1.5">
          <span className="sr-only">{dashboardMessage("dashboard.search")}</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={dashboardMessage("dashboard.search")}
            className="min-h-11 w-full border border-classic-smoke bg-classic-white px-3.5 text-[0.9375rem] text-classic-ink"
          />
        </label>

        <div
          role="group"
          aria-label={dashboardMessage("dashboard.search")}
          className="flex gap-1.5 overflow-x-auto"
        >
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className={`${smallButtonCaps} min-h-11 shrink-0 cursor-pointer border px-3 text-[0.625rem] ${
                filter === value
                  ? "border-classic-umber bg-classic-umber text-classic-white"
                  : "border-classic-smoke text-classic-ink"
              }`}
            >
              {dashboardMessage(label)}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="m-0 text-center text-classic-smoke">{dashboardMessage("dashboard.empty")}</p>
      ) : filtered.length === 0 ? (
        <p className="m-0 text-center text-classic-smoke">{dashboardMessage("dashboard.noMatches")}</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
          {filtered.map((row) => (
            <GuestRow key={row.id} slug={slug} row={row} readOnly={isDemo} />
          ))}
        </ul>
      )}

      <p className="m-0 text-center text-[0.8125rem] text-classic-smoke">{dashboardMessage("dashboard.privacy")}</p>
    </main>
  );
}
