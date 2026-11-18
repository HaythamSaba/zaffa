import type { InvitationData } from "@/lib/events/build-invitation";
import type { LocalizedText } from "@/lib/i18n/bilingual";
import type { FormatContext, Lang } from "@/lib/i18n/format";

/** The same value rendered once per language, e.g. a date: localize((lang) => formatDate(d, lang, ctx)). */
export function localize(render: (lang: Lang) => string): LocalizedText {
  return { en: render("en"), ar: render("ar") };
}

export function formatContextOf(invitation: InvitationData): FormatContext {
  return { timeZone: invitation.timeZone, arabicLocale: invitation.settings.arabicLocale };
}

/** Digits and the like follow the page's main language: Arabic only for Arabic-only invitations. */
export function primaryLang(invitation: InvitationData): Lang {
  return invitation.languages === "ar" ? "ar" : "en";
}

/** A tel: link target from "+43 660 000 0000". */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
