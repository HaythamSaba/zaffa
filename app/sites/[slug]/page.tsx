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
import { INVITATION_PREFIX_HEADER, normalizeHost } from "@/lib/routing/resolve-host";
import { templateFor } from "@/templates";
import { submitRsvp } from "./actions";

export const instant = false;

const LOCAL_HOST = /(^|\.)localhost$|^127\.0\.0\.1$/;
/** The prefix proxy.ts sets is "" or "/sample"; anything else is ignored. */
const PREFIX = /^(\/[a-z0-9-]+)?$/;

export async function generateMetadata({ params }: PageProps<"/sites/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const result = await getInvitation(slug);
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
 * Where guests see this invitation: the request's own (validated) origin, a
 * couple's host or the marketing site for /sample, and the path prefix
 * proxy.ts rewrote from. Without the proxy header (local /sites/<slug>), the
 * prefix is that path.
 */
async function publicLocation(slug: string): Promise<{ origin: URL | null; prefix: string }> {
  const requestHeaders = await headers();
  const fallbackPrefix = `/sites/${slug}`;
  const headerPrefix = requestHeaders.get(INVITATION_PREFIX_HEADER);
  const prefix = headerPrefix !== null && PREFIX.test(headerPrefix) ? headerPrefix : fallbackPrefix;

  const rawHost = requestHeaders.get("host") ?? "";
  const host = normalizeHost(rawHost);
  if (!host) return { origin: null, prefix };

  const isLocal = LOCAL_HOST.test(host);
  const forwarded = requestHeaders.get("x-forwarded-proto");
  const protocol = forwarded === "http" || forwarded === "https" ? forwarded : isLocal ? "http" : "https";
  const port = /:(\d{1,5})$/.exec(rawHost)?.[1];
  return { origin: new URL(`${protocol}://${host}${port ? `:${port}` : ""}`), prefix };
}

/** A couple's invitation. Reached via proxy.ts rewrites; guests never see /sites/. */
export default async function InvitationPage({ params }: PageProps<"/sites/[slug]">) {
  const { slug } = await params;
  // Render per request: the RSVP state and countdown depend on the time, and an
  // outage at build time must never be baked into a static page.
  await connection();
  const result = await getInvitation(slug);

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
      rsvpAction={submitRsvp.bind(null, slug)}
    />
  );
}
