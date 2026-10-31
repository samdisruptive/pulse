import { AgencyOverview } from "@/features/agency/overview";
import { getDemoCatalog } from "@/demo/catalog";

export default function AgencyPage() {
  const catalog = getDemoCatalog();
  if (!catalog) return null;
  return <AgencyOverview catalog={catalog} />;
}
