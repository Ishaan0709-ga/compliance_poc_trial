import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/PortalShell";
import { Card, PageHeader, Pill, Btn, Kpi } from "@/components/ui-kit";

export const Route = createFileRoute("/partner/assignments")({
  head: () => ({ meta: [{ title: "Assignments — ComplyOS" }] }),
  component: Assignments,
});

const ROWS = [
  { id: "FMB-2419", svc: "GSTR-3B — Lumen Labs", due: "May 18", stage: "Awaiting docs", tone: "pend" as const, fee: "₹ 1,499" },
  { id: "FMB-2402", svc: "AOC-4 — Lumen Labs", due: "May 28", stage: "Drafting", tone: "pend" as const, fee: "₹ 7,999" },
  { id: "FMB-2410", svc: "ITR-6 — Hiveloop Tech", due: "May 22", stage: "Review", tone: "pend" as const, fee: "₹ 12,000" },
  { id: "FMB-2399", svc: "GSTR-1 — Saffron Studios", due: "May 11", stage: "Filing today", tone: "miss" as const, fee: "₹ 1,499" },
  { id: "FMB-2388", svc: "TDS Q4 — Lumen Labs", due: "Apr 30", stage: "Filed", tone: "done" as const, fee: "₹ 999" },
];

function Assignments() {
  return (
    <PortalShell portalId="partner">
      <PageHeader title="Assignments" subtitle="Workflow & SLA tracker for every active client." />
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi value="5" label="Active" />
        <Kpi value="2" label="Due this week" tone="dn" />
        <Kpi value="98%" label="On-time delivery" tone="up" />
        <Kpi value="₹ 23,996" label="In-progress fees" />
      </div>
      <Card>
        <table className="w-full text-[13px]">
          <thead className="text-left text-[10px] uppercase tracking-[0.1em] text-ink-4">
            <tr className="border-b border-border">
              <th className="pb-2">Order</th>
              <th className="pb-2">Service</th>
              <th className="pb-2">Stage</th>
              <th className="pb-2">Due</th>
              <th className="pb-2">Fee</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0">
                <td className="py-3 font-mono text-[11px] text-ink-4">{r.id}</td>
                <td className="font-medium text-ink">{r.svc}</td>
                <td><Pill tone={r.tone}>{r.stage}</Pill></td>
                <td className="text-ink-3">{r.due}</td>
                <td className="text-ink-2">{r.fee}</td>
                <td className="text-right"><Btn variant="o">Open</Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </PortalShell>
  );
}
