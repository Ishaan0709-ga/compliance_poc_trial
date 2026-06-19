import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PortalShell } from "@/components/PortalShell";
import { Card, Kpi, PageHeader, Pill } from "@/components/ui-kit";
import { EmptyState } from "@/components/EmptyState";
import { UploadButton } from "@/components/UploadDrawer";
import { ArrowUpRight, ArrowDownRight, Sparkles, Building2 } from "lucide-react";
import { getKpis, listTransactions } from "@/lib/books.functions";
import { getCompanyProfile } from "@/lib/profile.functions";
import { inr, pct, dateShort } from "@/lib/format";

export const Route = createFileRoute("/founder/")({
  head: () => ({ meta: [{ title: "Founder Dashboard — ComplyOS" }] }),
  component: FounderHome,
});

function FounderHome() {
  const kpiFn = useServerFn(getKpis);
  const txnFn = useServerFn(listTransactions);
  const profFn = useServerFn(getCompanyProfile);

  const kpis = useQuery({ queryKey: ["kpis"], queryFn: () => kpiFn() });
  const txns = useQuery({ queryKey: ["transactions", 8], queryFn: () => txnFn({ data: { limit: 8 } }) });
  const profile = useQuery({ queryKey: ["company-profile"], queryFn: () => profFn() });

  const k = kpis.data;
  const recent = txns.data?.transactions || [];
  const hasProfile = !!profile.data?.profile;

  return (
    <PortalShell portalId="founder">
      <PageHeader
        title="Founder dashboard"
        subtitle="Real-time books, KPIs, and compliance — derived from your live data."
        actions={<UploadButton />}
      />

      {!hasProfile && !profile.isLoading && (
        <div className="mb-4">
          <EmptyState
            icon={<Building2 className="h-5 w-5" />}
            title="Set up your company profile"
            description="Entity type, GSTIN, headcount and registrations drive your compliance calendar, tax filings and reports."
            primary={{ label: "Open profile", href: "/founder/profile" }}
          />
        </div>
      )}

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi
          value={inr(k?.revenue ?? 0, { compact: true })}
          label="Revenue · this month"
          tone={k?.revChangePct != null && k.revChangePct >= 0 ? "up" : "dn"}
          change={k?.revChangePct != null ? `${pct(k.revChangePct)} MoM` : undefined}
        />
        <Kpi
          value={inr(k?.expenses ?? 0, { compact: true })}
          label="Expenses · this month"
          tone={k?.expChangePct != null && k.expChangePct <= 0 ? "up" : "dn"}
          change={k?.expChangePct != null ? `${pct(k.expChangePct)} MoM` : undefined}
        />
        <Kpi
          value={inr(k?.net ?? 0, { compact: true })}
          label="Net"
          tone={(k?.net ?? 0) >= 0 ? "up" : "dn"}
        />
        <Kpi
          value={inr(k?.cash ?? 0, { compact: true })}
          label="Cash on hand"
          change={k?.runwayMonths != null ? `runway ${k.runwayMonths.toFixed(1)} mo` : "add bank account"}
        />
      </div>

      <Card title="Recent transactions" action={<Pill tone="infra"><Sparkles className="h-3 w-3" /> live</Pill>}>
        {recent.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="h-5 w-5" />}
            title="No transactions yet"
            description="Upload a bank statement, invoice or receipt — AI parses it into your books. Or add entries manually."
            primary={{ label: "Upload bank statement", href: "/founder/books/banking" }}
            secondary={{ label: "Connect Zoho Books", href: "/founder/books/connectors" }}
          />
        ) : (
          <div className="divide-y divide-border">
            {recent.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-md ${
                    t.direction === "in" ? "bg-success-muted text-success" : "bg-destructive-muted/70 text-destructive"
                  }`}>
                    {t.direction === "in" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-ink">{t.description}</div>
                    <div className="text-[11px] text-ink-4">{t.category || "uncategorised"} · {dateShort(t.txn_date)}</div>
                  </div>
                </div>
                <span className={`font-mono text-[13px] font-semibold ${t.direction === "in" ? "text-success" : "text-destructive"}`}>
                  {t.direction === "in" ? "+" : "−"} {inr(Math.abs(Number(t.amount)))}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </PortalShell>
  );
}
