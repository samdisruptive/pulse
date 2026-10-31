import { notFound } from "next/navigation";

import { getDemoCatalog, getDemoClient } from "@/demo/catalog";
import { ClientSection } from "@/features/clients/section";

export default async function ClientSectionPage({
  params,
}: {
  params: Promise<{ clientId: string; section: string }>;
}) {
  const { clientId, section } = await params;
  if (!getDemoCatalog()) return null;
  const client = getDemoClient(clientId);
  if (!client) notFound();
  return <ClientSection client={client} section={section} />;
}
