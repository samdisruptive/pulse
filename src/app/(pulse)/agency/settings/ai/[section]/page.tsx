export default async function AiSettingsPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  return (
    <header>
      <h1 className="text-[26px] leading-8 font-bold tracking-[-0.02em]">AI and MCP</h1>
      <p className="mt-2 text-sm text-ink-muted">The {section} settings screen is reserved. No model calls are made in this milestone.</p>
    </header>
  );
}
