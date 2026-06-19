import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/PortalShell";
import { Card, PageHeader, Pill, Btn, Kpi } from "@/components/ui-kit";

export const Route = createFileRoute("/admin/intake")({
  head: () => ({ meta: [{ title: "Order Intake — ComplyOS" }] }),
  component: Intake,
});

const INTAKE = [
  { id: "FMB-2502", customer: "Lumen Labs Pvt Ltd", svc: "GSTR-9 Annual Return", priority: "high", waited: "12m", suggest: "CA Neha Iyer" },
  { id: "FMB-2501", customer: "Hiveloop Tech", svc: "Trademark Registration — Class 9", priority: "med", waited: "1h", suggest: "Adv. Meera S." },
  { id: "FMB-2500", customer: "Kala & Sons", svc: "Pvt Ltd Incorporation", priority: "high", waited: "2h", suggest: "CS Rohit Bansal" },
  { id: "FMB-2499", customer: "Saffron Studios", svc: "GST Registration", priority: "med", waited: "3h", suggest: "CA Neha Iyer" },
  { id: "FMB-2498", customer: "Indus Bakeries", svc: "FSSAI Renewal", priority: "low", waited: "5h", suggest: "Vendor — FoodLeg" },
  { id: "FMB-2497", customer: "Northwind LLP", svc: "ITR-5 + Audit", priority: "med", waited: "6h", suggest: "CA Vikram Joshi" },
];

function Intake() {
  return (
    <PortalShell portalId="admin">
      <PageHeader title="Order Intake Queue" subtitle="Auto-routed by AI · review & assign" />
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi value="12" label="In queue" tone="dn" change="2 over 4h" />
        <Kpi value="32m" label="Avg wait time" />
        <Kpi value="86%" label="AI match accepted" tone="up" />
        <Kpi value="₹ 0.92L" label="Queue value" />
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="text-left text-[10px] uppercase tracking-[0.1em] text-ink-4">
              <tr className="border-b border-border">
                <th className="pb-2">Priority</th>
                <th className="pb-2">Order</th>
                <th className="pb-2">Service</th>
                <th className="pb-2">Customer</th>
                <th className="pb-2">Waited</th>
                <th className="pb-2">AI suggests</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {INTAKE.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0">
                  <td className="py-3">
                    <Pill tone={o.priority === "high" ? "miss" : o.priority === "med" ? "pend" : "n"}>{o.priority}</Pill>
                  </td>
                  <td className="font-mono text-[11px] text-ink-4">{o.id}</td>
                  <td className="font-medium text-ink">{o.svc}</td>
                  <td className="text-ink-3">{o.customer}</td>
                  <td className="text-ink-4">{o.waited}</td>
                  <td className="text-[12px] text-ink-2">{o.suggest}</td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1">
                      <Btn variant="g">Reroute</Btn>
                      <Btn variant="o">Accept &amp; assign</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PortalShell>
  );
}
