import type { DemoClient } from "@/demo/types";
import { Card } from "@/components/pulse/cards";
import { TrendChart } from "@/components/pulse/trend-chart";
import { TierTag } from "@/components/pulse/tags";

const tabs: Record<string, string[]> = {
  analytics: ["Traffic", "Acquisition", "Pages", "Conversions"],
  organic: ["Performance", "Queries", "Pages", "Countries"],
  leads: ["Overview", "List", "Forms"],
  ecommerce: ["Sales", "Products", "Stores"],
  technical: ["Indexing", "Core Web Vitals", "Sitemaps"],
};

export function ClientSection({
  client,
  section,
  tab,
}: {
  client: DemoClient;
  section: string;
  tab?: string;
}) {
  const available = client.sections.includes(section);
  const choices = tabs[section] ?? [];
  return (
    <>
      <header>
        <h1 className="text-[26px] leading-8 font-bold tracking-[-0.02em]">{sectionLabel(section)}</h1>
        <p className="text-[13px] text-ink-muted">{client.name} · demo layout</p>
      </header>
      {choices.length > 0 ? (
        <div className="flex gap-5 overflow-x-auto border-b border-border">
          {choices.map((choice) => (
            <span className={`-mb-px inline-flex h-[42px] items-center border-b-2 text-[13px] font-semibold ${choice.toLowerCase() === (tab ?? choices[0]?.toLowerCase()) ? "border-ink text-ink" : "border-transparent text-ink-muted"}`} key={choice}>
              {choice}
            </span>
          ))}
        </div>
      ) : null}
      {available ? (
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">{sectionLabel(section)}</h2>
            <TierTag tier={section === "organic" || section === "technical" ? "google" : section === "paid" ? "platform" : "measured"} />
          </div>
          <TrendChart points={["22 Sep", "29 Sep", "6 Oct", "13 Oct", "19 Oct"].map((label, index) => ({ label, current: 40 + index * 9, previous: 36 + index * 6 }))} />
          <p className="mt-3 text-xs text-ink-muted">Values are isolated demo fixtures. Missing provider data is not shown as zero.</p>
        </Card>
      ) : (
        <Card>
          <h2 className="font-bold">This section is not connected</h2>
          <p className="mt-2 text-sm text-ink-muted">The sidebar hides sections until a source is connected. This page is the direct-link state for {client.name}.</p>
        </Card>
      )}
    </>
  );
}

function sectionLabel(section: string): string {
  return section.replaceAll("-", " ").replace(/^\w/, (letter) => letter.toUpperCase());
}
