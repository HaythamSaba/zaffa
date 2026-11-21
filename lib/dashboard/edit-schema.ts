import { z } from "zod";
import { MAX_GUESTS, MAX_NAME_LENGTH, MAX_NOTES_LENGTH, MIN_GUESTS } from "@/lib/rsvp/schema";

/**
 * Server Actions run at the same trust level as a public API endpoint
 * (react/security.md): the couple's browser sends this, not just the
 * component that happens to render it, so it's validated here rather than
 * relying solely on the rsvps table's own CHECK constraints as a backstop.
 * Mirrors the same bounds the guest-facing RSVP form is validated against.
 */
export const rsvpEditSchema = z.object({
  name: z.string().trim().min(1).max(MAX_NAME_LENGTH).optional(),
  guestCount: z.number().int().min(MIN_GUESTS).max(MAX_GUESTS).optional(),
  attending: z.boolean().optional(),
  notes: z.string().trim().max(MAX_NOTES_LENGTH).nullable().optional(),
});

export type ValidatedRsvpEdit = z.infer<typeof rsvpEditSchema>;

export function parseRsvpEdit(edit: unknown): { success: true; data: ValidatedRsvpEdit } | { success: false } {
  const result = rsvpEditSchema.safeParse(edit);
  return result.success ? { success: true, data: result.data } : { success: false };
}
