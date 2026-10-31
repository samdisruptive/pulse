"use client";

import { useState } from "react";
import { Info } from "lucide-react";

import type { DemoKpi } from "@/demo/types";
import { describeChange } from "@/lib/metrics/change";
import { formatMoney, formatNumber, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

import { Delta, FreshnessDot, TierTag } from "./tags";

export function Card({
  children,
  className,
  flush = false,
}: {
  children: React.ReactNode;
  className?: string;
  flush?: boolean;
}) {
  return (
    <section
      className={cn(
        "min-w-0 rounded-lg border border-border bg-surface",
        flush ? "overflow-hidden" : "p-4",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  icon,
  aside,
}: {
  title: string;
  icon?: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[52px] flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
      <h2 className="inline-flex items-center gap-2 text-[15px] leading-[22px] font-bold">
        {icon}
        {title}
      </h2>
      {aside}
    </div>
  );
}

export function formatMetricValue(metric: DemoKpi): string {
  if (metric.unit === "money" && metric.currency) {
    return formatMoney(metric.value, metric.currency);
  }
  if (metric.unit === "percent") return formatPercent(metric.value);
  if (metric.key === "mer") return metric.value.toFixed(1);
  return formatNumber(metric.value);
}

export function Sparkline({ values, label }: { values: number[]; label: string }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 76;
      const y = 32 - ((value - min) / Math.max(max - min, 1)) * 28;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg className="h-9 w-[76px]" viewBox="0 0 76 36" role="img" aria-label={label}>
      <polyline
        fill="none"
        points={points}
        stroke="var(--chart-current)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function KpiCard({ metric, stale = false }: { metric: DemoKpi; stale?: boolean }) {
  const change = describeChange(metric);
  const [open, setOpen] = useState(false);
  return (
    <article className="@container flex flex-col gap-2.5 rounded-lg border border-border bg-surface p-3">
      <div className="flex items-center justify-between gap-2 px-1">
        <h3 className="text-sm font-semibold">{metric.label}</h3>
        <TierTag tier={metric.tier} />
      </div>
      <div className="flex items-end justify-between gap-2.5 rounded-panel bg-surface-sunken p-3.5">
        <div className="flex min-w-0 flex-col gap-2">
          <p className={cn("truncate text-[26px] leading-[30px] font-bold tracking-[-0.02em]", stale && "text-ink-muted")}>
            <span className="tabular">{formatMetricValue(metric)}</span>
          </p>
          <p className="flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
            <Delta judgement={change.judgement} text={change.text} />
            vs previous
          </p>
        </div>
        <div className="@max-[250px]:hidden">
          <Sparkline label={`${metric.label} trend`} values={metric.spark} />
        </div>
      </div>
      <footer className="flex items-center justify-between gap-2 px-1 text-xs text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <FreshnessDot status={metric.freshness} />
          {metric.source} · {metric.freshnessLabel}
        </span>
        <button
          aria-expanded={open}
          aria-label={`About ${metric.label}`}
          className="grid h-6 w-6 place-items-center rounded-full border border-border-strong"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          <Info aria-hidden="true" size={12} />
        </button>
      </footer>
      {open ? (
        <p className="rounded-md border border-dashed border-border-strong px-3 py-2.5 text-xs leading-[17px]">
          {metric.definition}
        </p>
      ) : null}
    </article>
  );
}
