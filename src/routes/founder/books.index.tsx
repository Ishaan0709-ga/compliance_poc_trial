import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PortalShell } from "@/components/PortalShell";
import { Card, Kpi, PageHeader, Pill } from "@/components/ui-kit";
import { EmptyState } from "@/components/EmptyState";
import { UploadButton } from "@/components/UploadDrawer";
import { ArrowUpRight, ArrowDownRight, Plug, Sparkles } from "lucide-react";
import { getKpis, listTransactions } from "@/lib/books.functions";
import { inr, pct, dateShort } from "@/lib/format";

export const Route = createFileRoute("/founder/books/")({
  head: () => ({ meta: [{ title: "Books — ComplyOS" }] }),
  component: Books,
});

function Books() {
  const kpiFn = useServerFn(getKpis);
  const txnFn = useServerFn(listTransactions);
  const kpis = useQuery({ queryKey: ["kpis"], queryFn: () => kpiFn() });
  const txns = useQuery({ queryKey: ["transactions", 50], queryFn: () => txnFn({ data: { limit: 50 } }) });

  const k = kpis.data;
  const rows = txns.data?.transactions || [];

  return (
    <PortalShell portalId="founder">
      <PageHeader
        title="Books"
        subtitle="Real-time accounting · auto-categorised by AI · GST + IndAS compliant"
        actions={
          <>
            <UploadButton kind="bank_statement" label="Upload statement" />
            <Link to="/founder/books/connectors"><span className="inline-flex"><span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2 text-[13px] font-medium text-ink-2 hover:bg-surface-2"><Plug className="h-4 w-4" /> Connect Zoho / Gmail</span></span></Link>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi value={inr(k?.revenue ?? 0, { compact: true })} label="Revenue · this month"
             tone={(k?.revChangePct ?? 0) >= 0 ? "up" : "dn"}
             change={k?.revChangePct != null ? `${pct(k.revChangePct)} MoM` : undefined} />
        <Kpi value={inr(k?.expenses ?? 0, { compact: true })} label="Expenses · this month"
             tone={(k?.expChangePct ?? 0) <= 0 ? "up" : "dn"}
             change={k?.expChangePct != null ? `${pct(k.expChangePct)} MoM` : undefined} />
        <Kpi value={inr(k?.net ?? 0, { compact: true })} label="Net profit"
             tone={(k?.net ?? 0) >= 0 ? "up" : "dn"} />
        <Kpi value={inr(k?.cash ?? 0, { compact: true })} label="Cash on hand"
             change={k?.runwayMonths != null ? `runway ${k.runwayMonths.toFixed(1)} mo` : "—"} />
      </div>

      <Card title="Recent transactions" action={<Pill tone="infra"><Sparkles className="h-3 w-3" /> live</Pill>}>
        {txns.isLoading ? (
          <div className="py-6 text-center text-[12px] text-ink-4">Loading…</div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="h-5 w-5" />}
            title="Your books are empty"
            description="Bring in real data: upload a bank statement, connect Zoho Books, or pull invoices from Gmail."
            primary={{ label: "Upload statement", href: "/founder/books/banking" }}
            secondary={{ label: "Connect data sources", href: "/founder/books/connectors" }}
          />
        ) : (
          <div className="divide-y divide-border">
            {rows.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-md ${
                    t.direction === "in" ? "bg-success-muted text-success" : "bg-destructive-muted/70 text-destructive"
                  }`}>
                    {t.direction === "in" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-ink">{t.description}</div>
                    <div className="text-[11px] text-ink-4">{t.category || "uncategorised"} · {t.source}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Pill tone="n">{dateShort(t.txn_date)}</Pill>
                  <span className={`font-mono text-[13px] font-semibold ${t.direction === "in" ? "text-success" : "text-destructive"}`}>
                    {t.direction === "in" ? "+" : "−"} {inr(Math.abs(Number(t.amount)))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </PortalShell>
  );
}
