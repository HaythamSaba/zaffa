import type { InvitationData } from "@/lib/events/build-invitation";
import { message } from "@/lib/i18n/messages";
import { ArchPhoto } from "../ArchPhoto";
import { SectionHeading } from "../SectionHeading";

type Props = { invitation: InvitationData };

/** "Moments" (Premium): photos in arches, two per row. */
export function Gallery({ invitation }: Props) {
  const { languages } = invitation;
  const title = message("gallery.title");

  return (
    <section aria-label={title.en ?? title.ar} className="flex flex-col items-center gap-5 px-6 py-13">
      <SectionHeading text={title} languages={languages} />
      <ul className="m-0 grid w-full list-none grid-cols-2 gap-2.5 p-0">
        {invitation.gallery.map((photo) => (
          <li key={photo.url}>
            <ArchPhoto
              photo={photo}
              languages={languages}
              sizes="(min-width: 480px) 220px, 46vw"
              placeholderLabel="Photo"
              className="h-47.5 w-full"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
