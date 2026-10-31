import { describe, expect, it } from "vitest";

import { parseDateRange } from "./date-range";

describe("parseDateRange", () => {
  it("defaults to the last 28 complete days against the previous period", () => {
    const range = parseDateRange(new URLSearchParams(), "2026-10-19");

    expect(range.label).toBe("22 Sep - 19 Oct");
    expect(range.days).toBe(28);
    expect(range.compareLabel).toBe("Previous period");
    expect(range.compareEnd.getDate()).toBe(21);
    expect(range.compareEnd.getMonth()).toBe(8);
  });

  it("aligns the same period last year to weekdays", () => {
    const range = parseDateRange(
      new URLSearchParams("compare=yoy"),
      "2026-10-19",
    );

    expect(range.compareStart.getDay()).toBe(range.start.getDay());
    expect(range.start.getTime() - range.compareStart.getTime()).toBe(
      364 * 86_400_000,
    );
  });

  it("accepts a validated custom range", () => {
    const range = parseDateRange(
      new URLSearchParams("from=2026-10-01&to=2026-10-10"),
      "2026-10-19",
    );

    expect(range.preset).toBe("custom");
    expect(range.days).toBe(10);
    expect(range.label).toBe("1 Oct - 10 Oct");
  });
});
