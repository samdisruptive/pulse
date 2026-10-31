"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function TrendChart({
  points,
}: {
  points: { label: string; current: number; previous: number }[];
}) {
  return (
    <div className="h-56">
      <ResponsiveContainer height="100%" width="100%">
        <LineChart data={points}>
          <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
          <XAxis dataKey="label" stroke="var(--ink-muted)" tickLine={false} />
          <YAxis stroke="var(--ink-muted)" tickLine={false} width={48} />
          <Tooltip />
          <Line
            dataKey="previous"
            dot={false}
            name="Previous"
            stroke="var(--chart-comparison)"
            strokeDasharray="4 4"
            strokeWidth={2}
          />
          <Line
            dataKey="current"
            dot={false}
            name="Current"
            stroke="var(--chart-current)"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
