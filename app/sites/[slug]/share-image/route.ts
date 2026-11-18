import { connection } from "next/server";
import { getInvitation } from "@/lib/events/get-invitation";
import { loadPhoto, renderShareImage } from "@/lib/events/share-image";

const ONE_HOUR_SECONDS = 60 * 60;

/**
 * The WhatsApp / social link-preview image: the couple photo as a 1200x630
 * JPEG. Public URL: /share-image on a couple's host, /sample/share-image for
 * the demo (proxy.ts rewrites both here).
 */
export async function GET(_request: Request, { params }: RouteContext<"/sites/[slug]/share-image">) {
  await connection();
  const { slug } = await params;
  const result = await getInvitation(slug);
  if (result.status === "not-found") return new Response("Not found", { status: 404 });

  const photo = result.status === "ok" ? await loadPhoto(result.invitation.heroPhoto?.url) : null;
  const jpeg = await renderShareImage(photo);

  return new Response(new Uint8Array(jpeg), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": `public, max-age=${ONE_HOUR_SECONDS}`,
    },
  });
}
