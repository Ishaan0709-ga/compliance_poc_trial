import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Banknote,
  Building2,
  CalendarClock,
  Database,
  Flame,
  LineChart as LineChartIcon,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  Users,
  Wallet,
} from "lucide-react";
import { PortalShell } from "@/components/PortalShell";
import { UploadButton } from "@/components/UploadDrawer";
import { FounderMetricCard } from "@/components/founder/FounderMetricCard";
import { FounderRevenueChart } from "@/components/founder/FounderRevenueChart";
import { founderStat } from "@/components/founder/founder-stat-styles";
import { Card, Pill, Btn, Banner } from "@/components/ui-kit";
import { getCompanyProfile } from "@/lib/profile.functions";
import { inr } from "@/lib/format";
import {
  formatPctRate,
  formatRatio,
  formatTrendMom,
  funnelPct,
  getSnapshot,
  runwayHealth,
} from "@/lib/founder-analytics/compute";
import { loadFounderAnalytics } from "@/lib/founder-analytics/storage";
import type { PeriodFilter } from "@/lib/founder-analytics/types";

export const Route = createFileRoute("/founder/")({
  head: () => ({ meta: [{ title: "Founder Dashboard — ComplyOS" }] }),
  component: FounderHome,
});

function PeriodToggle({
  value,
  onChange,
}: {
  value: PeriodFilter;
  onChange: (v: PeriodFilter) => void;
}) {
  const opts: PeriodFilter[] = ["MTD", "QTD", "YTD"];
  return (
    <div className="inline-flex rounded-lg border border-border bg-surface-2 p-0.5">
      {opts.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`rounded-md px-3 py-1.5 text-[11px] font-bold tracking-wide transition-colors ${
            value === o
              ? "bg-background text-primary shadow-sm"
              : "text-ink-4 hover:text-ink-2"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function MetricRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/70 py-2.5 last:border-b-0">
      <div className="flex items-center gap-2.5 text-[13px] text-ink-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-surface-2 text-ink-4">
          {icon}
        </span>
        {label}
      </div>
      <span className={founderStat.valueXs}>{value}</span>
    </div>
  );
}

function FunnelBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = funnelPct(value, max);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[12px]">
        <span className="font-medium text-ink-3">{label}</span>
        <span className={`${founderStat.valueXs} text-slate-900`}>{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function FounderHome() {
  const profFn = useServerFn(getCompanyProfile);
  const profile = useQuery({ queryKey: ["company-profile"], queryFn: () => profFn() });
  const [analytics, setAnalytics] = useState(loadFounderAnalytics);
  const [period, setPeriod] = useState<PeriodFilter>("YTD");

  useEffect(() => {
    const refresh = () => setAnalytics(loadFounderAnalytics());
    window.addEventListener("founder-analytics-update", refresh);
    return () => window.removeEventListener("founder-analytics-update", refresh);
  }, []);

  const snap = useMemo(() => getSnapshot(analytics, period), [analytics, period]);
  const m = snap.month;
  const hasProfile = !!profile.data?.profile;
  const companyName = profile.data?.profile?.legal_name || "GRAE AI";
  const industry = "SaaS Company";

  const chartData = snap.chartMonths.map((row) => ({
    month: row.month.replace("-26", ""),
    mrr: row.mrr,
    arr: row.arr,
    revenue: row.revenue,
  }));

  const runway = runwayHealth(m.runwayMonths);
  const runwayTarget = 20;
  const runwayPct = Math.min(100, Math.round((m.runwayMonths / runwayTarget) * 100));

  const complianceTone = (status: string) =>
    status === "healthy" ? "done" : status === "overdue" ? "miss" : "pend";

  return (
    <PortalShell portalId="founder">
      {/* Premium header */}
      <div className="mb-5 flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
            Business Growth Dashboard
          </div>
          <h1 className="mt-1 text-[28px] font-extrabold tracking-[-0.03em] text-ink">
            {companyName}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-ink-3">
            <Pill tone="infra">{industry}</Pill>
            <span>
              Last updated{" "}
              {new Date(analytics.updatedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <span className="text-ink-4">·</span>
            <span>Reporting {analytics.reportingMonth}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PeriodToggle value={period} onChange={setPeriod} />
          <UploadButton />
          <Link to="/founder/data-center">
            <Btn variant="o" className="!border-primary/30 !bg-primary-muted/40 !text-primary">
              <Database className="h-3.5 w-3.5" /> Data Center
            </Btn>
          </Link>
        </div>
      </div>

      {!hasProfile && !profile.isLoading && (
        <Banner
          tone="info"
          icon={<Building2 className="h-4 w-4" />}
          text="Complete your company profile to sync compliance calendar and books."
          cta="Open profile"
        />
      )}

      {/* Hero KPIs */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <FounderMetricCard
          icon={<TrendingUp className="h-4 w-4" />}
          title="MRR"
          value={inr(m.mrr, { compact: true })}
          trend={formatTrendMom(m.mrrGrowthMom)}
          hint={`ARPU ${inr(m.arpu)}`}
          tone="up"
        />
        <FounderMetricCard
          icon={<LineChartIcon className="h-4 w-4" />}
          title="ARR"
          value={inr(m.arr, { compact: true })}
          hint="Annualized recurring"
          tone="neutral"
        />
        <FounderMetricCard
          icon={<CalendarClock className="h-4 w-4" />}
          title="Cash Runway"
          value={`${m.runwayMonths.toFixed(1)} mo`}
          trend={runway.label}
          tone={m.runwayMonths >= 18 ? "up" : m.runwayMonths >= 12 ? "neutral" : "down"}
        />
        <FounderMetricCard
          icon={<Users className="h-4 w-4" />}
          title="Customers"
          value={String(m.activeCustomers)}
          trend={`+${m.newCustomers} new`}
          hint={`Churn ${formatPctRate(m.logoChurnRate)}`}
          tone="up"
        />
        <FounderMetricCard
          icon={<Wallet className="h-4 w-4" />}
          title="Cash in Bank"
          value={inr(m.cashBalance, { compact: true })}
          hint="End of month balance"
          tone="neutral"
        />
        <FounderMetricCard
          icon={<Flame className="h-4 w-4" />}
          title="Burn Rate"
          value={inr(m.netBurn, { compact: true })}
          trend={`Burn multiple ${formatRatio(m.burnMultiple)}`}
          hint="Monthly net burn"
          tone="down"
        />
      </div>

      {/* Main analytics row */}
      <div className="mb-4 grid gap-4 lg:grid-cols-[1.65fr_1fr]">
        <Card
          title="Revenue & Growth"
          action={
            <Pill tone="infra">
              <Sparkles className="h-3 w-3" /> {period}
            </Pill>
          }
          className="!p-4"
        >
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
              MRR Trend
            </span>
            <span className="text-[13px] font-bold tracking-[-0.02em] text-emerald-600 tabular-nums">
              {inr(m.mrr, { compact: true })}
            </span>
          </div>
          <FounderRevenueChart data={chartData} />
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3 md:grid-cols-4">
            {[
              ["Net new MRR", inr(m.netNewMrr, { compact: true })],
              ["MRR quick ratio", formatRatio(m.mrrQuickRatio)],
              ["Lead-to-close", formatPctRate(m.closedWon / Math.max(m.leads, 1))],
              ["Deals closed-won", String(m.closedWon)],
            ].map(([label, val]) => (
              <div key={label} className="rounded-lg bg-surface-2/60 px-3 py-2">
                <div className="text-[10px] font-bold uppercase tracking-wide text-ink-4">{label}</div>
                <div className={`mt-0.5 ${founderStat.valueXs}`}>{val}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Customer Health" className="!p-4">
          <MetricRow icon={<Target className="h-3.5 w-3.5" />} label="CAC" value={inr(m.cac)} />
          <MetricRow icon={<Banknote className="h-3.5 w-3.5" />} label="LTV" value={m.ltv ? inr(m.ltv) : "—"} />
          <MetricRow
            icon={<TrendingUp className="h-3.5 w-3.5" />}
            label="LTV : CAC"
            value={formatRatio(m.ltvCacRatio)}
          />
          <MetricRow
            icon={<Users className="h-3.5 w-3.5" />}
            label="Logo churn"
            value={formatPctRate(m.logoChurnRate)}
          />
          <MetricRow icon={<Sparkles className="h-3.5 w-3.5" />} label="NPS" value={String(m.nps)} />
          <MetricRow
            icon={<ArrowUpRight className="h-3.5 w-3.5" />}
            label="Net revenue retention"
            value={m.nrr != null ? `${(m.nrr * 100).toFixed(1)}%` : "—"}
          />
        </Card>
      </div>

      {/* Second analytics row */}
      <div className="mb-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card title="Burn & Runway" className="!p-4">
          <div className="space-y-3">
            <div className="flex justify-between text-[13px]">
              <span className="text-ink-3">Monthly burn</span>
              <span className={founderStat.valueXs}>{inr(m.netBurn, { compact: true })}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-ink-3">Burn multiple</span>
              <span className={founderStat.valueXs}>{formatRatio(m.burnMultiple)}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-ink-3">Runway remaining</span>
              <span className={founderStat.valueXs}>{m.runwayMonths.toFixed(1)} months</span>
            </div>
            <div className="pt-1">
              <div className="mb-1 flex justify-between text-[11px] text-ink-4">
                <span>
                  {Math.round(m.runwayMonths)} of {runwayTarget} months target
                </span>
                <span className="font-medium text-ink-3">{runway.label}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
                <div
                  className={`h-full rounded-full ${
                    runway.tone === "healthy"
                      ? "bg-emerald-500"
                      : runway.tone === "watch"
                        ? "bg-amber-500"
                        : "bg-rose-500"
                  }`}
                  style={{ width: `${runwayPct}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card title="Team & Operations" className="!p-4">
          <MetricRow icon={<Users className="h-3.5 w-3.5" />} label="Headcount" value={String(m.headcount)} />
          <MetricRow
            icon={<TrendingUp className="h-3.5 w-3.5" />}
            label="Revenue per employee"
            value={inr(m.revenuePerEmployee, { compact: true })}
          />
          <MetricRow icon={<Target className="h-3.5 w-3.5" />} label="Open roles" value={String(m.openRoles)} />
          <MetricRow
            icon={<Users className="h-3.5 w-3.5" />}
            label="Attrition"
            value={formatPctRate(m.attritionRate)}
          />
        </Card>

        <Card title="Sales Funnel" className="!p-4 md:col-span-2 xl:col-span-1">
          <div className="space-y-3">
            <FunnelBar label="Leads" value={m.leads} max={m.leads} />
            <FunnelBar label="Qualified" value={m.qualified} max={m.leads} />
            <FunnelBar label="Demo done" value={m.demos} max={m.leads} />
            <FunnelBar label="Closed won" value={m.closedWon} max={m.leads} />
          </div>
        </Card>
      </div>

      {/* Compliance + Insights */}
      <div className="mb-4 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card title="Compliance visibility" className="!p-4">
          <div className="divide-y divide-border">
            {analytics.compliance.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 py-2.5">
                <div>
                  <div className="text-[13px] font-semibold text-ink">{c.name}</div>
                  <div className="text-[11px] text-ink-4">
                    Due {new Date(c.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </div>
                </div>
                <div className="text-right">
                  <Pill tone={complianceTone(c.status)}>
                    {c.status === "healthy" ? "On track" : c.status === "overdue" ? "Overdue" : "Upcoming"}
                  </Pill>
                  <div className={`mt-1 text-[11px] font-medium text-slate-500 tabular-nums`}>{c.daysRemaining}d left</div>
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/founder/calendar"
            className="mt-3 inline-flex text-[12px] font-bold text-primary hover:underline"
          >
            Open compliance calendar →
          </Link>
        </Card>

        <Card title="Founder Insights" className="!p-4">
          <ul className="space-y-2.5 text-[13px] text-ink-2">
            <li className="flex gap-2">
              <span className="text-emerald-600">●</span>
              Revenue increased {formatTrendMom(m.mrrGrowthMom)} on subscription base.
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-600">●</span>
              Customer acquisition improving — LTV:CAC at {formatRatio(m.ltvCacRatio)}.
            </li>
            <li className="flex gap-2">
              <span className="text-primary">●</span>
              Runway remains {runway.label.toLowerCase()} at {m.runwayMonths.toFixed(1)} months.
            </li>
            <li className="flex gap-2">
              <span className="text-amber-600">●</span>
              Logo churn stable at {formatPctRate(m.logoChurnRate)} — monitor enterprise cohorts.
            </li>
          </ul>
          <Link to="/founder/data-center" className="mt-4 inline-flex">
            <Btn variant="o" className="!text-[12px]">
              <Upload className="h-3.5 w-3.5" /> Edit metrics in Data Center
            </Btn>
          </Link>
        </Card>
      </div>
    </PortalShell>
  );
}
