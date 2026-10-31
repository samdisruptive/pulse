import type { DemoJudgement, DemoKpi } from "@/demo/types";
import { formatPercent, formatPoints } from "@/lib/format";

export function describeChange(metric: DemoKpi): {
  text: string;
  judgement: DemoJudgement;
} {
  const difference = metric.value - metric.previous;
  const magnitude =
    metric.unit === "percent" || metric.unit === "position"
      ? difference
      : metric.previous === 0
        ? 0
        : (difference / metric.previous) * 100;
  const flatLimit =
    metric.unit === "position" ? 0.2 : metric.unit === "percent" ? 0.05 : 2;
  if (metric.unit === "position") {
    const text = `${metric.previous.toFixed(1)} → ${metric.value.toFixed(1)}`;
    if (Math.abs(magnitude) < flatLimit) return { text, judgement: "neutral" };
    const improved = metric.betterWhen === "down" ? difference < 0 : difference > 0;
    return { text, judgement: improved ? "better" : "worse" };
  }
  const text =
    metric.unit === "percent"
      ? formatPoints(Math.abs(magnitude))
      : formatPercent(Math.abs(magnitude));
  if (metric.betterWhen === "neither" || Math.abs(magnitude) < flatLimit) {
    return { text, judgement: "neutral" };
  }
  const improved =
    metric.betterWhen === "up" ? difference > 0 : difference < 0;
  return { text: `${difference > 0 ? "▲" : "▼"} ${text}`, judgement: improved ? "better" : "worse" };
}
