import { describe, expect, it } from "vitest";

import {
  formatDate,
  formatDateTime,
  formatMoney,
  formatNumber,
  formatPercent,
  formatPoints,
  formatPosition,
  formatRange,
} from "./format";

describe("formatters", () => {
  it("formats currency with symbols and thousands separators", () => {
    expect(formatMoney(412860, "GBP")).toBe("£412,860");
    expect(formatMoney(38900, "EUR")).toBe("€38,900");
    expect(formatMoney(1200.5, "USD", { pence: true })).toBe("$1,200.50");
    expect(formatMoney(-850, "GBP")).toBe("-£850");
    expect(formatMoney(12800, "GBP", { compact: true })).toMatch(/£12\.80k/i);
  });

  it("formats counts, percentages, points and positions", () => {
    expect(formatNumber(18420)).toBe("18,420");
    expect(formatPercent(3.2, 1)).toBe("3.2%");
    expect(formatPercent(0.12, 2)).toBe("0.12%");
    expect(formatPoints(0.12)).toBe("0.12 pts");
    expect(formatPosition(13.1, 14.2)).toBe("13.1 → 14.2");
  });

  it("formats dates and ranges in British style", () => {
    expect(formatDate(new Date(2026, 8, 22))).toBe("22 Sep");
    expect(formatDateTime(new Date(2026, 9, 17, 4, 10))).toBe("17 Oct 04:10");
    expect(formatRange(new Date(2026, 8, 22), new Date(2026, 9, 19))).toBe(
      "22 Sep - 19 Oct",
    );
  });
});
