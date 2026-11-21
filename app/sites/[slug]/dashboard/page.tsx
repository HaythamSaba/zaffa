import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { LoginForm } from "@/components/dashboard/LoginForm";
import { getDashboardSessionSecret } from "@/lib/dashboard/env";
import { getDashboardEvent, listRsvpsForEvent } from "@/lib/dashboard/rsvp-store";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/dashboard/session";
import type { DashboardEvent } from "@/lib/dashboard/rsvp-store";
import { login } from "./actions";

export function generateMetadata(): Metadata {
  // Private per couple: never indexed, same as the invitation page itself.
  return { robots: { index: false, follow: false } };
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

  // TODO(next piece): replace with DashboardView (stats, search, filters, edit/delete, export).
  return (
    <main dir="ltr" lang="en" className="min-h-dvh bg-classic-parchment p-6 text-classic-ink">
      {rows.length} {rows.length === 1 ? "reply" : "replies"} so far.
    </main>
  );
}
