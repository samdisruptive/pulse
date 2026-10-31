import { notFound } from "next/navigation";

import { getDemoCatalog, getDemoClient } from "@/demo/catalog";
import { ClientSection } from "@/features/clients/section";

export default async function ClientTabPage({
  params,
}: {
  params: Promise<{ clientId: string; section: string; tab: string }>;
}) {
  const { clientId, section, tab } = await params;
  if (!getDemoCatalog()) return null;
  const client = getDemoClient(clientId);
  if (!client) notFound();
  return <ClientSection client={client} section={section} tab={tab} />;
}
