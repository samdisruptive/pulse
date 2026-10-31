import type { DemoFreshness, DemoJudgement, DemoSeverity, DemoTier } from "@/demo/types";
import { cn } from "@/lib/utils";

const tierLabels: Record<DemoTier, string> = {
  actual: "Actual",
  measured: "Measured",
  platform: "Platform-reported",
  google: "Google-reported",
  crawler: "Crawler-detected",
  derived: "Derived",
};

export function TierTag({ tier }: { tier: DemoTier }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-sm border border-border-strong px-1.5 text-[11px] font-semibold whitespace-nowrap text-ink-muted",
        (tier === "actual" || tier === "google") && "border-ink text-ink",
        (tier === "platform" || tier === "crawler") && "border-dashed",
        tier === "derived" && "border-dotted",
      )}
    >
      {tierLabels[tier]}
    </span>
  );
}

export function Delta({
  text,
  judgement,
}: {
  text: string;
  judgement: DemoJudgement;
}) {
  return (
    <span
      className={cn(
        "tabular inline-flex h-[22px] items-center rounded-full px-2 text-xs font-semibold whitespace-nowrap",
        judgement === "better" && "bg-good-tint text-good",
        judgement === "worse" && "bg-bad-tint text-bad",
        judgement === "neutral" && "bg-neutral-tint text-ink-muted",
      )}
    >
      {text}
    </span>
  );
}

export function SeverityTag({ severity }: { severity: DemoSeverity }) {
  return (
    <span
      className={cn(
        "inline-flex h-[22px] items-center gap-1.5 rounded-sm px-2 text-xs font-semibold",
        severity === "critical" && "bg-critical text-on-critical",
        severity === "warning" && "bg-warning-tint text-warning-ink",
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {severity === "critical" ? "Critical" : "Warning"}
    </span>
  );
}

export function StatusBadge({
  tone,
  children,
}: {
  tone: "info" | "healthy" | "neutral" | "warning" | "critical";
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-[22px] items-center gap-1.5 rounded-sm px-2 text-xs font-semibold",
        tone === "info" && "bg-info-tint text-info",
        tone === "healthy" && "bg-healthy-tint text-healthy-ink",
        tone === "neutral" && "bg-neutral-tint text-ink",
        tone === "warning" && "bg-warning-tint text-warning-ink",
        tone === "critical" && "bg-critical text-on-critical",
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

export function FreshnessDot({ status }: { status: DemoFreshness }) {
  if (status === "lagging") return null;
  return (
    <span
      className={cn(
        "inline-block h-2 w-2 shrink-0 rounded-full",
        status === "ok" && "bg-good",
        status === "delayed" && "border-2 border-bad bg-transparent",
        status === "failing" && "bg-critical",
      )}
    />
  );
}

export function SourceTag({ source }: { source: string }) {
  const tone =
    source.toLowerCase().includes("meta")
      ? "bg-info-tint text-info"
      : source.toLowerCase().includes("linkedin")
        ? "bg-linkedin-tint text-linkedin"
        : "bg-neutral-tint text-ink";
  return (
    <span className={cn("inline-flex h-[22px] items-center rounded-full px-2 text-xs font-semibold", tone)}>
      {source}
    </span>
  );
}
