export type DemoTier =
  | "actual"
  | "measured"
  | "platform"
  | "google"
  | "crawler"
  | "derived";

export type DemoJudgement = "better" | "worse" | "neutral";
export type DemoFreshness = "ok" | "lagging" | "delayed" | "failing";
export type DemoSeverity = "critical" | "warning";

export type DemoKpi = {
  key: string;
  label: string;
  tier: DemoTier;
  value: number;
  previous: number;
  currency?: "GBP" | "EUR";
  unit: "money" | "count" | "percent" | "position";
  betterWhen: "up" | "down" | "neither";
  source: string;
  freshness: DemoFreshness;
  freshnessLabel: string;
  definition: string;
  spark: number[];
};

export type DemoSource = {
  name: string;
  mapped: string;
  synced: string;
  freshness: DemoFreshness;
  status: string;
};

export type DemoIssue = {
  id: string;
  title: string;
  severity: DemoSeverity;
  clientIds: string[];
  section: string;
  age: string;
  fact: string;
  status: "open" | "ack" | "snoozed" | "resolved";
};

export type DemoClient = {
  id: string;
  name: string;
  initials: string;
  type: "Ecommerce" | "Lead gen" | "Hybrid";
  owner: string;
  primary: string;
  brands: { id: string; name: string }[];
  sites: { id: string; domain: string; currency: "GBP" | "EUR" }[];
  sections: string[];
  kpis: DemoKpi[];
  sources: DemoSource[];
  channels: { name: string; share: number }[];
};

export type DemoCatalog = {
  label: "Demo data";
  asOf: "2026-10-19";
  viewer: { initials: string; name: string; role: string };
  clients: DemoClient[];
  issues: DemoIssue[];
};
