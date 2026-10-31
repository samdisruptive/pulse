import { IssuesBoard } from "@/features/agency/issues";
import { getDemoCatalog } from "@/demo/catalog";

export default function IssuesPage() {
  const catalog = getDemoCatalog();
  if (!catalog) return null;
  return <IssuesBoard catalog={catalog} />;
}
