import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Database, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { PortalShell } from "@/components/PortalShell";
import { Card, PageHeader, Pill, Btn } from "@/components/ui-kit";
import { FounderKpiCard } from "@/components/founder/FounderKpiCard";
import { founderStat } from "@/components/founder/founder-stat-styles";
import { inr } from "@/lib/format";
import { getSnapshot, formatPctRate, formatRatio, formatTrendMom } from "@/lib/founder-analytics/compute";
import {
  buildBurnRunwayMetrics,
  buildCustomerMetrics,
  buildRevenueGrowthMetrics,
  buildTeamOpsMetrics,
  type KpiMetric,
} from "@/lib/founder-analytics/kpi-metrics";
import { loadFounderAnalytics } from "@/lib/founder-analytics/storage";

export const Route = createFileRoute("/founder/kpis")({
  head: () => ({ meta: [{ title: "Growth KPIs — ComplyOS" }] }),
  component: KpiDashboard,
});

function trendIcon(t?: KpiMetric["trend"]) {
  if (t === "up") return <TrendingUp className="h-3 w-3 text-success" />;
  if (t === "down") return <TrendingDown className="h-3 w-3 text-destructive" />;
  return <Minus className="h-3 w-3 text-ink-4" />;
}

function MetricRow({ m }: { m: KpiMetric }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0">
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium text-ink">{m.name}</div>
        {(m.hint || m.benchmark) && (
          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-ink-4">
            {m.hint && <span>{m.hint}</span>}
            {m.benchmark && <Pill tone="n">{m.benchmark}</Pill>}
          </div>
        )}
      </div>
      <div className="text-right">
        <div className={founderStat.valueSm}>{m.value}</div>
        {m.change && (
          <div className="mt-0.5 flex items-center justify-end gap-1 text-[11px] font-medium text-ink-3">
            {trendIcon(m.trend)}
            <span>{m.change}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, metrics }: { title: string; metrics: KpiMetric[] }) {
  return (
    <Card title={title}>
      <div className="-mt-1">
        {metrics.map((m) => (
          <MetricRow key={m.name} m={m} />
        ))}
      </div>
    </Card>
  );
}

function KpiDashboard() {
  const [analytics, setAnalytics] = useState(loadFounderAnalytics);

  useEffect(() => {
    const refresh = () => setAnalytics(loadFounderAnalytics());
    window.addEventListener("founder-analytics-update", refresh);
    return () => window.removeEventListener("founder-analytics-update", refresh);
  }, []);

  const snap = useMemo(() => getSnapshot(analytics), [analytics]);
  const m = snap.month;
  const prev = snap.prevMonth;

  const revenue = useMemo(() => buildRevenueGrowthMetrics(m, prev), [m, prev]);
  const customers = useMemo(() => buildCustomerMetrics(m, prev), [m, prev]);
  const burn = useMemo(() => buildBurnRunwayMetrics(m, prev), [m, prev]);
  const team = useMemo(() => buildTeamOpsMetrics(m, prev), [m, prev]);

  return (
    <PortalShell portalId="founder">
      <PageHeader
        title="Growth KPI Dashboard"
        subtitle={`Live summary from Data Center · Reporting ${analytics.reportingMonth}. Edit values in Data Center — dashboard updates on save.`}
        actions={
          <Link to="/founder/data-center">
            <Btn variant="o">
              <Database className="h-3.5 w-3.5" /> Data Center
            </Btn>
          </Link>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <FounderKpiCard
          value={inr(m.arr, { compact: true })}
          label="ARR"
          change={formatTrendMom(m.mrrGrowthMom)}
          tone="up"
        />
        <FounderKpiCard
          value={m.ltvCacRatio ? `${m.ltvCacRatio.toFixed(1)} : 1` : "—"}
          label="LTV : CAC"
          change={m.ltvCacRatio != null && m.ltvCacRatio >= 3 ? "Healthy ≥ 3 : 1" : "Below target"}
          tone={m.ltvCacRatio != null && m.ltvCacRatio >= 3 ? "up" : "dn"}
        />
        <FounderKpiCard
          value={formatPctRate(m.logoChurnRate)}
          label="Logo churn"
          change={prev?.logoChurnRate != null ? `vs ${formatPctRate(prev.logoChurnRate)} prior` : undefined}
          tone="up"
        />
        <FounderKpiCard
          value={`${m.runwayMonths.toFixed(1)} mo`}
          label="Runway"
          change={prev ? `${(m.runwayMonths - prev.runwayMonths).toFixed(1)} mo vs prior` : undefined}
          tone={m.runwayMonths >= 18 ? "up" : "dn"}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2 text-[12px] text-ink-4">
        <Pill tone="infra">Synced with Founder Dashboard</Pill>
        <span>
          Last updated{" "}
          {new Date(analytics.updatedAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
        <span>·</span>
        <span className="font-bold tabular-nums text-slate-800">MRR {inr(m.mrr, { compact: true })}</span>
        <span>·</span>
        <span className="font-bold tabular-nums text-slate-800">Cash {inr(m.cashBalance, { compact: true })}</span>
        <span>·</span>
        <span className="font-bold tabular-nums text-slate-800">Burn multiple {formatRatio(m.burnMultiple)}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Revenue & Growth" metrics={revenue} />
        <Section title="Customers" metrics={customers} />
        <Section title="Burn & Runway" metrics={burn} />
        <Section title="Team & Operations" metrics={team} />
      </div>
    </PortalShell>
  );
}
