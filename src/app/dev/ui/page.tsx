import { notFound } from "next/navigation";

import { KpiCard } from "@/components/pulse/cards";
import { Button } from "@/components/ui/button";
import { Delta, SeverityTag, StatusBadge, TierTag } from "@/components/pulse/tags";
import { getDemoCatalog } from "@/demo/catalog";

export default function UiPage() {
  if (process.env.NODE_ENV === "production") notFound();
  const metric = getDemoCatalog()?.clients[0]?.kpis[0];
  return (
    <main className="grid max-w-3xl gap-4 p-6">
      <h1 className="text-[26px] font-bold">Components</h1>
      <div className="flex flex-wrap gap-2">
        <Button>Primary</Button>
        <Button variant="outline">Outline</Button>
        <TierTag tier="actual" />
        <TierTag tier="platform" />
        <TierTag tier="derived" />
        <Delta judgement="better" text="▲ 8.2%" />
        <Delta judgement="worse" text="▼ 4.1%" />
        <SeverityTag severity="critical" />
        <StatusBadge tone="healthy">OK</StatusBadge>
      </div>
      {metric ? <KpiCard metric={metric} /> : null}
    </main>
  );
}
