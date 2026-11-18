import { describe, expect, test } from "vitest";
import { InvitationDataError, buildInvitation } from "./build-invitation";
import { demoRows } from "./fixtures";

describe("buildInvitation", () => {
  test("turns the demo's rows into invitation data", () => {
    const invitation = buildInvitation(demoRows());

    expect(invitation.slug).toBe("layla-and-adam");
    expect(invitation.templateId).toBe("classic");
    expect(invitation.languages).toBe("en+ar");
    expect(invitation.package).toBe("premium");
    expect(invitation.startsAt.toISOString()).toBe("2027-06-12T16:00:00.000Z");
    expect(invitation.rsvpDeadline.toISOString()).toBe("2027-05-01T21:59:59.000Z");
    expect(invitation.timeZone).toBe("Europe/Vienna");
    expect(invitation.venueAddress).toBe("Rosengasse 12, 1010 Vienna");
    expect(invitation.contactPhone).toBe("+43 660 000 0000");
    expect(invitation.settings.arabicLocale).toBe("ar-EG");
    expect(invitation.texts.names).toEqual({ en: "Layla & Adam", ar: "ليلى وآدم" });
  });

  test("separates the couple photo from the gallery, in position order", () => {
    const invitation = buildInvitation(demoRows());

    expect(invitation.heroPhoto).toEqual({
      url: "/images/countdown.png",
      alt: { en: "The couple", ar: "العروسان" },
    });
    expect(invitation.gallery.map((photo) => photo.url)).toEqual([
      "/images/story.png",
      "/images/venue.png",
    ]);
  });

  test("builds the schedule from settings and content, skipping items with no title", () => {
    const rows = demoRows();
    rows.event.theme_settings = {
      schedule: [
        { id: "dinner", time: "19:30" },
        { id: "fireworks", time: "23:00" },
      ],
    };

    expect(buildInvitation(rows).schedule).toEqual([
      { id: "dinner", time: "19:30", title: { en: "Dinner", ar: "العشاء" } },
    ]);
  });

  test("keeps null translations out of the text map", () => {
    const rows = demoRows();
    rows.event.languages = "en";
    rows.content = [{ key: "names", text_en: "Sara & Omar", text_ar: null }];

    expect(buildInvitation(rows).texts.names).toEqual({ en: "Sara & Omar" });
  });

  test("no hero photo when none is uploaded", () => {
    const rows = demoRows();
    rows.media = [];

    const invitation = buildInvitation(rows);
    expect(invitation.heroPhoto).toBeNull();
    expect(invitation.gallery).toEqual([]);
  });

  test("rejects rows that don't match the schema", () => {
    const rows = demoRows();
    rows.event.languages = "fr";
    expect(() => buildInvitation(rows)).toThrow(InvitationDataError);
  });

  test("rejects invalid theme settings with a clear error", () => {
    const rows = demoRows();
    rows.event.theme_settings = { arabicLocale: "en-GB" };
    expect(() => buildInvitation(rows)).toThrow(InvitationDataError);
  });
});
