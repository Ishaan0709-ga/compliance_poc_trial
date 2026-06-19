import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/PortalShell";
import { Card, Pill, Btn, PageHeader, Kpi } from "@/components/ui-kit";
import { MessageSquare, FileText } from "lucide-react";

export const Route = createFileRoute("/founder/orders")({
  head: () => ({ meta: [{ title: "My Orders — ComplyOS" }] }),
  component: Orders,
});

const ORDERS = [
  { id: "FMB-2419", svc: "GSTR-3B Filing — Apr 2026", partner: "CA Neha Iyer", stage: "Awaiting docs", tone: "pend" as const, due: "May 18", price: "₹ 1,499", progress: 35 },
  { id: "FMB-2402", svc: "Annual ROC Filing (AOC-4)", partner: "CS Rohit Bansal", stage: "Drafting", tone: "pend" as const, due: "May 28", price: "₹ 7,999", progress: 60 },
  { id: "FMB-2410", svc: "Trademark — Class 9", partner: "Adv. Meera S.", stage: "Filed at IPO", tone: "infra" as const, due: "—", price: "₹ 6,999", progress: 80 },
  { id: "FMB-2388", svc: "TDS Return Q4 (24Q)", partner: "CA Neha Iyer", stage: "Filed", tone: "done" as const, due: "Apr 30", price: "₹ 999", progress: 100 },
  { id: "FMB-2350", svc: "DIR-3 KYC — 2 directors", partner: "CS Rohit Bansal", stage: "Filed", tone: "done" as const, due: "Apr 12", price: "₹ 1,998", progress: 100 },
];

function Orders() {
  return (
    <PortalShell portalId="founder">
      <PageHeader title="My Orders" subtitle="Track every active and historical order." />
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi value="3" label="In progress" />
        <Kpi value="2" label="Awaiting your input" tone="dn" change="action needed" />
        <Kpi value="14" label="Completed (YTD)" tone="up" />
        <Kpi value="₹ 1.42L" label="Spent (YTD)" />
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="text-left text-[10px] uppercase tracking-[0.1em] text-ink-4">
              <tr className="border-b border-border">
                <th className="pb-2">Order</th>
                <th className="pb-2">Service</th>
                <th className="pb-2">Stage</th>
                <th className="pb-2">Progress</th>
                <th className="pb-2">Due</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {ORDERS.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0">
                  <td className="py-3">
                    <div className="font-mono text-[11px] text-ink-4">{o.id}</div>
                    <div className="text-[11px] text-ink-4">{o.price}</div>
                  </td>
                  <td className="py-3">
                    <div className="font-medium text-ink">{o.svc}</div>
                    <div className="text-[11px] text-ink-4">{o.partner}</div>
                  </td>
                  <td><Pill tone={o.tone}>{o.stage}</Pill></td>
                  <td className="w-40">
                    <div className="h-1.5 w-32 rounded-full bg-surface-2">
                      <div
                        className={`h-full rounded-full ${
                          o.progress === 100 ? "bg-success" : "bg-primary"
                        }`}
                        style={{ width: `${o.progress}%` }}
                      />
                    </div>
                  </td>
                  <td className="text-[12px] text-ink-3">{o.due}</td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1">
                      <Btn variant="g"><MessageSquare className="h-3.5 w-3.5" /></Btn>
                      <Btn variant="o"><FileText className="h-3.5 w-3.5" /> Open</Btn>
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
