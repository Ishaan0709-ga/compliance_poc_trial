import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/PortalShell";
import { Card, PageHeader, Pill, Btn } from "@/components/ui-kit";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/admin/catalogue")({
  head: () => ({ meta: [{ title: "Service Catalogue — ComplyOS" }] }),
  component: Catalogue,
});

const ITEMS = [
  { name: "GSTR-1 & GSTR-3B Filing", price: "₹ 1,499/mo", margin: "62%", tat: "5d", live: true },
  { name: "GST Annual Return (GSTR-9)", price: "₹ 4,999", margin: "58%", tat: "10d", live: true },
  { name: "Annual ROC Filing (AOC-4 + MGT-7)", price: "₹ 7,999", margin: "54%", tat: "12d", live: true },
  { name: "DIR-3 KYC", price: "₹ 999", margin: "70%", tat: "2d", live: true },
  { name: "Trademark Registration", price: "₹ 6,999", margin: "48%", tat: "Filed in 3d", live: true },
  { name: "Founders' Agreement Drafting", price: "₹ 9,999", margin: "65%", tat: "5d", live: true },
  { name: "ESOP Plan + Trust Setup", price: "₹ 49,999", margin: "55%", tat: "30d", live: false },
];

function Catalogue() {
  return (
    <PortalShell portalId="admin">
      <PageHeader
        title="Service Catalogue"
        subtitle="Manage SKUs, pricing, margins and TATs."
        actions={<Btn><Plus className="h-4 w-4" /> New service</Btn>}
      />
      <Card>
        <table className="w-full text-[13px]">
          <thead className="text-left text-[10px] uppercase tracking-[0.1em] text-ink-4">
            <tr className="border-b border-border">
              <th className="pb-2">Service</th>
              <th className="pb-2">Price</th>
              <th className="pb-2">Margin</th>
              <th className="pb-2">TAT</th>
              <th className="pb-2">Status</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {ITEMS.map((s) => (
              <tr key={s.name} className="border-b border-border last:border-0">
                <td className="py-3 font-medium text-ink">{s.name}</td>
                <td className="text-ink-2">{s.price}</td>
                <td className="font-mono text-[12px] text-ink-3">{s.margin}</td>
                <td className="text-ink-3">{s.tat}</td>
                <td><Pill tone={s.live ? "done" : "n"}>{s.live ? "Live" : "Draft"}</Pill></td>
                <td className="text-right"><Btn variant="o">Edit</Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </PortalShell>
  );
}
