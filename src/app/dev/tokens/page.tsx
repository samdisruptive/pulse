import { notFound } from "next/navigation";

const names = [
  "bg", "surface", "surface-sunken", "ink", "ink-muted", "accent", "accent-fill",
  "on-accent", "good", "bad", "critical", "info", "linkedin", "chart-1", "chart-2", "chart-3",
];

export default function TokensPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="grid gap-4 p-6">
      <h1 className="text-[26px] font-bold">Tokens</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {names.map((name) => (
          <div className="overflow-hidden rounded-lg border border-border" key={name}>
            <div className="h-16" style={{ background: `var(--${name})` }} />
            <p className="px-2 py-1 text-xs">{name}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
