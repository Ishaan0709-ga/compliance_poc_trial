import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/PortalShell";
import { Card, PageHeader, Pill, Btn, Kpi } from "@/components/ui-kit";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({ meta: [{ title: "All Orders — ComplyOS" }] }),
  component: AdminOrders,
});

const ROWS = [
  { id: "FMB-2419", customer: "Lumen Labs", svc: "GSTR-3B (Apr)", partner: "CA Neha Iyer", stage: "Awaiting docs", tone: "pend" as const, due: "May 18" },
  { id: "FMB-2410", customer: "Hiveloop", svc: "ITR-6 FY25-26", partner: "CA Vikram Joshi", stage: "Review", tone: "pend" as const, due: "May 22" },
  { id: "FMB-2402", customer: "Lumen Labs", svc: "AOC-4 + MGT-7", partner: "CS Rohit Bansal", stage: "Drafting", tone: "pend" as const, due: "May 28" },
  { id: "FMB-2391", customer: "Saffron Studios", svc: "DIR-3 KYC", partner: "CS Rohit Bansal", stage: "Filed", tone: "done" as const, due: "Apr 30" },
  { id: "FMB-2380", customer: "Indus Bakeries", svc: "Shop & Estab.", partner: "Adv. Meera S.", stage: "Filed", tone: "done" as const, due: "Apr 28" },
];

function AdminOrders() {
  return (
    <PortalShell portalId="admin">
      <PageHeader title="All Orders" subtitle="Filter, search and manage every order in the pipeline." />
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi value="284" label="Active" />
        <Kpi value="42" label="Awaiting customer" tone="dn" />
        <Kpi value="161" label="In progress" />
        <Kpi value="81" label="Filed this month" tone="up" />
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {["All", "Active", "Awaiting customer", "Review", "Filed", "Cancelled"].map((c, i) => (
          <button key={c} className={`rounded-full px-3 py-1 text-[12px] ${
            i === 0 ? "bg-primary text-primary-foreground" : "border border-border bg-surface text-ink-3 hover:bg-surface-2"
          }`}>{c}</button>
        ))}
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="text-left text-[10px] uppercase tracking-[0.1em] text-ink-4">
              <tr className="border-b border-border">
                <th className="pb-2">Order</th>
                <th className="pb-2">Customer</th>
                <th className="pb-2">Service</th>
                <th className="pb-2">Partner</th>
                <th className="pb-2">Stage</th>
                <th className="pb-2">Due</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="py-3 font-mono text-[11px] text-ink-4">{r.id}</td>
                  <td className="text-ink-2">{r.customer}</td>
                  <td className="font-medium text-ink">{r.svc}</td>
                  <td className="text-ink-3">{r.partner}</td>
                  <td><Pill tone={r.tone}>{r.stage}</Pill></td>
                  <td className="text-ink-3">{r.due}</td>
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
