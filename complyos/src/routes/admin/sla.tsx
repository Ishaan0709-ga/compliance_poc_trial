import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/PortalShell";
import { Card, PageHeader, Pill, Btn, Kpi } from "@/components/ui-kit";

export const Route = createFileRoute("/admin/sla")({
  head: () => ({ meta: [{ title: "SLA Monitor — ComplyOS" }] }),
  component: SLA,
});

const ROWS = [
  { id: "FMB-2419", svc: "GSTR-3B — Lumen Labs", partner: "CA Neha Iyer", risk: "red", left: "2d", root: "Customer hasn't shared bank statement" },
  { id: "FMB-2391", svc: "DIR-3 KYC — 4 directors", partner: "CS Rohit Bansal", risk: "amber", left: "5d", root: "DSC pending for 1 director" },
  { id: "FMB-2380", svc: "Shop & Estab — Indore", partner: "Adv. Meera S.", risk: "amber", left: "6d", root: "Awaiting MP labour dept response" },
  { id: "FMB-2342", svc: "ITR-6 — Northwind LLP", partner: "CA Vikram Joshi", risk: "red", left: "1d", root: "Tax audit u/s 44AB not started" },
];

function SLA() {
  return (
    <PortalShell portalId="admin">
      <PageHeader title="SLA Monitor" subtitle="Live breach risks · auto-escalation rules" />
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi value="92%" label="On-time SLA · 30d" tone="dn" change="target 95%" />
        <Kpi value="4" label="At breach risk" tone="dn" />
        <Kpi value="11" label="Amber" />
        <Kpi value="2.3d" label="Avg slack" />
      </div>
      <Card title="Orders at risk">
        <div className="divide-y divide-border">
          {ROWS.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 py-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-ink-4">{r.id}</span>
                  <Pill tone={r.risk === "red" ? "miss" : "pend"}>{r.risk === "red" ? "BREACH RISK" : "AMBER"}</Pill>
                  <span className="text-[11px] text-ink-4">{r.left} left</span>
                </div>
                <div className="mt-1 text-[13px] font-medium text-ink">{r.svc}</div>
                <div className="text-[11px] text-ink-4">{r.partner} · root cause: {r.root}</div>
              </div>
              <div className="flex gap-1">
                <Btn variant="g">Nudge customer</Btn>
                <Btn variant="o">Escalate</Btn>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </PortalShell>
  );
}
