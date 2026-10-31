import { ClientDirectory } from "@/features/agency/directory";
import { getDemoCatalog } from "@/demo/catalog";

export default function ClientsPage() {
  const catalog = getDemoCatalog();
  if (!catalog) return null;
  return <ClientDirectory catalog={catalog} />;
}
