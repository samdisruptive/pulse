import Link from "next/link";

import type { DemoCatalog } from "@/demo/types";
import { describeChange } from "@/lib/metrics/change";
import { formatMoney } from "@/lib/format";
import { Card, CardHeader, Sparkline } from "@/components/pulse/cards";
import { Delta, SeverityTag, TierTag } from "@/components/pulse/tags";

export function AgencyOverview({ catalog }: { catalog: DemoCatalog }) {
  const open = catalog.issues.filter(
    (issue) => issue.status === "open" || issue.status === "ack",
  );
  const critical = open.filter((issue) => issue.severity === "critical").length;
  const spend = catalog.clients.reduce(
    (sum, client) =>
      sum + (client.kpis.find((item) => item.key === "adSpend")?.value ?? 0),
    0,
  );
  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] leading-8 font-bold tracking-[-0.02em]">
            Good morning, {catalog.viewer.name.split(" ")[0]}
          </h1>
          <p className="text-ink-muted text-[13px]">
            {open.length} things need attention, {critical} critical.
          </p>
        </div>
      </header>
      <section
        aria-label="Status"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"
      >
        {[
          ["Clients", String(catalog.clients.length), "4 fictional clients"],
          ["Needs attention", String(open.length), `${critical} critical`],
          ["Sites down", "1", "tidewatermarine.co.uk · 14 min"],
          ["Integrations failing", "1", "GA4 login · 1 client"],
          ["Stale data", "2", "sources past their sync window"],
        ].map(([label, value, note]) => (
          <Card key={label}>
            <p className="text-ink-muted text-xs">{label}</p>
            <p className="text-xl font-bold">{value}</p>
            <p className="text-ink-muted text-xs">{note}</p>
          </Card>
        ))}
      </section>
      <section className="grid gap-3 xl:grid-cols-2">
        <Card>
          <h2 className="text-[15px] font-bold">Primary KPI movement</h2>
          <div className="mt-3 flex h-7 overflow-hidden rounded-sm">
            <div className="bg-good flex-[2]" />
            <div className="bg-chart-comparison flex-1" />
            <div className="bg-bad flex-1" />
          </div>
          <p className="text-ink-muted mt-3 text-[13px]">
            2 better · 1 flat · 1 worse
          </p>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-bold">Managed ad spend</h2>
            <TierTag tier="platform" />
          </div>
          <p className="mt-3 text-[26px] leading-[30px] font-bold">
            <span className="tabular">
              {formatMoney(spend || 12480, "GBP")}
            </span>
          </p>
          <p className="text-ink-muted mt-2 text-xs">
            Spend only, converted to GBP. Revenue and ROAS are never added up
            across clients.
          </p>
        </Card>
      </section>
      <section className="grid items-start gap-3 xl:grid-cols-2">
        <Card flush>
          <CardHeader
            aside={
              <Link className="text-accent text-sm" href="/agency/issues">
                All issues
              </Link>
            }
            title="Needs attention"
          />
          {open.slice(0, 4).map((issue) => (
            <Link
              className="border-border hover:bg-surface-hover flex items-start gap-3 border-b px-4 py-3 last:border-0"
              href={`/agency/issues?issue=${issue.id}`}
              key={issue.id}
            >
              <SeverityTag severity={issue.severity} />
              <span>
                <span className="block text-sm font-semibold">
                  {issue.title}
                </span>
                <span className="text-ink-muted block text-xs">
                  {issue.section} · {issue.age} · {issue.fact}
                </span>
              </span>
            </Link>
          ))}
        </Card>
        <Card flush>
          <CardHeader
            aside={
              <span className="text-ink-muted text-xs">
                signals, not issues
              </span>
            }
            title="Significant changes"
          />
          <p className="text-ink-muted px-4 py-6 text-sm">
            Demo signals are shown on each client overview. They are not stored
            as issues.
          </p>
        </Card>
      </section>
      <Card flush>
        <CardHeader title="Movers" />
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="text-ink-muted text-left text-xs">
                {[
                  "Client",
                  "Type",
                  "Primary KPI",
                  "Current",
                  "Change",
                  "Trend",
                ].map((heading) => (
                  <th
                    className="border-border border-b px-4 py-3 font-semibold"
                    key={heading}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {catalog.clients.map((client) => {
                const metric =
                  client.kpis.find((item) => item.key === client.primary) ??
                  client.kpis[0];
                if (!metric) return null;
                const change = describeChange(metric);
                return (
                  <tr className="hover:bg-surface-hover" key={client.id}>
                    <td className="border-border border-b px-4 py-3">
                      <Link
                        className="font-semibold"
                        href={`/clients/${client.id}`}
                      >
                        {client.name}
                      </Link>
                    </td>
                    <td className="border-border text-ink-muted border-b px-4 py-3">
                      {client.type}
                    </td>
                    <td className="border-border border-b px-4 py-3">
                      {metric.label}
                    </td>
                    <td className="tabular border-border border-b px-4 py-3 text-right">
                      {metric.currency
                        ? formatMoney(metric.value, metric.currency)
                        : metric.value}
                    </td>
                    <td className="border-border border-b px-4 py-3 text-right">
                      <Delta judgement={change.judgement} text={change.text} />
                    </td>
                    <td className="border-border border-b px-4 py-3">
                      <Sparkline
                        label={`${client.name} trend`}
                        values={metric.spark}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
