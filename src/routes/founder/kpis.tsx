import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/PortalShell";
import { Card, Kpi, PageHeader, Pill } from "@/components/ui-kit";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export const Route = createFileRoute("/founder/kpis")({
  head: () => ({ meta: [{ title: "Growth KPIs — ComplyOS" }] }),
  component: KpiDashboard,
});

type Trend = "up" | "down" | "flat";
interface Metric {
  name: string;
  value: string;
  change?: string;
  trend?: Trend;
  benchmark?: string;
  hint?: string;
}

// Curated from the "Measuring Success – Defining KPIs" document
const FINANCIAL: Metric[] = [
  { name: "Monthly Recurring Revenue (MRR)", value: "₹ 12.4L", change: "+11.2%", trend: "up", benchmark: "Target ₹ 15L", hint: "Predictable subscription revenue / month" },
  { name: "Annual Recurring Revenue (ARR)", value: "₹ 1.49 Cr", change: "+11.2%", trend: "up", hint: "12 × MRR" },
  { name: "Revenue Growth Rate (MoM)", value: "11.2%", change: "+1.4 pp", trend: "up", benchmark: "Healthy ≥ 10%" },
  { name: "Gross Margin", value: "72%", change: "+2.1 pp", trend: "up", benchmark: "SaaS ≥ 70%" },
  { name: "Burn Rate", value: "₹ 4.1L / mo", change: "−12% MoM", trend: "down", hint: "Lower is better" },
  { name: "Runway", value: "9.2 months", change: "+0.8 mo", trend: "up", benchmark: "Aim ≥ 12 mo" },
  { name: "ARPU", value: "₹ 6,200", change: "+₹ 410", trend: "up" },
  { name: "Gross Merchandise Value", value: "₹ 38.6L", change: "+8.4%", trend: "up" },
  { name: "Conversion Rate", value: "3.4%", change: "+0.3 pp", trend: "up", benchmark: "B2B ≥ 2%" },
  { name: "AR Turnover", value: "8.2×", change: "+0.5×", trend: "up", hint: "Collections efficiency" },
];

const CUSTOMER: Metric[] = [
  { name: "Customer Acquisition Cost (CAC)", value: "₹ 1,290", change: "−₹ 110", trend: "down", hint: "Lower is better" },
  { name: "Customer Lifetime Value (LTV)", value: "₹ 6,180", change: "+₹ 420", trend: "up" },
  { name: "LTV : CAC Ratio", value: "4.8 : 1", change: "+0.4×", trend: "up", benchmark: "Ideal ≥ 3 : 1" },
  { name: "Monthly Active Users (MAU)", value: "12,480", change: "+9.1%", trend: "up" },
  { name: "Daily Active Users (DAU)", value: "3,120", change: "+6.4%", trend: "up" },
  { name: "DAU / MAU Stickiness", value: "25.0%", change: "−0.8 pp", trend: "down", benchmark: "Strong ≥ 20%" },
  { name: "Customer Retention Rate", value: "92%", change: "+1 pp", trend: "up" },
  { name: "Churn Rate (logo)", value: "2.4% / mo", change: "−0.3 pp", trend: "down", benchmark: "SaaS ≤ 3%" },
  { name: "Net Promoter Score (NPS)", value: "54", change: "+6", trend: "up", benchmark: "Excellent ≥ 50" },
  { name: "Customer Fan Magnet (CFM)", value: "71", change: "+4", trend: "up", hint: "Loyalty + advocacy" },
];

const PRODUCT: Metric[] = [
  { name: "Activation Rate", value: "48%", change: "+3 pp", trend: "up", hint: "% reaching 'aha' moment" },
  { name: "Onboarding Completion", value: "76%", change: "+2 pp", trend: "up" },
  { name: "Feature Adoption (Insights)", value: "32%", change: "+11 pp", trend: "up" },
  { name: "Session Length (avg)", value: "8m 42s", change: "+1m 04s", trend: "up" },
  { name: "Cohort Retention (M3)", value: "61%", change: "+3 pp", trend: "up" },
  { name: "Virality (K-factor)", value: "0.42", change: "+0.05", trend: "up", benchmark: "Viral > 1.0" },
  { name: "Referral Rate", value: "14%", change: "+2 pp", trend: "up" },
  { name: "Customer Effort Score (CES)", value: "5.6 / 7", change: "+0.2", trend: "up" },
];

const OPERATIONS: Metric[] = [
  { name: "Revenue per Employee", value: "₹ 8.3L", change: "+₹ 60k", trend: "up" },
  { name: "Employee Turnover", value: "6.2%", change: "−1.1 pp", trend: "down" },
  { name: "Hiring Velocity (days)", value: "32d", change: "−4d", trend: "down" },
  { name: "Product Uptime", value: "99.94%", change: "+0.02 pp", trend: "up", benchmark: "SLA ≥ 99.9%" },
  { name: "API Latency (p95)", value: "186 ms", change: "−14 ms", trend: "down" },
  { name: "Error Rate", value: "0.18%", change: "−0.04 pp", trend: "down" },
  { name: "Deployment Frequency", value: "11 / wk", change: "+2", trend: "up" },
  { name: "MTTR", value: "42 min", change: "−8 min", trend: "down" },
];

function trendIcon(t?: Trend) {
  if (t === "up") return <TrendingUp className="h-3 w-3 text-success" />;
  if (t === "down") return <TrendingDown className="h-3 w-3 text-success" />; // down is good for cost metrics; tone via colour kept neutral-positive
  return <Minus className="h-3 w-3 text-ink-4" />;
}

function MetricRow({ m }: { m: Metric }) {
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
        <div className="font-mono text-[15px] font-semibold tracking-tight text-ink">{m.value}</div>
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

function Section({ title, metrics }: { title: string; metrics: Metric[] }) {
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
  return (
    <PortalShell portalId="founder">
      <PageHeader
        title="Growth KPI Dashboard"
        subtitle="The 50 startup metrics that matter — curated from Grae's KPI playbook. Updated daily from your books, product analytics and CRM."
      />

      {/* Headline numbers */}
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi value="₹ 1.49 Cr" label="ARR" change="▲ 11.2% MoM" tone="up" />
        <Kpi value="4.8 : 1" label="LTV : CAC" change="Healthy ≥ 3 : 1" tone="up" />
        <Kpi value="2.4%" label="Monthly Churn" change="▼ 0.3 pp" tone="up" />
        <Kpi value="9.2 mo" label="Runway" change="▲ 0.8 mo" tone="up" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Financial Health" metrics={FINANCIAL} />
        <Section title="Customer & Market" metrics={CUSTOMER} />
        <Section title="Product & Engagement" metrics={PRODUCT} />
        <Section title="Operations & Engineering" metrics={OPERATIONS} />
      </div>
    </PortalShell>
  );
}
