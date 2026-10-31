"use client";

import { useRouter, useSearchParams } from "next/navigation";

import type { DemoCatalog } from "@/demo/types";
import { withSearch } from "@/lib/navigation";
import { SeverityTag } from "@/components/pulse/tags";
import { Card } from "@/components/pulse/cards";

const statuses = ["open", "ack", "snoozed", "resolved"] as const;

export function IssuesBoard({ catalog }: { catalog: DemoCatalog }) {
  const params = useSearchParams();
  const router = useRouter();
  const status = params.get("status") ?? "open";
  const severity = params.get("severity") ?? "all";
  const selected = params.get("issue");
  const issues = catalog.issues.filter((issue) => issue.status === status && (severity === "all" || issue.severity === severity));
  const current = catalog.issues.find((issue) => issue.id === selected);

  function update(key: string, value: string) {
    router.push(withSearch("/agency/issues", new URLSearchParams(params.toString()), { [key]: value }));
  }

  return (
    <>
      <header>
        <h1 className="text-[26px] leading-8 font-bold tracking-[-0.02em]">Issues</h1>
        <p className="text-[13px] text-ink-muted">Problems that need someone to act. Changes that need no action stay with the signals.</p>
      </header>
      <div className="flex flex-wrap gap-2">
        {statuses.map((item) => (
          <button aria-pressed={status === item} className={`h-9 rounded-md px-3 text-xs font-semibold ${status === item ? "bg-surface text-ink shadow-[var(--shadow-xs)]" : "text-ink-muted"} bg-surface-sunken`} key={item} onClick={() => update("status", item)} type="button">
            {item}
          </button>
        ))}
        {["all", "critical", "warning"].map((item) => (
          <button aria-pressed={severity === item} className={`h-9 rounded-md border px-3 text-xs font-semibold ${severity === item ? "border-ink" : "border-border-strong"}`} key={item} onClick={() => update("severity", item)} type="button">
            {item}
          </button>
        ))}
      </div>
      <Card flush>
        {issues.length === 0 ? (
          <p className="px-4 py-6 text-sm text-ink-muted">No {status} issues for this filter.</p>
        ) : issues.map((issue) => (
          <button className="flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left last:border-0 hover:bg-surface-hover" key={issue.id} onClick={() => update("issue", issue.id)} type="button">
            <SeverityTag severity={issue.severity} />
            <span>
              <span className="block text-sm font-semibold">{issue.title}</span>
              <span className="block text-xs text-ink-muted">{issue.section} · {issue.age} · {issue.fact}</span>
            </span>
          </button>
        ))}
      </Card>
      {current ? (
        <aside className="fixed inset-y-0 right-0 z-40 w-full max-w-[560px] overflow-y-auto border-l border-border bg-surface p-6 shadow-[var(--shadow-pop)]">
          <SeverityTag severity={current.severity} />
          <h2 className="mt-3 text-xl font-bold">{current.title}</h2>
          <p className="mt-2 text-sm text-ink-muted">{current.fact}</p>
          <p className="mt-4 text-sm">Age {current.age}. This detail view uses demo fixture state only.</p>
          <button className="mt-6 text-sm font-semibold text-accent" onClick={() => update("issue", "")} type="button">Close</button>
        </aside>
      ) : null}
    </>
  );
}
