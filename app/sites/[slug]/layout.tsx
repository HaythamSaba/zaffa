import { getInvitation } from "@/lib/events/get-invitation";
import { getRoutingConfig } from "@/lib/routing/config";
import { defaultTemplate, templateFor } from "@/templates";
import "../invitation.css";

// Guests arrive with a full page load (WhatsApp, Instagram): the layout may
// wait for the event to set <html lang dir> and the template's fonts.
export const instant = false;

/**
 * `slug` is a root parameter (this is a root layout), so Next needs at least
 * one value at build time: the demo couple. Every other couple renders on
 * request. The page itself always renders per request (connection()).
 */
export function generateStaticParams(): { slug: string }[] {
  return [{ slug: getRoutingConfig().demoSlug }];
}

/**
 * Root layout of a couple's invitation (separate from the marketing site, so
 * only the template's fonts load here). Arabic-only invitations set
 * lang="ar" dir="rtl" on <html>; mixed ones keep English as the page language
 * and mark each Arabic block.
 */
export default async function InvitationLayout({ children, params }: LayoutProps<"/sites/[slug]">) {
  const { slug } = await params;
  const result = await getInvitation(slug);
  const invitation = result.status === "ok" ? result.invitation : null;
  const isArabicOnly = invitation?.languages === "ar";
  const template = (invitation && templateFor(invitation.templateId)) ?? defaultTemplate();

  return (
    <html
      lang={isArabicOnly ? "ar" : "en"}
      dir={isArabicOnly ? "rtl" : "ltr"}
      className={`${template.fontClassName} antialiased`}
    >
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
