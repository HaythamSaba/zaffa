import type { ComponentType } from "react";
import { ClassicInvitation, type ClassicInvitationProps } from "./classic/ClassicInvitation";
import { classicFontClassName } from "./classic/fonts";

/** What every template receives. Adding a template never needs a database change. */
export type TemplateProps = ClassicInvitationProps;

export interface TemplateEntry {
  readonly Component: ComponentType<TemplateProps>;
  /** next/font variables for the template's fonts, set on <html>. */
  readonly fontClassName: string;
}

const TEMPLATES: Readonly<Record<string, TemplateEntry>> = {
  classic: { Component: ClassicInvitation, fontClassName: classicFontClassName },
};

export const DEFAULT_TEMPLATE_ID = "classic";

/** The template for events.template_id, or null when it doesn't exist. */
export function templateFor(id: string): TemplateEntry | null {
  return Object.hasOwn(TEMPLATES, id) ? TEMPLATES[id] : null;
}

export function defaultTemplate(): TemplateEntry {
  return TEMPLATES[DEFAULT_TEMPLATE_ID];
}
