export default function ReportsPage() {
  return <Placeholder title="Reports" copy="Report layouts will use the same shell. Scheduling stays off until a later milestone." />;
}

function Placeholder({ title, copy }: { title: string; copy: string }) {
  return (
    <header>
      <h1 className="text-[26px] leading-8 font-bold tracking-[-0.02em]">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">{copy}</p>
    </header>
  );
}
