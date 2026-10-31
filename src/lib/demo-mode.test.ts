import { describe, expect, it } from "vitest";

import { isDemoModeEnabled } from "./demo-mode";

describe("isDemoModeEnabled", () => {
  it("is disabled unless explicitly requested", () => {
    expect(isDemoModeEnabled({ NODE_ENV: "development" })).toBe(false);
  });

  it("can be enabled outside production", () => {
    expect(
      isDemoModeEnabled({ DEMO_DATA: "true", NODE_ENV: "development" }),
    ).toBe(true);
  });

  it("rejects demo data in production", () => {
    expect(() =>
      isDemoModeEnabled({ DEMO_DATA: "true", NODE_ENV: "production" }),
    ).toThrow("DEMO_DATA cannot be enabled in production.");
  });
});
