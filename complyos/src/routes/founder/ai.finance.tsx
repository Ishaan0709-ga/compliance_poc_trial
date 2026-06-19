import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/PortalShell";
import { Card, Kpi, PageHeader, Btn } from "@/components/ui-kit";
import { TrendingUp } from "lucide-react";

export const Route = createFileRoute("/founder/ai/finance")({
  head: () => ({ meta: [{ title: "AI Financial Advisor — ComplyOS" }] }),
  component: AIFinance,
});

const INSIGHTS = [
  { t: "Burn dropped 12% MoM", body: "Mostly cloud savings (₹1.4L). Runway extended to 11.4 months.", tone: "up" },
  { t: "AR ageing concern", body: "₹6.8L outstanding > 60 days, mostly from 3 enterprise customers. Auto-reminders sent.", tone: "warn" },
  { t: "Cap on auto-debit reached", body: "AWS card hit ₹2L cap. Switch to RBL corporate card recommended.", tone: "neu" },
];

function AIFinance() {
  return (
    <PortalShell portalId="founder">
      <PageHeader title="Financial Advisor" subtitle="Real-time cash, runway, P&L — driven by your bank + bookkeeping." />
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi value="₹ 38.1L" label="Cash on hand" tone="up" change="↑ 4.2% MoM" />
        <Kpi value="11.4 mo" label="Runway" tone="up" change="extended by 1.2 mo" />
        <Kpi value="₹ 12.4L" label="MRR" tone="up" change="↑ 11.2%" />
        <Kpi value="₹ 3.32L" label="Burn / mo" tone="up" change="↓ 12% MoM" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {INSIGHTS.map((i) => (
          <Card key={i.t}>
            <div className="flex items-center gap-2 text-primary"><TrendingUp className="h-4 w-4" /></div>
            <div className="mt-2 text-[14px] font-semibold text-ink">{i.t}</div>
            <div className="mt-1 text-[12.5px] text-ink-3 leading-relaxed">{i.body}</div>
            <Btn variant="o" className="mt-3">Investigate</Btn>
          </Card>
        ))}
      </div>
      <Card title="Cashflow forecast (next 90 days)" className="mt-4">
        <div className="flex h-48 items-end gap-2">
          {[28, 30, 33, 36, 35, 38, 41, 39, 42, 44, 46, 48].map((h, i) => (
            <div key={i} className="flex-1 rounded-t bg-gradient-brand opacity-90" style={{ height: `${h * 2}px` }} />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-ink-4">
          {["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12"].map((w) => <span key={w}>{w}</span>)}
        </div>
      </Card>
    </PortalShell>
  );
}
