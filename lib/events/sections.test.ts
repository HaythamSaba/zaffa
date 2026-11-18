import { describe, expect, test } from "vitest";
import { buildInvitation } from "./build-invitation";
import { demoRows } from "./fixtures";
import { invitationSections, showsOpeningScreen } from "./sections";

describe("invitationSections", () => {
  test("Premium shows every section in the default order", () => {
    expect(invitationSections(buildInvitation(demoRows()))).toEqual([
      "welcome",
      "countdown",
      "story",
      "venue",
      "schedule",
      "dress_code",
      "gallery",
      "rsvp",
      "contact",
    ]);
  });

  test("Essential hides the schedule, dress code and gallery", () => {
    const rows = demoRows();
    rows.event.package = "essential";

    expect(invitationSections(buildInvitation(rows))).toEqual([
      "welcome",
      "countdown",
      "story",
      "venue",
      "rsvp",
      "contact",
    ]);
  });

  test("Bespoke shows everything Premium does", () => {
    const rows = demoRows();
    rows.event.package = "bespoke";
    expect(invitationSections(buildInvitation(rows))).toContain("gallery");
  });

  test("a section without its content is hidden, never shown empty", () => {
    const rows = demoRows();
    rows.content = rows.content.filter(
      (row) => row.key !== "story" && row.key !== "dress_code" && row.key !== "venue.name",
    );
    rows.media = rows.media.filter((photo) => photo.kind !== "gallery");
    rows.event.theme_settings = { schedule: [] };

    expect(invitationSections(buildInvitation(rows))).toEqual(["welcome", "countdown", "rsvp", "contact"]);
  });

  test("follows the couple's custom order, with the welcome always first", () => {
    const rows = demoRows();
    rows.event.theme_settings = {
      ...(rows.event.theme_settings as Record<string, unknown>),
      sections: ["gallery", "story", "rsvp", "story"],
    };

    expect(invitationSections(buildInvitation(rows))).toEqual(["welcome", "gallery", "story", "rsvp"]);
  });

  test("package gating still applies to a custom order", () => {
    const rows = demoRows();
    rows.event.package = "essential";
    rows.event.theme_settings = { sections: ["gallery", "schedule", "rsvp"] };

    expect(invitationSections(buildInvitation(rows))).toEqual(["welcome", "rsvp"]);
  });
});

describe("showsOpeningScreen", () => {
  test("Essential skips the opening screen; Premium and Bespoke have it", () => {
    expect(showsOpeningScreen("essential")).toBe(false);
    expect(showsOpeningScreen("premium")).toBe(true);
    expect(showsOpeningScreen("bespoke")).toBe(true);
  });
});
