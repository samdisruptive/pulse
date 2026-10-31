import { isDemoModeEnabled } from "@/lib/demo-mode";

import type { DemoCatalog, DemoClient, DemoKpi } from "./types";

/**
 * Fictional visual fixtures copied in spirit from the prototype.
 * This module is the only demo data source. It is not production data.
 */
const spark = [12, 14, 13, 16, 15, 18, 17, 21, 19, 22, 24];

function kpi(input: DemoKpi): DemoKpi {
  return input;
}

const clients: DemoClient[] = [
  {
    id: "kestrel",
    name: "Kestrel Outdoor",
    initials: "KO",
    type: "Ecommerce",
    owner: "Casey Hale",
    primary: "storeRevenue",
    brands: [
      { id: "uk", name: "Kestrel UK" },
      { id: "eu", name: "Kestrel EU" },
    ],
    sites: [
      { id: "uk", domain: "kestreloutdoor.co.uk", currency: "GBP" },
      { id: "de", domain: "kestreloutdoor.de", currency: "EUR" },
    ],
    sections: ["insights", "knowledge", "analytics", "organic", "paid", "ecommerce", "technical", "uptime", "issues", "reports", "settings"],
    kpis: [
      kpi({ key: "storeRevenue", label: "Store revenue", tier: "actual", value: 186400, previous: 172200, currency: "GBP", unit: "money", betterWhen: "up", source: "Shopify", freshness: "ok", freshnessLabel: "Synced 08:05", definition: "Paid orders after discounts, excluding tax, shipping, cancelled and test orders.", spark }),
      kpi({ key: "orders", label: "Orders", tier: "actual", value: 642, previous: 598, unit: "count", betterWhen: "up", source: "Shopify", freshness: "ok", freshnessLabel: "Synced 08:05", definition: "Paid orders that were not cancelled or marked as test.", spark: [18, 20, 19, 22, 21, 24, 23, 26, 25, 28, 27] }),
      kpi({ key: "sessions", label: "Sessions", tier: "measured", value: 48210, previous: 45100, unit: "count", betterWhen: "up", source: "GA4", freshness: "ok", freshnessLabel: "Data to 19 Oct", definition: "GA4 sessions for mapped sites.", spark: [30, 32, 31, 34, 36, 35, 38, 37, 40, 42, 41] }),
      kpi({ key: "mer", label: "MER", tier: "derived", value: 4.2, previous: 3.8, unit: "count", betterWhen: "up", source: "Derived", freshness: "ok", freshnessLabel: "Calculated", definition: "Store revenue divided by ad spend for the same currency and period.", spark: [3.2, 3.4, 3.5, 3.6, 3.8, 3.7, 4, 3.9, 4.1, 4.2, 4.2] }),
    ],
    sources: [
      { name: "GA4", mapped: "2 properties", synced: "07:40", freshness: "ok", status: "OK" },
      { name: "Search Console", mapped: "2 properties", synced: "Data to 17 Oct", freshness: "lagging", status: "OK" },
      { name: "Shopify", mapped: "2 stores", synced: "08:05", freshness: "ok", status: "OK" },
      { name: "Meta Ads", mapped: "1 account", synced: "06:20", freshness: "delayed", status: "Delayed" },
    ],
    channels: [
      { name: "Paid social", share: 34 },
      { name: "Organic search", share: 27 },
      { name: "Direct", share: 18 },
      { name: "Paid search", share: 14 },
      { name: "Email", share: 7 },
    ],
  },
  {
    id: "bramley",
    name: "Bramley Legal",
    initials: "BL",
    type: "Lead gen",
    owner: "Samir Shah",
    primary: "formLeads",
    brands: [{ id: "main", name: "Bramley" }],
    sites: [{ id: "uk", domain: "bramleylegal.co.uk", currency: "GBP" }],
    sections: ["insights", "knowledge", "analytics", "organic", "paid", "leads", "technical", "uptime", "issues", "reports", "settings"],
    kpis: [
      kpi({ key: "formLeads", label: "Form leads", tier: "actual", value: 86, previous: 74, unit: "count", betterWhen: "up", source: "Meta and LinkedIn", freshness: "ok", freshnessLabel: "Synced 08:12", definition: "Stored lead form submissions, excluding test and repeat leads.", spark: [4, 5, 6, 5, 7, 8, 6, 9, 8, 10, 9] }),
      kpi({ key: "adSpend", label: "Ad spend", tier: "platform", value: 12480, previous: 11820, currency: "GBP", unit: "money", betterWhen: "neither", source: "Paid media", freshness: "ok", freshnessLabel: "Synced 06:40", definition: "Spend reported by each ad platform. Platforms are not added together for conversions.", spark }),
    ],
    sources: [
      { name: "GA4", mapped: "1 property", synced: "07:40", freshness: "ok", status: "OK" },
      { name: "LinkedIn Ads", mapped: "1 account", synced: "06:40", freshness: "ok", status: "OK" },
    ],
    channels: [
      { name: "Paid social", share: 46 },
      { name: "Organic search", share: 31 },
      { name: "Direct", share: 23 },
    ],
  },
  {
    id: "northfield",
    name: "Northfield Clinics",
    initials: "NC",
    type: "Hybrid",
    owner: "Casey Hale",
    primary: "leads",
    brands: [{ id: "main", name: "Northfield" }],
    sites: [{ id: "uk", domain: "northfieldclinics.co.uk", currency: "GBP" }],
    sections: ["analytics", "organic", "technical", "uptime", "issues", "reports", "settings"],
    kpis: [
      kpi({ key: "leads", label: "Website leads", tier: "measured", value: 41, previous: 63, unit: "count", betterWhen: "up", source: "GA4", freshness: "delayed", freshnessLabel: "Tracking suspected", definition: "Configured GA4 lead events. Missing data is not treated as zero.", spark: [8, 7, 8, 6, 5, 4, 3, 2, 2, 1, 1] }),
    ],
    sources: [
      { name: "GA4", mapped: "1 property", synced: "18 Oct 21:10", freshness: "delayed", status: "Delayed" },
    ],
    channels: [
      { name: "Organic search", share: 52 },
      { name: "Direct", share: 28 },
      { name: "Referral", share: 20 },
    ],
  },
  {
    id: "tidewater",
    name: "Tidewater Marine",
    initials: "TM",
    type: "Ecommerce",
    owner: "Jordan Adeyemi",
    primary: "storeRevenue",
    brands: [{ id: "main", name: "Tidewater" }],
    sites: [{ id: "uk", domain: "tidewatermarine.co.uk", currency: "GBP" }],
    sections: ["analytics", "organic", "ecommerce", "uptime", "issues", "reports", "settings"],
    kpis: [
      kpi({ key: "storeRevenue", label: "Store revenue", tier: "actual", value: 42800, previous: 46100, currency: "GBP", unit: "money", betterWhen: "up", source: "Shopify", freshness: "failing", freshnessLabel: "Site down", definition: "Paid Shopify orders for the mapped store.", spark: [10, 11, 9, 8, 7, 6, 4, 2, 1, 0, 0] }),
    ],
    sources: [
      { name: "Uptime", mapped: "1 site", synced: "Now", freshness: "failing", status: "Down" },
    ],
    channels: [
      { name: "Direct", share: 40 },
      { name: "Organic search", share: 36 },
      { name: "Email", share: 24 },
    ],
  },
];

const catalog: DemoCatalog = {
  label: "Demo data",
  asOf: "2026-10-19",
  viewer: { initials: "CH", name: "Casey Hale", role: "Admin" },
  clients,
  issues: [
    { id: "ga4-peak", title: "GA4 login needs reconnecting", severity: "critical", clientIds: ["northfield"], section: "Analytics", age: "2 days", fact: "Not synced since 17 Oct 04:10", status: "open" },
    { id: "tide-down", title: "tidewatermarine.co.uk is not responding", severity: "critical", clientIds: ["tidewater"], section: "Uptime", age: "14 min", fact: "Connection timed out from the monitoring server", status: "open" },
    { id: "meta-de", title: "Meta purchases missing on the German store", severity: "warning", clientIds: ["kestrel"], section: "Paid media", age: "5 days", fact: "Platform conversions dropped while store orders held", status: "open" },
    { id: "tracking", title: "Website lead tracking looks incomplete", severity: "warning", clientIds: ["northfield"], section: "Analytics", age: "6 days", fact: "Lead events fell while sessions stayed steady", status: "ack" },
  ],
};

export function getDemoCatalog(): DemoCatalog | null {
  if (!isDemoModeEnabled(process.env)) return null;
  return catalog;
}

export function getDemoClient(id: string): DemoClient | null {
  return getDemoCatalog()?.clients.find((client) => client.id === id) ?? null;
}
