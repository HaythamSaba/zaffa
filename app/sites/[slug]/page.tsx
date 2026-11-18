import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { StatusNotice } from "@/components/invitation/StatusNotice";
import { getInvitation } from "@/lib/events/get-invitation";
import { isRsvpOpen } from "@/lib/events/rsvp-window";
import { formatDate } from "@/lib/i18n/format";
import { logger } from "@/lib/logger";
import { templateFor } from "@/templates";

export const instant = false;

function previewTokenOf(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export async function generateMetadata({ params, searchParams }: PageProps<"/sites/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { preview } = await searchParams;
  const result = await getInvitation(slug, previewTokenOf(preview));
  // Invitations are shared by link only: never indexed (guests' and couples' privacy).
  const robots = { index: false, follow: false };
  if (result.status !== "ok") return { title: "Zaffa", robots };

  const { invitation } = result;
  const lang = invitation.languages === "ar" ? "ar" : "en";
  const names = invitation.texts.names?.[lang] ?? "Wedding invitation";
  const date = formatDate(invitation.startsAt, lang, {
    timeZone: invitation.timeZone,
    arabicLocale: invitation.settings.arabicLocale,
  });
  const title = `${names} · ${date}`;
  const description = invitation.texts["welcome.message"]?.[lang] ?? title;

  return {
    title,
    description,
    robots,
    openGraph: { type: "website", title, description, locale: lang === "ar" ? "ar" : "en" },
  };
}

/** A couple's invitation. Reached via proxy.ts rewrites; guests never see /sites/. */
export default async function InvitationPage({ params, searchParams }: PageProps<"/sites/[slug]">) {
  const { slug } = await params;
  const { preview } = await searchParams;
  // Render per request: the RSVP state and countdown depend on the time, and an
  // outage at build time must never be baked into a static page.
  await connection();
  const result = await getInvitation(slug, previewTokenOf(preview));

  if (result.status === "not-found") notFound();
  if (result.status === "unavailable") return <StatusNotice kind="unavailable" />;

  const template = templateFor(result.invitation.templateId);
  if (!template) {
    logger.error("Unknown invitation template", { slug, templateId: result.invitation.templateId });
    return <StatusNotice kind="unavailable" />;
  }

  const now = new Date();

  return (
    <template.Component
      invitation={result.invitation}
      isRsvpOpen={isRsvpOpen(result.invitation.rsvpDeadline, now)}
      serverNow={now.getTime()}
      isPreview={result.preview}
    />
  );
}
