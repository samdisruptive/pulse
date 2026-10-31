import { notFound } from "next/navigation";

import { getDemoCatalog, getDemoClient } from "@/demo/catalog";
import { ClientOverview } from "@/features/clients/overview";

export default async function ClientPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  if (!getDemoCatalog()) return null;
  const client = getDemoClient(clientId);
  if (!client) notFound();
  return <ClientOverview client={client} />;
}
