import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PortalShell } from "@/components/PortalShell";
import { Card, Kpi, PageHeader } from "@/components/ui-kit";
import { EmptyState } from "@/components/EmptyState";
import { BarChart3 } from "lucide-react";
import { getKpis, listTransactions } from "@/lib/books.functions";
import { inr, pct } from "@/lib/format";

export const Route = createFileRoute("/founder/books/reports")({
  head: () => ({ meta: [{ title: "Reports — ComplyOS" }] }),
  component: Reports,
});

function Reports() {
  const kpiFn = useServerFn(getKpis);
  const txnFn = useServerFn(listTransactions);
  const kpis = useQuery({ queryKey: ["kpis"], queryFn: () => kpiFn() });
  const txns = useQuery({ queryKey: ["transactions", 500], queryFn: () => txnFn({ data: { limit: 500 } }) });

  const k = kpis.data;
  const rows = txns.data?.transactions || [];

  // Build last-12-month bars from txns
  const now = new Date();
  const months: { label: string; rev: number; exp: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const sliceR = rows.filter((t: any) => {
      const td = new Date(t.txn_date);
      return td >= d && td < next;
    });
    months.push({
      label: d.toLocaleString("en-IN", { month: "short" }),
      rev: sliceR.filter((t: any) => t.direction === "in").reduce((s: number, t: any) => s + Number(t.amount || 0), 0),
      exp: Math.abs(sliceR.filter((t: any) => t.direction === "out").reduce((s: number, t: any) => s + Number(t.amount || 0), 0)),
    });
  }
  const maxBar = Math.max(1, ...months.flatMap((m) => [m.rev, m.exp]));

  return (
    <PortalShell portalId="founder">
      <PageHeader title="Reports" subtitle="P&L, cash flow and tax summaries — derived live from your transactions." />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi value={inr(k?.revenue ?? 0, { compact: true })} label="Revenue MTD"
             tone={(k?.revChangePct ?? 0) >= 0 ? "up" : "dn"}
             change={k?.revChangePct != null ? `${pct(k.revChangePct)} MoM` : undefined} />
        <Kpi value={inr(k?.expenses ?? 0, { compact: true })} label="Expenses MTD" />
        <Kpi value={inr(k?.net ?? 0, { compact: true })} label="Net" tone={(k?.net ?? 0) >= 0 ? "up" : "dn"} />
        <Kpi value={k?.runwayMonths != null ? `${k.runwayMonths.toFixed(1)} mo` : "—"} label="Runway" />
      </div>

      <Card title="Profit & loss · last 12 months">
        {rows.length === 0 ? (
          <EmptyState
            icon={<BarChart3 className="h-5 w-5" />}
            title="No data to chart yet"
            description="Add transactions, invoices or upload a bank statement to generate live P&L and cash-flow reports."
            primary={{ label: "Upload statement", href: "/founder/books/banking" }}
          />
        ) : (
          <>
            <div className="flex h-48 items-end gap-1.5">
              {months.map((m, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full items-end gap-0.5">
                    <div className="flex-1 rounded-t bg-primary/85" style={{ height: `${(m.rev / maxBar) * 180}px` }} />
                    <div className="flex-1 rounded-t bg-warning/70" style={{ height: `${(m.exp / maxBar) * 180}px` }} />
                  </div>
                  <div className="text-[9px] text-ink-4">{m.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-4 text-[11px] text-ink-3">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-primary" /> Revenue</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-warning/70" /> Expenses</span>
            </div>
          </>
        )}
      </Card>
    </PortalShell>
  );
}
