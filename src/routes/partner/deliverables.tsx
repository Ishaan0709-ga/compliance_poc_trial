import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/PortalShell";
import { Card, PageHeader, Pill, Btn } from "@/components/ui-kit";
import { Upload, FileSignature } from "lucide-react";

export const Route = createFileRoute("/partner/deliverables")({
  head: () => ({ meta: [{ title: "Deliverables — ComplyOS" }] }),
  component: Deliverables,
});

const ROWS = [
  { id: "FMB-2419", file: "GSTR-3B Apr 2026 — draft.xlsx", client: "Lumen Labs", state: "Sent for review", tone: "pend" as const },
  { id: "FMB-2410", file: "ITR-6 FY25-26 computation.pdf", client: "Hiveloop Tech", state: "Awaiting e-sign", tone: "pend" as const },
  { id: "FMB-2402", file: "AOC-4 draft.pdf", client: "Lumen Labs", state: "Drafting", tone: "n" as const },
  { id: "FMB-2388", file: "TDS Q4 24Q ack.pdf", client: "Lumen Labs", state: "Delivered", tone: "done" as const },
];

function Deliverables() {
  return (
    <PortalShell portalId="partner">
      <PageHeader
        title="Deliverables"
        subtitle="All files submitted to clients · audit trail with signatures."
        actions={<Btn><Upload className="h-4 w-4" /> New deliverable</Btn>}
      />
      <Card>
        <div className="divide-y divide-border">
          {ROWS.map((r) => (
            <div key={r.file} className="flex items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-muted/60">
                  <FileSignature className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="text-[13px] font-medium text-ink">{r.file}</div>
                  <div className="text-[11px] text-ink-4">{r.client} · {r.id}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Pill tone={r.tone}>{r.state}</Pill>
                <Btn variant="o">Open</Btn>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </PortalShell>
  );
}
