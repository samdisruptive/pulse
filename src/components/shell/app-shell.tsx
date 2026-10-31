"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Bell,
  Building2,
  CalendarRange,
  Download,
  LayoutGrid,
  Menu,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";

import type { DemoCatalog } from "@/demo/types";
import { parseDateRange } from "@/lib/date-range";
import { withSearch } from "@/lib/navigation";
import { Button } from "@/components/ui/button";

const agencyNav = [
  ["Overview", "/agency"],
  ["Issues", "/agency/issues"],
  ["Clients", "/agency/clients"],
  ["Reports", "/agency/reports"],
  ["Integrations", "/agency/integrations"],
  ["Settings", "/agency/settings"],
] as const;

const sectionLabels: Record<string, string> = {
  insights: "AI insights",
  knowledge: "Client knowledge",
  analytics: "Analytics",
  organic: "Organic search",
  paid: "Paid media",
  leads: "Leads",
  ecommerce: "Ecommerce",
  technical: "Technical SEO",
  uptime: "Uptime",
  issues: "Issues",
  reports: "Reports",
  settings: "Client settings",
};

export function AppShell({
  catalog,
  children,
}: {
  catalog: DemoCatalog | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [query, setQuery] = useState("");
  const range = catalog
    ? parseDateRange(new URLSearchParams(params.toString()), catalog.asOf)
    : null;
  const clientId = pathname.split("/")[2];
  const client = catalog?.clients.find((item) => item.id === clientId) ?? null;
  const openIssues =
    catalog?.issues.filter(
      (issue) =>
        issue.status === "open" &&
        (!client || issue.clientIds.includes(client.id)),
    ).length ?? 0;

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(true);
      }
      if (event.key === "Escape") {
        if (paletteOpen) setPaletteOpen(false);
        else if (dateOpen) setDateOpen(false);
        else if (menuOpen) setMenuOpen(false);
        else if (aiOpen) setAiOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aiOpen, dateOpen, menuOpen, paletteOpen]);

  function go(path: string, preserveClient = false) {
    const href = withSearch(
      path,
      new URLSearchParams(params.toString()),
      preserveClient ? {} : { scope: null, currency: null },
    );
    router.push(href);
    setPaletteOpen(false);
    setMenuOpen(false);
  }

  const sidebar = (
    <aside className="border-border bg-bg flex h-full w-60 shrink-0 flex-col gap-4 border-r px-3.5 py-5">
      <div className="flex items-center gap-3 px-1.5">
        <span className="bg-tile grid h-[34px] w-[34px] place-items-center rounded-md">
          <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M6 4h7.2a6.2 6.2 0 0 1 0 12.4H9.5V20H6V4Z" fill="white" />
          </svg>
        </span>
        <span>
          <span className="block text-[17px] leading-[18px] font-bold">
            Pulse
          </span>
          <span className="text-ink-muted block text-xs">by Disruptive</span>
        </span>
      </div>
      <button
        aria-label={
          client ? `Switch scope, ${client.name}` : "Switch scope, Agency"
        }
        className="border-border-strong bg-surface hover:bg-surface-hover flex h-[52px] w-full items-center gap-2.5 rounded-md border px-2.5 text-left font-semibold"
        onClick={() => setPaletteOpen(true)}
        type="button"
      >
        <span className="bg-accent-tint text-accent grid h-[30px] w-[30px] place-items-center rounded-lg text-[11px] font-bold">
          {client ? client.initials : <LayoutGrid size={16} />}
        </span>
        <span className="min-w-0">
          <span className="block truncate">
            {client ? client.name : "Agency"}
          </span>
          <span className="text-ink-muted block truncate text-xs font-normal">
            {client
              ? `${client.type} · ${client.brands.length} brands`
              : `All ${catalog?.clients.length ?? 0} clients`}
          </span>
        </span>
        <kbd className="mono border-border text-ink-muted ml-auto rounded-sm border px-1 py-0.5 text-[11px]">
          Ctrl K
        </kbd>
      </button>
      {client ? (
        <Link
          className="text-ink-muted hover:text-ink px-3 text-sm"
          href="/agency/clients"
        >
          All clients
        </Link>
      ) : null}
      <nav aria-label="Primary" className="flex flex-col gap-px">
        {(client
          ? [
              ["Overview", `/clients/${client.id}`],
              ...client.sections.map((section) => [
                sectionLabels[section] ?? section,
                `/clients/${client.id}/${section}`,
              ]),
            ]
          : agencyNav
        ).map(([label, href]) => {
          const current = pathname === href;
          const count = label === "Issues" ? openIssues : 0;
          return (
            <Link
              aria-current={current ? "page" : undefined}
              className={`flex min-h-[38px] items-center gap-3 rounded-md px-3 text-sm font-medium ${current ? "bg-accent-tint text-ink font-semibold" : "text-ink-muted hover:bg-surface hover:text-ink"}`}
              href={withSearch(
                href,
                new URLSearchParams(params.toString()),
                {},
              )}
              key={href}
              onClick={() => setMenuOpen(false)}
            >
              <span className={current ? "text-accent" : undefined}>
                {label}
              </span>
              {count > 0 ? (
                <span className="bg-critical text-on-critical ml-auto rounded-full px-1.5 text-xs">
                  {count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="border-border mt-auto flex items-center gap-2 border-t pt-3">
        <span className="bg-accent-tint text-accent grid h-[30px] w-[30px] place-items-center rounded-lg text-[11px] font-bold">
          {catalog?.viewer.initials ?? "DD"}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">
            {catalog?.viewer.name ?? "Signed out"}
          </span>
          <span className="text-ink-muted block text-xs">
            {catalog?.viewer.role ?? "Demo"}
          </span>
        </span>
        <button
          aria-label="Change theme"
          className="text-ink-muted ml-auto text-xs font-semibold"
          onClick={() =>
            setTheme(
              theme === "dark"
                ? "light"
                : theme === "light"
                  ? "system"
                  : "dark",
            )
          }
          suppressHydrationWarning
          type="button"
        >
          {theme ?? "system"}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="bg-bg text-ink flex h-full min-h-0">
      <div className="hidden min-[980px]:block">{sidebar}</div>
      {menuOpen ? (
        <div className="fixed inset-0 z-40 min-[980px]:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMenuOpen(false)}
            type="button"
          />
          <div className="relative h-full w-60">{sidebar}</div>
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-border bg-bg flex flex-wrap items-center gap-2 border-b px-6 py-3.5">
          <button
            aria-label="Open menu"
            className="min-[980px]:hidden"
            onClick={() => setMenuOpen(true)}
            type="button"
          >
            <Menu size={18} />
          </button>
          <p className="text-ink-muted mr-auto flex min-w-0 flex-wrap items-center gap-1.5 text-[13px]">
            <Link href="/agency">Agency</Link>
            {client ? (
              <>
                <span>/</span>
                <Link href={`/clients/${client.id}`}>{client.name}</Link>
              </>
            ) : null}
            <span>/</span>
            <strong className="text-ink font-semibold">
              {pageLabel(pathname)}
            </strong>
          </p>
          <span className="bg-accent-tint text-accent rounded-full px-2 py-0.5 text-xs font-semibold">
            {catalog?.label ?? "Demo off"}
          </span>
          {range ? (
            <div className="relative">
              <button
                aria-label={`Date range ${range.label}`}
                className="border-border-strong bg-surface inline-flex h-9 items-center gap-2 rounded-md border px-3 text-[13px] font-semibold"
                onClick={() => setDateOpen((open) => !open)}
                type="button"
              >
                <CalendarRange size={15} />
                {range.label}
                <span className="text-ink-muted font-normal">
                  {range.compareLabel}
                </span>
              </button>
              {dateOpen ? (
                <div className="border-border bg-surface absolute right-0 z-30 mt-2 w-64 rounded-lg border p-2 shadow-[var(--shadow-pop)]">
                  {(
                    [
                      ["7d", "Last 7 days"],
                      ["28d", "Last 28 days"],
                      ["90d", "Last 90 days"],
                      ["month", "Last calendar month"],
                      ["quarter", "Last quarter"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      className="hover:bg-surface-hover block w-full rounded-md px-2 py-1.5 text-left text-sm"
                      key={value}
                      onClick={() => {
                        router.push(
                          withSearch(
                            pathname,
                            new URLSearchParams(params.toString()),
                            { range: value, from: null, to: null },
                          ),
                        );
                        setDateOpen(false);
                      }}
                      type="button"
                    >
                      {label}
                    </button>
                  ))}
                  <button
                    className="hover:bg-surface-hover mt-1 block w-full rounded-md px-2 py-1.5 text-left text-sm"
                    onClick={() => {
                      router.push(
                        withSearch(
                          pathname,
                          new URLSearchParams(params.toString()),
                          {
                            compare: range.compare === "prev" ? "yoy" : "prev",
                          },
                        ),
                      );
                      setDateOpen(false);
                    }}
                    type="button"
                  >
                    Compare:{" "}
                    {range.compare === "prev"
                      ? "Same period last year"
                      : "Previous period"}
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
          <Button aria-label="Export" size="icon" variant="outline">
            <Download size={16} />
          </Button>
          <Button
            aria-pressed={aiOpen}
            onClick={() => setAiOpen((open) => !open)}
            variant="outline"
          >
            <Sparkles className="text-accent" size={16} /> Ask AI
          </Button>
          <Button aria-label="Notifications" size="icon" variant="outline">
            <Bell size={16} />
          </Button>
        </header>
        <div className="flex min-h-0 flex-1">
          <main className="min-w-0 flex-1 overflow-y-auto">
            <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-4 px-6 py-5 pb-12">
              {catalog ? (
                children
              ) : (
                <p>
                  Demo data is disabled. Set DEMO_DATA to a value other than
                  false outside production.
                </p>
              )}
            </div>
          </main>
          {aiOpen ? (
            <aside className="border-border bg-surface hidden w-[420px] shrink-0 border-l p-4 xl:block">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-bold">Ask AI</h2>
                <button
                  aria-label="Close Ask AI"
                  onClick={() => setAiOpen(false)}
                  type="button"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-ink-muted text-sm">
                The AI analyst is a placeholder in this visual milestone. It
                will use server-side context and evidence checks later.
              </p>
            </aside>
          ) : null}
        </div>
      </div>
      {paletteOpen && catalog ? (
        <div className="fixed inset-0 z-50 grid place-items-start bg-black/40 px-4 pt-24">
          <div
            aria-modal="true"
            className="border-border bg-surface w-full max-w-xl rounded-lg border shadow-[var(--shadow-pop)]"
            role="dialog"
          >
            <label className="border-border flex items-center gap-2 border-b px-3">
              <Search size={16} />
              <input
                autoFocus
                className="h-11 w-full bg-transparent outline-none"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Jump to a client or page"
                value={query}
              />
            </label>
            <div className="max-h-80 overflow-y-auto p-2">
              <button
                className="hover:bg-surface-hover flex w-full items-center gap-2 rounded-md px-2 py-2 text-left"
                onClick={() => go("/agency")}
                type="button"
              >
                <Building2 size={16} /> Agency overview
              </button>
              {catalog.clients
                .filter((item) =>
                  item.name.toLowerCase().includes(query.toLowerCase()),
                )
                .map((item) => (
                  <button
                    className="hover:bg-surface-hover flex w-full items-center gap-2 rounded-md px-2 py-2 text-left"
                    key={item.id}
                    onClick={() => go(`/clients/${item.id}`)}
                    type="button"
                  >
                    <span className="bg-accent-tint text-accent grid h-7 w-7 place-items-center rounded-lg text-[11px] font-bold">
                      {item.initials}
                    </span>
                    <span>
                      <span className="block font-semibold">{item.name}</span>
                      <span className="text-ink-muted block text-xs">
                        {item.type} · {item.sites[0]?.domain}
                      </span>
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function pageLabel(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 1 || (parts[0] === "clients" && parts.length === 2)) {
    return "Overview";
  }
  const segment = parts.at(-1) ?? "Overview";
  return (
    sectionLabels[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1)
  );
}
