"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import type { DemoCatalog } from "@/demo/types";
import { describeChange } from "@/lib/metrics/change";
import { withSearch } from "@/lib/navigation";
import { Delta } from "@/components/pulse/tags";
import { formatMetricValue } from "@/components/pulse/cards";

export function ClientDirectory({ catalog }: { catalog: DemoCatalog }) {
  const params = useSearchParams();
  const router = useRouter();
  const query = params.get("q") ?? "";
  const type = params.get("type") ?? "all";
  const view = params.get("view") ?? "table";
  const clients = catalog.clients.filter((client) => {
    const matchesType = type === "all" || client.type === type;
    const haystack = `${client.name} ${client.sites.map((site) => site.domain).join(" ")}`.toLowerCase();
    return matchesType && haystack.includes(query.toLowerCase());
  });

  function update(key: string, value: string) {
    router.push(withSearch("/agency/clients", new URLSearchParams(params.toString()), { [key]: value || null }));
  }

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] leading-8 font-bold tracking-[-0.02em]">Clients</h1>
          <p className="text-[13px] text-ink-muted">{catalog.clients.length} demo clients</p>
        </div>
      </header>
      <div className="flex flex-wrap gap-2">
        <input aria-label="Search clients" className="h-9 min-w-60 flex-1 rounded-md border border-border-control bg-surface px-3" onChange={(event) => update("q", event.target.value)} placeholder="Search clients or domains" value={query} />
        {["all", "Ecommerce", "Lead gen", "Hybrid"].map((item) => (
          <button aria-pressed={type === item} className="h-9 rounded-md border border-border-strong px-3 text-xs font-semibold" key={item} onClick={() => update("type", item)} type="button">{item}</button>
        ))}
        <button className="h-9 rounded-md border border-border-strong px-3 text-xs font-semibold" onClick={() => update("view", view === "table" ? "cards" : "table")} type="button">{view === "table" ? "Cards" : "Table"}</button>
      </div>
      {clients.length === 0 ? <p className="text-sm text-ink-muted">No clients match that search.</p> : null}
      {view === "cards" ? (
        <section className="grid gap-3 md:grid-cols-2">
          {clients.map((client) => {
            const metric = client.kpis[0];
            const change = metric ? describeChange(metric) : null;
            return (
              <Link className="rounded-lg border border-border bg-surface p-4" href={`/clients/${client.id}`} key={client.id}>
                <h2 className="font-semibold">{client.name}</h2>
                <p className="text-xs text-ink-muted">{client.type}</p>
                {metric && change ? <p className="mt-3 flex items-center gap-2"><span className="text-xl font-bold">{formatMetricValue(metric)}</span><Delta judgement={change.judgement} text={change.text} /></p> : null}
              </Link>
            );
          })}
        </section>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-surface">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-xs text-ink-muted">
                {["Client", "Type", "Sites", "Primary"].map((heading) => <th className="border-b border-border px-4 py-3" key={heading}>{heading}</th>)}
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td className="border-b border-border px-4 py-3"><Link className="font-semibold" href={`/clients/${client.id}`}>{client.name}</Link></td>
                  <td className="border-b border-border px-4 py-3 text-ink-muted">{client.type}</td>
                  <td className="border-b border-border px-4 py-3">{client.sites.map((site) => site.domain).join(", ")}</td>
                  <td className="border-b border-border px-4 py-3">{client.kpis[0]?.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
