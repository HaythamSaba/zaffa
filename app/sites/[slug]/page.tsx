import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { StatusNotice } from "@/components/invitation/StatusNotice";
import { getInvitation } from "@/lib/events/get-invitation";
import { isRsvpOpen } from "@/lib/events/rsvp-window";
import { SHARE_IMAGE_SIZE } from "@/lib/events/share-image";
import { formatDate } from "@/lib/i18n/format";
import { logger } from "@/lib/logger";
import { INVITATION_PREFIX_HEADER } from "@/lib/routing/resolve-host";
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
  const { origin, prefix } = await publicLocation(slug);
  const image = { url: `${prefix}/share-image`, ...SHARE_IMAGE_SIZE, alt: names };

  return {
    title,
    description,
    robots,
    metadataBase: origin,
    alternates: { canonical: prefix || "/" },
    openGraph: {
      type: "website",
      title,
      description,
      url: prefix || "/",
      locale: lang === "ar" ? "ar" : "en",
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

/**
 * Where guests see this invitation: the request's own origin (a couple's host,
 * or the marketing site for /sample) and the path prefix proxy.ts rewrote
 * from. Without the proxy header (local /sites/<slug>), the prefix is that path.
 */
async function publicLocation(slug: string): Promise<{ origin: URL | null; prefix: string }> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  const isLocal = host?.startsWith("localhost") || host?.includes(".localhost") || host?.startsWith("127.0.0.1");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (isLocal ? "http" : "https");
  const prefix = requestHeaders.get(INVITATION_PREFIX_HEADER) ?? `/sites/${slug}`;
  try {
    return { origin: host ? new URL(`${protocol}://${host}`) : null, prefix };
  } catch {
    return { origin: null, prefix };
  }
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
