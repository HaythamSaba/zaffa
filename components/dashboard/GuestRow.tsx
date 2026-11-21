"use client";

import { useState, useTransition } from "react";
import { removeRsvp, saveRsvpEdit } from "@/app/sites/[slug]/dashboard/actions";
import { dashboardMessage, guestCountLabel } from "@/lib/dashboard/messages";
import type { RsvpRow } from "@/lib/dashboard/types";

const MAX_NAME = 120;
const MAX_NOTES = 1000;
const MAX_GUESTS = 20;

type Props = {
  slug: string;
  row: RsvpRow;
  /** The demo event: edit and delete are hidden, not just disabled (CLAUDE.md/addition #5). */
  readOnly: boolean;
};

const fieldClass = "min-h-10 w-full border border-classic-smoke bg-classic-white px-2.5 text-sm text-classic-ink";
/** Small UI buttons: same caps/font as classic-caps, but less letter-spacing. */
const smallButtonCaps = "font-bodoni uppercase tracking-[0.1em]";

/** Attending/declined, told apart by text and shape (a filled vs. a hollow dot), not color alone. */
function AttendingBadge({ attending }: { attending: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden="true" className="shrink-0">
        <circle
          cx="5"
          cy="5"
          r="4"
          fill={attending ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
      {attending ? dashboardMessage("dashboard.statusAttending") : dashboardMessage("dashboard.statusDeclined")}
    </span>
  );
}

/** One guest's reply: a read view, or (when editing) an inline edit form. */
export function GuestRow({ slug, row, readOnly }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSave(formData: FormData) {
    const edit = {
      name: String(formData.get("name") ?? "").trim(),
      guestCount: Number(formData.get("guestCount")),
      attending: formData.get("attending") === "yes",
      notes: String(formData.get("notes") ?? "").trim() || null,
    };
    setError(null);
    startTransition(async () => {
      const result = await saveRsvpEdit(slug, row.id, edit);
      if (result.ok) setIsEditing(false);
      else setError(dashboardMessage("dashboard.saveError"));
    });
  }

  function handleDelete() {
    if (!window.confirm(dashboardMessage("dashboard.deleteConfirm"))) return;
    startTransition(async () => {
      await removeRsvp(slug, row.id);
    });
  }

  if (isEditing) {
    return (
      <li className="flex flex-col gap-2.5 border border-classic-rule bg-classic-white p-3.5">
        <form action={handleSave} className="flex flex-col gap-2.5">
          <input name="name" defaultValue={row.name} required maxLength={MAX_NAME} className={fieldClass} />
          <div className="flex gap-2.5">
            <input
              name="guestCount"
              type="number"
              min={1}
              max={MAX_GUESTS}
              defaultValue={row.guestCount}
              required
              className={`${fieldClass} w-20`}
            />
            <select name="attending" defaultValue={row.attending ? "yes" : "no"} className={fieldClass}>
              <option value="yes">{dashboardMessage("dashboard.statusAttending")}</option>
              <option value="no">{dashboardMessage("dashboard.statusDeclined")}</option>
            </select>
          </div>
          <textarea name="notes" defaultValue={row.notes ?? ""} maxLength={MAX_NOTES} rows={2} className={fieldClass} />
          {error && <p role="alert" className="m-0 text-sm text-classic-ink">{error}</p>}
          <div className="flex gap-2.5">
            <button
              type="submit"
              disabled={isPending}
              className={`${smallButtonCaps} min-h-10 flex-1 cursor-pointer bg-classic-umber text-[0.6875rem] text-classic-white disabled:opacity-60`}
            >
              {isPending ? dashboardMessage("dashboard.saving") : dashboardMessage("dashboard.save")}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={isPending}
              className={`${smallButtonCaps} min-h-10 flex-1 cursor-pointer border border-classic-smoke text-[0.6875rem] text-classic-ink disabled:opacity-60`}
            >
              {dashboardMessage("dashboard.cancel")}
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-1.5 border border-classic-rule bg-classic-white p-3.5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="m-0 text-[1.0625rem] text-classic-ink">{row.name}</p>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-classic-smoke">
          <AttendingBadge attending={row.attending} />
          {row.attending && (
            <>
              <span aria-hidden="true">·</span>
              {guestCountLabel(row.guestCount)}
            </>
          )}
        </span>
      </div>
      {row.notes && <p className="m-0 text-sm text-classic-smoke">{row.notes}</p>}
      {!readOnly && (
        <div className="mt-1 flex gap-2.5">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className={`${smallButtonCaps} min-h-9 cursor-pointer border border-classic-smoke px-3 text-[0.625rem] text-classic-ink`}
          >
            {dashboardMessage("dashboard.edit")}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className={`${smallButtonCaps} min-h-9 cursor-pointer border border-classic-gold px-3 text-[0.625rem] text-classic-ink disabled:opacity-60`}
          >
            {dashboardMessage("dashboard.delete")}
          </button>
        </div>
      )}
    </li>
  );
}
