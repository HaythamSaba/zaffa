import { describe, expect, test } from "vitest";
import { buildInvitation } from "./build-invitation";
import { demoRows } from "./fixtures";
import { mapLinkFor } from "./map-url";

describe("mapLinkFor", () => {
  test("searches the venue address on Google Maps", () => {
    expect(mapLinkFor(buildInvitation(demoRows()))).toBe(
      "https://www.google.com/maps/search/?api=1&query=Rosengasse%2012%2C%201010%20Vienna",
    );
  });

  test("the couple's own map link wins", () => {
    const rows = demoRows();
    rows.event.theme_settings = { mapUrl: "https://maps.app.goo.gl/abc123" };
    expect(mapLinkFor(buildInvitation(rows))).toBe("https://maps.app.goo.gl/abc123");
  });

  test("no address and no link means no directions button", () => {
    const rows = demoRows();
    rows.event.venue = "  ";
    rows.event.theme_settings = {};
    expect(mapLinkFor(buildInvitation(rows))).toBeNull();
  });
});
