import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/PortalShell";
import { Card, PageHeader, Pill, Btn, Kpi } from "@/components/ui-kit";
import { Download, CreditCard } from "lucide-react";

export const Route = createFileRoute("/founder/billing")({
  head: () => ({ meta: [{ title: "Billing & Invoices — ComplyOS" }] }),
  component: Billing,
});

const INVOICES = [
  { id: "INV-2026-0481", date: "02 May 2026", svc: "GSTR-3B Filing (Apr)", amt: "₹ 1,499", status: "paid" },
  { id: "INV-2026-0455", date: "20 Apr 2026", svc: "Trademark — Class 9", amt: "₹ 6,999", status: "paid" },
  { id: "INV-2026-0440", date: "12 Apr 2026", svc: "Annual ROC Filing", amt: "₹ 7,999", status: "due" },
  { id: "INV-2026-0421", date: "01 Apr 2026", svc: "DIR-3 KYC", amt: "₹ 1,998", status: "paid" },
];

function Billing() {
  return (
    <PortalShell portalId="founder">
      <PageHeader
        title="Billing & Invoices"
        subtitle="GST-compliant invoices · auto-reconciled to your books."
        actions={<Btn variant="o"><CreditCard className="h-4 w-4" /> Manage payment method</Btn>}
      />
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi value="₹ 7,999" label="Outstanding" tone="dn" change="due in 5 days" />
        <Kpi value="₹ 1.42L" label="Spent YTD" />
        <Kpi value="HDFC ••4218" label="Default card" />
        <Kpi value="Pro" label="Plan" change="renews 14 Mar 2027" />
      </div>
      <Card title="All invoices">
        <div className="divide-y divide-border">
          {INVOICES.map((i) => (
            <div key={i.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <div className="font-mono text-[11px] text-ink-4">{i.id}</div>
                <div className="text-[13px] font-medium text-ink">{i.svc}</div>
                <div className="text-[11px] text-ink-4">{i.date}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-[14px] font-semibold text-ink">{i.amt}</div>
                <Pill tone={i.status === "paid" ? "done" : "miss"}>{i.status === "paid" ? "Paid" : "Due"}</Pill>
                <Btn variant="g"><Download className="h-3.5 w-3.5" /></Btn>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </PortalShell>
  );
}
