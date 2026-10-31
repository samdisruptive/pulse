import { describe, expect, it } from "vitest";

import { isDemoModeEnabled } from "./demo-mode";

describe("isDemoModeEnabled", () => {
  it("is available for local review unless explicitly disabled", () => {
    expect(isDemoModeEnabled({ NODE_ENV: "development" })).toBe(true);
    expect(
      isDemoModeEnabled({ DEMO_DATA: "false", NODE_ENV: "development" }),
    ).toBe(false);
  });

  it("stays disabled in production", () => {
    expect(isDemoModeEnabled({ NODE_ENV: "production" })).toBe(false);
  });

  it("rejects demo data in production", () => {
    expect(() =>
      isDemoModeEnabled({ DEMO_DATA: "true", NODE_ENV: "production" }),
    ).toThrow("DEMO_DATA cannot be enabled in production.");
  });
});
