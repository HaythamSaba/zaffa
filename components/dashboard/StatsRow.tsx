import { dashboardMessage } from "@/lib/dashboard/messages";
import type { RsvpSummary } from "@/lib/dashboard/types";

const STATS: readonly { key: keyof RsvpSummary; label: Parameters<typeof dashboardMessage>[0] }[] = [
  { key: "householdsReplied", label: "dashboard.stat.householdsReplied" },
  { key: "totalAttending", label: "dashboard.stat.totalAttending" },
  { key: "declined", label: "dashboard.stat.declined" },
  { key: "withNotes", label: "dashboard.stat.withNotes" },
];

/** "At a glance" (CLAUDE.md): four simple tiles, readable at a glance on a phone. */
export function StatsRow({ summary }: { summary: RsvpSummary }) {
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {STATS.map(({ key, label }) => (
        <div key={key} className="flex flex-col-reverse gap-0.5 bg-classic-cream p-3.5">
          <dt className="text-[0.6875rem] text-classic-smoke">{dashboardMessage(label)}</dt>
          <dd className="m-0 text-[1.75rem] leading-tight font-semibold text-classic-ink">{summary[key]}</dd>
        </div>
      ))}
    </dl>
  );
}
