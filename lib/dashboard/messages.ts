import en from "@/locales/dashboard-en.json";

export type DashboardMessageKey = keyof typeof en;

/**
 * Dashboard UI labels: English only for now, unlike the bilingual guest-facing
 * `message()` in lib/i18n/messages.ts. The couple's own content stays in the
 * database; this is just the fixed interface text. Arabic labels can be added
 * later as locales/dashboard-ar.json without touching call sites.
 */
export function dashboardMessage(key: DashboardMessageKey): string {
  return en[key];
}

/** "1 guest" / "4 guests". */
export function guestCountLabel(count: number): string {
  return `${count} ${count === 1 ? dashboardMessage("dashboard.guest") : dashboardMessage("dashboard.guests")}`;
}
