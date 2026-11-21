"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { logout } from "@/app/sites/[slug]/dashboard/actions";
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
};

const FILTERS: readonly { value: AttendingFilter; label: Parameters<typeof dashboardMessage>[0] }[] = [
  { value: "all", label: "dashboard.filter.all" },
  { value: "attending", label: "dashboard.filter.attending" },
  { value: "notAttending", label: "dashboard.filter.notAttending" },
  { value: "hasNotes", label: "dashboard.filter.hasNotes" },
];

/** The couple's private guest list: stats, search, filters, an editable list, and CSV export. */
export function DashboardView({ slug, rows, isDemo }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<AttendingFilter>("all");
  // Guests never see /sites/<slug>; on a couple's host this is "/dashboard",
  // but on the marketing host's demo it's "/sample/dashboard" - never hardcode it.
  const pathname = usePathname();

  // Derived during render, not an effect: both are cheap, pure recomputations of `rows`.
  const summary = summarizeRsvps(rows);
  const filtered = filterRsvps(rows, { search, filter });

  return (
    <main dir="ltr" lang="en" className="mx-auto flex min-h-dvh max-w-150 flex-col gap-5 bg-classic-parchment px-4.5 py-6 text-classic-ink">
      <div className="flex items-center justify-between gap-3">
        <h1 className="classic-caps m-0 text-lg">{dashboardMessage("dashboard.title")}</h1>
        <form action={logout}>
          <button type="submit" className="classic-caps min-h-9 cursor-pointer border border-classic-smoke px-3 text-[0.625rem]">
            {dashboardMessage("dashboard.logout")}
          </button>
        </form>
      </div>

      {isDemo && (
        <p className="m-0 border border-classic-gold bg-classic-cream px-3.5 py-2.5 text-sm">
          {dashboardMessage("dashboard.demoNotice")}
        </p>
      )}

      <StatsRow summary={summary} />

      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex flex-col gap-1.5 sm:flex-1">
          <span className="sr-only">{dashboardMessage("dashboard.search")}</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={dashboardMessage("dashboard.search")}
            className="min-h-11 border border-classic-smoke bg-classic-white px-3.5 text-[0.9375rem] text-classic-ink"
          />
        </label>

        <div role="group" aria-label={dashboardMessage("dashboard.search")} className="flex flex-wrap gap-1.5">
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className={`classic-caps min-h-9 cursor-pointer border px-2.5 text-[0.625rem] ${
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

      <a
        href={`${pathname}/export`}
        className="classic-caps flex min-h-11 w-full cursor-pointer items-center justify-center border border-classic-umber text-xs text-classic-umber no-underline sm:w-auto sm:self-end sm:px-6"
      >
        {dashboardMessage("dashboard.export")}
      </a>

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
