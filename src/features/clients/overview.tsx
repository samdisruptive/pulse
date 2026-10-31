import Link from "next/link";

import type { DemoClient } from "@/demo/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, KpiCard } from "@/components/pulse/cards";
import { TrendChart } from "@/components/pulse/trend-chart";
import { SeverityTag, StatusBadge, TierTag } from "@/components/pulse/tags";
import { Sparkles } from "lucide-react";

export function ClientOverview({ client }: { client: DemoClient }) {
  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] leading-8 font-bold tracking-[-0.02em]">{client.name}</h1>
          <p className="text-[13px] text-ink-muted">{client.type} · Owner {client.owner} · {client.sites.map((site) => site.domain).join(", ")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Sparkles className="text-accent" size={16} /> Summarise with AI</Button>
          <Button>Generate report</Button>
        </div>
      </header>
      <section aria-label="Key metrics" className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {client.kpis.map((metric) => (
          <KpiCard key={metric.key} metric={metric} stale={metric.freshness === "failing" || metric.freshness === "delayed"} />
        ))}
      </section>
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-bold">Trend</h2>
          <TierTag tier={client.kpis[0]?.tier ?? "measured"} />
        </div>
        <TrendChart
          points={["22 Sep", "29 Sep", "6 Oct", "13 Oct", "19 Oct"].map((label, index) => ({
            label,
            current: 80 + index * 12,
            previous: 70 + index * 8,
          }))}
        />
      </Card>
      <section className="grid items-start gap-3 xl:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[15px] font-bold">Traffic and acquisition</h2>
            <TierTag tier="measured" />
          </div>
          <div className="grid gap-2">
            {client.channels.map((channel) => (
              <div className="grid grid-cols-[140px_1fr_48px] items-center gap-2 text-sm" key={channel.name}>
                <span>{channel.name}</span>
                <span className="h-2 rounded-full bg-surface-sunken">
                  <span className="block h-2 rounded-full bg-chart-1" style={{ width: `${channel.share}%` }} />
                </span>
                <span className="tabular text-right">{channel.share}%</span>
              </div>
            ))}
          </div>
          {client.sections.includes("analytics") ? (
            <Link className="mt-3 inline-block text-sm text-accent" href={`/clients/${client.id}/analytics`}>Open Analytics</Link>
          ) : null}
        </Card>
        <Card flush>
          <CardHeader title="Data sources" />
          <table className="w-full text-[13px]">
            <tbody>
              {client.sources.map((source) => (
                <tr key={source.name}>
                  <td className="border-b border-border px-4 py-3">{source.name}</td>
                  <td className="border-b border-border px-4 py-3 text-ink-muted">{source.mapped}</td>
                  <td className="border-b border-border px-4 py-3">{source.synced}</td>
                  <td className="border-b border-border px-4 py-3">
                    <StatusBadge tone={source.freshness === "failing" ? "critical" : source.freshness === "delayed" ? "warning" : "healthy"}>{source.status}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
      {client.id === "kestrel" ? (
        <Card>
          <SeverityTag severity="warning" />
          <p className="mt-2 text-sm">Meta purchases missing on the German store. Platform conversions are not estimated.</p>
        </Card>
      ) : null}
    </>
  );
}
