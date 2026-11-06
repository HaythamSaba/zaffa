import "server-only";
import { Resend } from "resend";
import { packageOptionLabel } from "@/lib/format";
import { packages } from "@/lib/site-config";
import type { ContactInquiry } from "./schema";
import type { PackageChoice } from "./types";

export interface EmailMessage {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
}

export interface EmailClientResult {
  data: { id: string } | null;
  error: { name: string; message: string } | null;
}

export interface EmailClient {
  send(message: EmailMessage): Promise<EmailClientResult>;
}

export type SendResult = { ok: true; id?: string } | { ok: false; reason: string };

interface Addresses {
  to: string;
  from: string;
}

const MAX_SUBJECT_LENGTH = 150;
const EMPTY = "—";

function packageLabel(choice: PackageChoice): string {
  const pkg = packages.find((p) => p.id === choice);
  return pkg ? packageOptionLabel(pkg) : "Not sure yet";
}

function singleLine(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

/** Plain text only: no HTML, so nothing the visitor typed can inject markup. */
export function buildInquiryEmail(inquiry: ContactInquiry, { to, from }: Addresses): EmailMessage {
  const subject = singleLine(`New inquiry: ${inquiry.names}`).slice(0, MAX_SUBJECT_LENGTH);
  const text = [
    "New inquiry from the Zaffa website",
    "",
    `Names: ${inquiry.names}`,
    `Email: ${inquiry.email}`,
    `Wedding date: ${inquiry.weddingDate ?? EMPTY}`,
    `Package: ${packageLabel(inquiry.package)}`,
    `Languages: ${inquiry.languages ?? EMPTY}`,
    `Wedding city: ${inquiry.city ?? EMPTY}`,
    "",
    "Message:",
    inquiry.message ?? EMPTY,
  ].join("\n");

  return { from, to, replyTo: inquiry.email, subject, text };
}

export async function sendInquiryEmail(
  inquiry: ContactInquiry,
  addresses: Addresses,
  client: EmailClient,
): Promise<SendResult> {
  try {
    const { data, error } = await client.send(buildInquiryEmail(inquiry, addresses));
    if (error) return { ok: false, reason: `${error.name}: ${error.message}` };
    return { ok: true, id: data?.id };
  } catch (error: unknown) {
    return { ok: false, reason: error instanceof Error ? error.message : "Unknown error" };
  }
}

export function createResendClient(apiKey: string): EmailClient {
  const resend = new Resend(apiKey);
  return {
    async send(message) {
      const { data, error } = await resend.emails.send(message);
      return {
        data: data ? { id: data.id } : null,
        error: error ? { name: error.name, message: error.message } : null,
      };
    },
  };
}
