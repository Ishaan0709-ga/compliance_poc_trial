import type { DashboardSnapshot, FounderAnalyticsState, MonthHeader, PeriodFilter } from "./types";
import { computeAllMonths } from "./formulas";

export function monthIndex(state: FounderAnalyticsState, month?: MonthHeader): number {
  const target = month ?? state.reportingMonth;
  const idx = state.months.findIndex((m) => m.month === target);
  return idx >= 0 ? idx : state.months.length - 1;
}

export function getSnapshot(
  state: FounderAnalyticsState,
  period: PeriodFilter = "YTD"
): DashboardSnapshot {
  const computed = computeAllMonths(state.months);
  const idx = monthIndex(state);
  const month = computed[idx];
  const prevMonth = idx > 0 ? computed[idx - 1] : null;

  let chartMonths: typeof computed;
  if (period === "MTD") {
    chartMonths = prevMonth ? [prevMonth, month] : [month];
  } else if (period === "QTD") {
    chartMonths = computed.slice(Math.max(0, idx - 2), idx + 1);
  } else {
    chartMonths = computed.slice(0, idx + 1);
  }

  return { month, prevMonth, chartMonths, period };
}

export function formatPctRate(n: number | null | undefined, digits = 1): string {
  if (n == null || Number.isNaN(n)) return "—";
  return `${(n * 100).toFixed(digits)}%`;
}

export function formatTrendMom(current: number | null, label = "MoM"): string {
  if (current == null) return "—";
  const pct = current * 100;
  const arrow = pct >= 0 ? "↑" : "↓";
  return `${arrow} ${Math.abs(pct).toFixed(1)}% ${label}`;
}

export function formatRatio(n: number | null | undefined, suffix = "x"): string {
  if (n == null || Number.isNaN(n)) return "—";
  return `${n.toFixed(1)}${suffix}`;
}

export function runwayHealth(months: number): { label: string; tone: "healthy" | "watch" | "critical" } {
  if (months >= 18) return { label: "Healthy zone", tone: "healthy" };
  if (months >= 12) return { label: "Watch zone", tone: "watch" };
  return { label: "Critical zone", tone: "critical" };
}

export function funnelPct(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(100, Math.round((value / max) * 100));
}
