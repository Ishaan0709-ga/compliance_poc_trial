import { inr } from "@/lib/format";
import { formatPctRate, formatRatio, formatTrendMom } from "./compute";
import type { MonthlyRecord } from "./types";

export type KpiMetric = {
  name: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "flat";
  benchmark?: string;
  hint?: string;
};

function deltaNum(curr: number, prev: number | null | undefined, fmt: (n: number) => string): string | undefined {
  if (prev == null) return undefined;
  const d = curr - prev;
  if (d === 0) return "—";
  return d > 0 ? `+${fmt(d)}` : `−${fmt(Math.abs(d))}`;
}

function deltaPctPoints(
  curr: number | null,
  prev: number | null | undefined
): string | undefined {
  if (curr == null || prev == null) return undefined;
  const d = (curr - prev) * 100;
  if (Math.abs(d) < 0.01) return "—";
  return d > 0 ? `+${d.toFixed(1)} pp` : `−${Math.abs(d).toFixed(1)} pp`;
}

export function buildRevenueGrowthMetrics(m: MonthlyRecord, prev: MonthlyRecord | null): KpiMetric[] {
  const leadToClose = m.leads > 0 ? m.closedWon / m.leads : 0;
  return [
    {
      name: "Monthly Recurring Revenue (MRR)",
      value: inr(m.mrr, { compact: true }),
      change: formatTrendMom(m.mrrGrowthMom),
      trend: m.mrrGrowthMom != null && m.mrrGrowthMom >= 0 ? "up" : "down",
      hint: "Predictable subscription revenue / month",
    },
    {
      name: "Annual Recurring Revenue (ARR)",
      value: inr(m.arr, { compact: true }),
      change: deltaNum(m.arr, prev?.arr, (n) => inr(n, { compact: true })),
      trend: prev && m.arr >= prev.arr ? "up" : "flat",
      hint: "12 × MRR",
    },
    {
      name: "Net New MRR",
      value: inr(m.netNewMrr, { compact: true }),
      change: deltaNum(m.netNewMrr, prev?.netNewMrr, (n) => inr(n, { compact: true })),
      trend: prev && m.netNewMrr >= prev.netNewMrr ? "up" : "flat",
    },
    {
      name: "MRR Growth Rate (MoM)",
      value: formatPctRate(m.mrrGrowthMom),
      change: deltaPctPoints(m.mrrGrowthMom, prev?.mrrGrowthMom),
      trend: m.mrrGrowthMom != null && m.mrrGrowthMom >= 0 ? "up" : "down",
      benchmark: "Healthy ≥ 2%",
    },
    {
      name: "MRR Quick Ratio",
      value: formatRatio(m.mrrQuickRatio),
      change: deltaNum(m.mrrQuickRatio ?? 0, prev?.mrrQuickRatio ?? undefined, (n) => n.toFixed(1)),
      trend: "up",
      hint: "(New + expansion) / (contraction + churn)",
    },
    {
      name: "ARPU",
      value: inr(m.arpu),
      change: deltaNum(m.arpu, prev?.arpu, (n) => inr(n)),
      trend: prev && m.arpu >= prev.arpu ? "up" : "flat",
    },
    {
      name: "Lead-to-Close Conversion",
      value: formatPctRate(leadToClose),
      change: prev
        ? deltaPctPoints(leadToClose, prev.leads > 0 ? prev.closedWon / prev.leads : 0)
        : undefined,
      trend: "up",
      benchmark: "B2B ≥ 10%",
    },
    {
      name: "Deals Closed-Won",
      value: String(m.closedWon),
      change: deltaNum(m.closedWon, prev?.closedWon, (n) => String(n)),
      trend: prev && m.closedWon >= prev.closedWon ? "up" : "flat",
    },
  ];
}

export function buildCustomerMetrics(m: MonthlyRecord, prev: MonthlyRecord | null): KpiMetric[] {
  return [
    {
      name: "Customer Acquisition Cost (CAC)",
      value: inr(m.cac),
      change: deltaNum(m.cac, prev?.cac, (n) => inr(n)),
      trend: prev && m.cac <= prev.cac ? "up" : "down",
      hint: "Lower is better",
    },
    {
      name: "Customer Lifetime Value (LTV)",
      value: m.ltv ? inr(m.ltv) : "—",
      change: m.ltv && prev?.ltv ? deltaNum(m.ltv, prev.ltv, (n) => inr(n)) : undefined,
      trend: prev?.ltv && m.ltv && m.ltv >= prev.ltv ? "up" : "flat",
    },
    {
      name: "LTV : CAC Ratio",
      value: m.ltvCacRatio ? `${m.ltvCacRatio.toFixed(1)} : 1` : "—",
      change:
        m.ltvCacRatio && prev?.ltvCacRatio
          ? deltaNum(m.ltvCacRatio, prev.ltvCacRatio, (n) => `${n.toFixed(1)}×`)
          : undefined,
      trend: m.ltvCacRatio != null && m.ltvCacRatio >= 3 ? "up" : "flat",
      benchmark: "Ideal ≥ 3 : 1",
    },
    {
      name: "Active Customers",
      value: String(m.activeCustomers),
      change: deltaNum(m.activeCustomers, prev?.activeCustomers, (n) => String(n)),
      trend: prev && m.activeCustomers >= prev.activeCustomers ? "up" : "flat",
    },
    {
      name: "New Customers",
      value: String(m.newCustomers),
      change: deltaNum(m.newCustomers, prev?.newCustomers, (n) => String(n)),
      trend: "up",
    },
    {
      name: "Logo Churn Rate",
      value: formatPctRate(m.logoChurnRate),
      change: deltaPctPoints(m.logoChurnRate, prev?.logoChurnRate),
      trend: prev?.logoChurnRate != null && m.logoChurnRate != null && m.logoChurnRate <= prev.logoChurnRate ? "up" : "down",
      benchmark: "SaaS ≤ 3%",
    },
    {
      name: "Net Revenue Retention",
      value: m.nrr != null ? `${(m.nrr * 100).toFixed(1)}%` : "—",
      change: m.nrr && prev?.nrr ? deltaPctPoints(m.nrr, prev.nrr) : undefined,
      trend: m.nrr != null && m.nrr >= 1 ? "up" : "flat",
      benchmark: "≥ 100%",
    },
    {
      name: "Net Promoter Score (NPS)",
      value: String(m.nps),
      change: deltaNum(m.nps, prev?.nps, (n) => String(n)),
      trend: prev && m.nps >= prev.nps ? "up" : "flat",
      benchmark: "Excellent ≥ 50",
    },
  ];
}

export function buildBurnRunwayMetrics(m: MonthlyRecord, prev: MonthlyRecord | null): KpiMetric[] {
  return [
    {
      name: "Monthly Net Burn",
      value: `${inr(m.netBurn, { compact: true })} / mo`,
      change: deltaNum(m.netBurn, prev?.netBurn, (n) => inr(n, { compact: true })),
      trend: prev && m.netBurn <= prev.netBurn ? "up" : "down",
      hint: "Operating expenses − revenue",
    },
    {
      name: "Operating Expenses",
      value: inr(m.opex, { compact: true }),
      change: deltaNum(m.opex, prev?.opex, (n) => inr(n, { compact: true })),
      trend: "flat",
    },
    {
      name: "Revenue Recognized",
      value: inr(m.revenue, { compact: true }),
      change: deltaNum(m.revenue, prev?.revenue, (n) => inr(n, { compact: true })),
      trend: prev && m.revenue >= prev.revenue ? "up" : "flat",
    },
    {
      name: "Cash & Bank Balance",
      value: inr(m.cashBalance, { compact: true }),
      change: deltaNum(m.cashBalance, prev?.cashBalance, (n) => inr(n, { compact: true })),
      trend: prev && m.cashBalance >= prev.cashBalance ? "up" : "down",
    },
    {
      name: "Cash Runway",
      value: `${m.runwayMonths.toFixed(1)} months`,
      change: deltaNum(m.runwayMonths, prev?.runwayMonths, (n) => `${n.toFixed(1)} mo`),
      trend: prev && m.runwayMonths >= prev.runwayMonths ? "up" : "down",
      benchmark: "Aim ≥ 18 mo",
    },
    {
      name: "Burn Multiple",
      value: formatRatio(m.burnMultiple),
      change: deltaNum(m.burnMultiple ?? 0, prev?.burnMultiple ?? undefined, (n) => n.toFixed(2)),
      trend: prev?.burnMultiple != null && m.burnMultiple != null && m.burnMultiple <= prev.burnMultiple ? "up" : "down",
      hint: "Net burn / net new ARR",
    },
  ];
}

export function buildTeamOpsMetrics(m: MonthlyRecord, prev: MonthlyRecord | null): KpiMetric[] {
  return [
    {
      name: "Headcount",
      value: String(m.headcount),
      change: deltaNum(m.headcount, prev?.headcount, (n) => String(n)),
      trend: "up",
    },
    {
      name: "Open Roles",
      value: String(m.openRoles),
      change: deltaNum(m.openRoles, prev?.openRoles, (n) => String(n)),
      trend: "flat",
    },
    {
      name: "Attrition Rate",
      value: formatPctRate(m.attritionRate),
      change: deltaPctPoints(m.attritionRate, prev?.attritionRate),
      trend: prev?.attritionRate != null && m.attritionRate != null && m.attritionRate <= prev.attritionRate ? "up" : "down",
    },
    {
      name: "Revenue per Employee",
      value: inr(m.revenuePerEmployee, { compact: true }),
      change: deltaNum(m.revenuePerEmployee, prev?.revenuePerEmployee, (n) => inr(n, { compact: true })),
      trend: prev && m.revenuePerEmployee >= prev.revenuePerEmployee ? "up" : "flat",
    },
    {
      name: "Leads Generated",
      value: String(m.leads),
      change: deltaNum(m.leads, prev?.leads, (n) => String(n)),
      trend: "up",
    },
    {
      name: "Qualified Leads",
      value: String(m.qualified),
      change: deltaNum(m.qualified, prev?.qualified, (n) => String(n)),
      trend: "up",
    },
    {
      name: "Demos Completed",
      value: String(m.demos),
      change: deltaNum(m.demos, prev?.demos, (n) => String(n)),
      trend: "up",
    },
    {
      name: "Closed-Won Deals",
      value: String(m.closedWon),
      change: deltaNum(m.closedWon, prev?.closedWon, (n) => String(n)),
      trend: "up",
    },
  ];
}
