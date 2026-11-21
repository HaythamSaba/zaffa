import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { rsvpsToCsv } from "@/lib/dashboard/csv";
import { getDashboardSessionSecret } from "@/lib/dashboard/env";
import { getDashboardEvent, listRsvpsForEvent } from "@/lib/dashboard/rsvp-store";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/dashboard/session";

const NO_STORE_HEADERS = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } as const;

/**
 * A Route Handler (not a Server Action) so it can set its own response
 * headers and Content-Disposition for a real file download. Allowed even for
 * the read-only demo event (CLAUDE.md/addition #5: export still works there).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const { slug } = await params;
  const event = await getDashboardEvent(slug);
  if (!event?.passwordHash) {
    return new NextResponse("Not found", { status: 404, headers: NO_STORE_HEADERS });
  }

  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const secret = getDashboardSessionSecret();
  if (!token || !verifySession(token, event.id, event.passwordHash, new Date(), secret)) {
    return new NextResponse("Unauthorized", { status: 401, headers: NO_STORE_HEADERS });
  }

  const rows = await listRsvpsForEvent(event.id);
  const csv = rsvpsToCsv(rows);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      ...NO_STORE_HEADERS,
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}-rsvps.csv"`,
    },
  });
}
