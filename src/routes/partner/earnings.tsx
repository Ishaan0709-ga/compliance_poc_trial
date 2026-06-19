import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/PortalShell";
import { Card, PageHeader, Kpi, Btn, Pill } from "@/components/ui-kit";
import { Wallet, Download } from "lucide-react";

export const Route = createFileRoute("/partner/earnings")({
  head: () => ({ meta: [{ title: "Earnings & Payouts — ComplyOS" }] }),
  component: Earnings,
});

const PAYOUTS = [
  { date: "12 Apr 2026", amt: "₹ 1,18,400", tds: "₹ 11,840", net: "₹ 1,06,560", state: "paid" },
  { date: "12 Mar 2026", amt: "₹ 96,200", tds: "₹ 9,620", net: "₹ 86,580", state: "paid" },
  { date: "12 Feb 2026", amt: "₹ 1,02,800", tds: "₹ 10,280", net: "₹ 92,520", state: "paid" },
  { date: "12 May 2026", amt: "₹ 84,500", tds: "₹ 8,450", net: "₹ 76,050", state: "scheduled" },
];

function Earnings() {
  return (
    <PortalShell portalId="partner">
      <PageHeader
        title="Earnings & payouts"
        subtitle="Settled to HDFC •• 8821 · TDS @ 10% u/s 194J auto-deducted."
        actions={<Btn variant="o"><Download className="h-4 w-4" /> Form 16A</Btn>}
      />
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi value="₹ 84,500" label="Pending payout" change="settles 12 May" />
        <Kpi value="₹ 1,42,000" label="This month" tone="up" change="↑ 18% MoM" />
        <Kpi value="₹ 6,84,200" label="YTD earnings" tone="up" />
        <Kpi value="₹ 68,420" label="TDS deducted YTD" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Next payout" className="lg:col-span-1">
          <div className="rounded-xl bg-gradient-brand p-4 text-white">
            <div className="text-[11px] uppercase tracking-[0.12em] opacity-80">Pending</div>
            <div className="mt-1 text-[24px] font-semibold tracking-[-0.02em]">₹ 84,500</div>
            <div className="text-[11px] opacity-80">Settles 12 May 2026</div>
          </div>
          <div className="mt-3 space-y-2 text-[12.5px]">
            <Row k="Gross" v="₹ 84,500" />
            <Row k="TDS @ 10% (194J)" v="− ₹ 8,450" />
            <Row k="Net to bank" v="₹ 76,050" bold />
          </div>
          <Btn variant="o" className="mt-3 w-full justify-center"><Wallet className="h-3.5 w-3.5" /> Update bank</Btn>
        </Card>
        <Card title="Payout history" className="lg:col-span-2">
          <table className="w-full text-[13px]">
            <thead className="text-left text-[10px] uppercase tracking-[0.1em] text-ink-4">
              <tr className="border-b border-border">
                <th className="pb-2">Date</th>
                <th className="pb-2">Gross</th>
                <th className="pb-2">TDS</th>
                <th className="pb-2">Net</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {PAYOUTS.map((p) => (
                <tr key={p.date} className="border-b border-border last:border-0">
                  <td className="py-3 text-ink-2">{p.date}</td>
                  <td className="text-ink-2">{p.amt}</td>
                  <td className="text-ink-3">{p.tds}</td>
                  <td className="font-medium text-ink">{p.net}</td>
                  <td><Pill tone={p.state === "paid" ? "done" : "pend"}>{p.state}</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </PortalShell>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink-3">{k}</span>
      <span className={bold ? "font-semibold text-ink" : "text-ink-2"}>{v}</span>
    </div>
  );
}
