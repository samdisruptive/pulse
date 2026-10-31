import { addDays, startOfMonth, startOfQuarter, subQuarters } from "date-fns";
import { z } from "zod";

import { formatRange } from "./format";

const presetSchema = z.enum(["7d", "28d", "90d", "month", "quarter"]);
const compareSchema = z.enum(["prev", "yoy"]);

export type DateRangeValue = {
  start: Date;
  end: Date;
  compareStart: Date;
  compareEnd: Date;
  days: number;
  label: string;
  compareLabel: string;
  preset: z.infer<typeof presetSchema> | "custom";
  compare: z.infer<typeof compareSchema>;
};

function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysBetween(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
}

function shift(date: Date, days: number): Date {
  return addDays(date, days);
}

export function parseDateRange(
  params: URLSearchParams,
  asOfIso: string,
): DateRangeValue {
  const asOf = parseIsoDate(asOfIso);
  if (!asOf) throw new Error("Demo as-of date is invalid.");

  const compare = compareSchema.safeParse(params.get("compare")).data ?? "prev";
  const preset = presetSchema.safeParse(params.get("range")).data;
  const from = parseIsoDate(params.get("from") ?? "");
  const to = parseIsoDate(params.get("to") ?? "");
  let start: Date;
  let end: Date;
  let resolvedPreset: DateRangeValue["preset"];

  if (from && to && from <= to) {
    start = from;
    end = to;
    resolvedPreset = "custom";
  } else if (preset === "month") {
    end = addDays(startOfMonth(asOf), -1);
    start = startOfMonth(end);
    resolvedPreset = preset;
  } else if (preset === "quarter") {
    end = addDays(startOfQuarter(asOf), -1);
    start = startOfQuarter(subQuarters(asOf, 1));
    resolvedPreset = preset;
  } else {
    const length = preset === "7d" ? 7 : preset === "90d" ? 90 : 28;
    end = asOf;
    start = shift(asOf, -(length - 1));
    resolvedPreset = preset ?? "28d";
  }

  const days = daysBetween(start, end);
  const compareStart =
    compare === "yoy" ? shift(start, -364) : shift(start, -days);
  const compareEnd = compare === "yoy" ? shift(end, -364) : shift(start, -1);

  return {
    start,
    end,
    compareStart,
    compareEnd,
    days,
    label: formatRange(start, end),
    compareLabel:
      compare === "yoy" ? "Same period last year" : "Previous period",
    preset: resolvedPreset,
    compare,
  };
}
