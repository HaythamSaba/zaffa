import { describe, expect, test, vi } from "vitest";
import type { Logger } from "@/lib/logger";
import { demoRows } from "./fixtures";
import { loadInvitation, type EventSource } from "./load-invitation";

function silentLogger(): Logger {
  return { warn: vi.fn(), error: vi.fn() };
}

function source(overrides: Partial<EventSource> = {}): EventSource {
  return {
    fetchPublished: vi.fn(async () => null),
    fetchDraftForPreview: vi.fn(async () => null),
    ...overrides,
  };
}

describe("loadInvitation", () => {
  test("loads a published invitation", async () => {
    const result = await loadInvitation(
      "layla-and-adam",
      undefined,
      source({ fetchPublished: async () => demoRows() }),
      silentLogger(),
    );

    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.invitation.slug).toBe("layla-and-adam");
      expect(result.preview).toBe(false);
    }
  });

  test("an unknown slug is not found", async () => {
    expect(await loadInvitation("nobody-and-noone", undefined, source(), silentLogger())).toEqual({
      status: "not-found",
    });
  });

  test("an invalid slug is not found without querying the database", async () => {
    const events = source();
    expect(await loadInvitation("../../etc", undefined, events, silentLogger())).toEqual({
      status: "not-found",
    });
    expect(events.fetchPublished).not.toHaveBeenCalled();
  });

  test("a draft opens only with its preview token", async () => {
    const events = source({
      fetchDraftForPreview: async (_slug, token) => (token === "good-token" ? demoRows() : null),
    });

    const withToken = await loadInvitation("layla-and-adam", "good-token", events, silentLogger());
    expect(withToken.status).toBe("ok");
    if (withToken.status === "ok") expect(withToken.preview).toBe(true);

    expect(await loadInvitation("layla-and-adam", "bad-token", events, silentLogger())).toEqual({
      status: "not-found",
    });
    expect(await loadInvitation("layla-and-adam", undefined, events, silentLogger())).toEqual({
      status: "not-found",
    });
  });

  test("an unreachable database shows the unavailable page and logs why", async () => {
    const logger = silentLogger();
    const result = await loadInvitation(
      "layla-and-adam",
      undefined,
      source({
        fetchPublished: async () => {
          throw new Error("fetch failed: ECONNREFUSED");
        },
      }),
      logger,
    );

    expect(result).toEqual({ status: "unavailable" });
    expect(logger.error).toHaveBeenCalledWith(
      "Invitation could not be loaded",
      expect.objectContaining({ slug: "layla-and-adam", reason: "fetch failed: ECONNREFUSED" }),
    );
  });

  test("invalid stored data shows the unavailable page rather than crashing", async () => {
    const rows = demoRows();
    rows.event.theme_settings = { arabicLocale: "fr-FR" };

    expect(
      await loadInvitation(
        "layla-and-adam",
        undefined,
        source({ fetchPublished: async () => rows }),
        silentLogger(),
      ),
    ).toEqual({ status: "unavailable" });
  });
});
