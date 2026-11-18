import { describe, expect, test } from "vitest";
import { apiKeyHeaders } from "./rest-client";

describe("apiKeyHeaders", () => {
  test("legacy JWT keys are sent as apikey and bearer token", () => {
    expect(apiKeyHeaders("eyJhbGciOiJIUzI1NiJ9.payload.sig")).toEqual({
      apikey: "eyJhbGciOiJIUzI1NiJ9.payload.sig",
      Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.payload.sig",
    });
  });

  test("new publishable and secret keys go in the apikey header only", () => {
    expect(apiKeyHeaders("sb_publishable_abc")).toEqual({ apikey: "sb_publishable_abc" });
    expect(apiKeyHeaders("sb_secret_abc")).toEqual({ apikey: "sb_secret_abc" });
  });
});
