import { describe, expect, test } from "vitest";
import { toEventRows } from "./supabase-source";

describe("toEventRows", () => {
  test("splits an embedded Supabase row into event, content and media", () => {
    const rows = toEventRows({
      slug: "layla-and-adam",
      template_id: "classic",
      languages: "en+ar",
      package: "premium",
      starts_at: "2027-06-12T16:00:00+00:00",
      timezone: "Europe/Vienna",
      venue: "Rosengasse 12, 1010 Vienna",
      rsvp_deadline: "2027-05-01T21:59:59+00:00",
      contact_phone: "+43 660 000 0000",
      theme_settings: { demo: true },
      content: [{ key: "names", text_en: "Layla & Adam", text_ar: "ليلى وآدم" }],
      media: [{ kind: "hero", url: "/images/countdown.png", position: 0, alt_en: "x", alt_ar: "س" }],
    });

    expect(rows.event.slug).toBe("layla-and-adam");
    expect(rows.event).not.toHaveProperty("content");
    expect(rows.content).toEqual([{ key: "names", text_en: "Layla & Adam", text_ar: "ليلى وآدم" }]);
    expect(rows.media).toHaveLength(1);
  });

  test("treats missing embeds as empty lists", () => {
    const rows = toEventRows({
      slug: "sara-and-omar",
      template_id: "classic",
      languages: "en",
      package: "essential",
      starts_at: "2027-06-12T16:00:00+00:00",
      timezone: "Europe/Berlin",
      venue: "",
      rsvp_deadline: "2027-05-01T21:59:59+00:00",
      contact_phone: "+49 151 23456789",
      theme_settings: {},
      content: null,
      media: null,
    });

    expect(rows.content).toEqual([]);
    expect(rows.media).toEqual([]);
  });
});
