import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/PortalShell";
import { Card, PageHeader, Pill, Btn, Kpi } from "@/components/ui-kit";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({ meta: [{ title: "Customers — ComplyOS" }] }),
  component: Customers,
});

const ROWS = [
  { name: "Lumen Labs Pvt Ltd", segment: "Startup", plan: "Pro", arr: "₹ 84,000", health: 87, csm: "Ankit P.", tone: "done" as const },
  { name: "Hiveloop Tech", segment: "Startup", plan: "Pro", arr: "₹ 1,20,000", health: 72, csm: "Ankit P.", tone: "pend" as const },
  { name: "Kala & Sons", segment: "MSME", plan: "Starter", arr: "₹ 18,000", health: 55, csm: "Riya N.", tone: "miss" as const },
  { name: "Indus Bakeries", segment: "MSME", plan: "Starter", arr: "₹ 12,000", health: 91, csm: "Riya N.", tone: "done" as const },
  { name: "Northwind LLP", segment: "SME", plan: "Growth", arr: "₹ 2,40,000", health: 68, csm: "Aarav K.", tone: "pend" as const },
];

function Customers() {
  return (
    <PortalShell portalId="admin">
      <PageHeader title="Customers (CRM)" subtitle="1,284 customers · 64 CSMs · ₹ 2.18 Cr ARR" />
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi value="1,284" label="Customers" tone="up" change="+ 42 this month" />
        <Kpi value="₹ 2.18 Cr" label="ARR" tone="up" change="+ 22% YoY" />
        <Kpi value="3.1%" label="Logo churn (TTM)" tone="dn" />
        <Kpi value="87" label="NPS" tone="up" />
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="text-left text-[10px] uppercase tracking-[0.1em] text-ink-4">
              <tr className="border-b border-border">
                <th className="pb-2">Customer</th>
                <th className="pb-2">Segment</th>
                <th className="pb-2">Plan</th>
                <th className="pb-2">ARR</th>
                <th className="pb-2">Health</th>
                <th className="pb-2">CSM</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.name} className="border-b border-border last:border-0">
                  <td className="py-3 font-medium text-ink">{r.name}</td>
                  <td className="text-ink-3">{r.segment}</td>
                  <td className="text-ink-3">{r.plan}</td>
                  <td className="text-ink-2">{r.arr}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 rounded-full bg-surface-2">
                        <div className={`h-full rounded-full ${r.tone === "done" ? "bg-success" : r.tone === "pend" ? "bg-warning" : "bg-destructive"}`} style={{ width: `${r.health}%` }} />
                      </div>
                      <span className="font-mono text-[11px] text-ink-3">{r.health}</span>
                    </div>
                  </td>
                  <td className="text-ink-3">{r.csm}</td>
                  <td className="text-right"><Btn variant="o">Open</Btn></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PortalShell>
  );
}
