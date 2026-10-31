import { Suspense } from "react";

import { AppShell } from "@/components/shell/app-shell";
import { getDemoCatalog } from "@/demo/catalog";

export default function PulseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <AppShell catalog={getDemoCatalog()}>{children}</AppShell>
    </Suspense>
  );
}
