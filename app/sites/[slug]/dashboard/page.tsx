import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { LoginForm } from "@/components/dashboard/LoginForm";
import { getDashboardSessionSecret } from "@/lib/dashboard/env";
import { isRsvpOpen as computeIsRsvpOpen } from "@/lib/events/rsvp-window";
import { getDashboardEvent, listRsvpsForEvent } from "@/lib/dashboard/rsvp-store";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/dashboard/session";
import type { DashboardEvent } from "@/lib/dashboard/rsvp-store";
import { login } from "./actions";

export function generateMetadata(): Metadata {
  // Private per couple: never indexed, same as the invitation page itself.
  return { title: "Guest dashboard", robots: { index: false, follow: false } };
}

async function hasValidSession(event: DashboardEvent): Promise<boolean> {
  if (!event.passwordHash) return false;
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) return false;
  return verifySession(token, event.id, event.passwordHash, new Date(), getDashboardSessionSecret());
}

/** The couple's private guest list, reached as /dashboard on their own address. */
export default async function DashboardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getDashboardEvent(slug);
  if (!event) notFound();

  if (!(await hasValidSession(event))) {
    return <LoginForm action={login.bind(null, slug)} />;
  }

  const rows = await listRsvpsForEvent(event.id);

  return (
    <DashboardView
      slug={slug}
      rows={rows}
      isDemo={event.isDemo}
      coupleNames={event.coupleNames}
      startsAt={event.startsAt}
      rsvpDeadline={event.rsvpDeadline}
      timeZone={event.timeZone}
      isRsvpOpen={computeIsRsvpOpen(event.rsvpDeadline, new Date())}
    />
  );
}
