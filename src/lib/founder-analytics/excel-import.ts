import * as XLSX from "xlsx";
import type { FounderAnalyticsState, MonthlyRecord } from "./types";
import { getDefaultFounderAnalyticsState } from "./seed-data";

const MONTH_HEADERS = [
  "Jan-26",
  "Feb-26",
  "Mar-26",
  "Apr-26",
  "May-26",
  "Jun-26",
  "Jul-26",
  "Aug-26",
  "Sep-26",
  "Oct-26",
  "Nov-26",
  "Dec-26",
];

function num(v: unknown): number {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string" && v.trim() && v !== "n/a") {
    const n = Number(v.replace(/,/g, ""));
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

function readRawSheet(wb: XLSX.WorkBook): Partial<Record<string, number[]>> {
  const sheet = wb.Sheets["Raw Data Input"];
  if (!sheet) return {};
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  const map: Partial<Record<string, number[]>> = {};

  for (const row of rows) {
    const label = String(Object.values(row)[0] ?? "").trim();
    if (!label || label === "Month") continue;
    const values: number[] = [];
    for (let i = 0; i < MONTH_HEADERS.length; i++) {
      const key = i === 0 ? "__EMPTY" : `__EMPTY_${i}`;
      values.push(num(row[key]));
    }
    map[label] = values;
  }
  return map;
}

function pick(map: Partial<Record<string, number[]>>, label: string, i: number): number {
  return map[label]?.[i] ?? 0;
}

export async function importFounderExcel(file: File): Promise<FounderAnalyticsState> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });
  const raw = readRawSheet(wb);
  const base = getDefaultFounderAnalyticsState();

  const months: MonthlyRecord[] = MONTH_HEADERS.map((month, i) => {
    const mrr = pick(raw, "Total monthly-normalized invoice value of active subs (Rs)", i);
    const prev = base.months[i];
    const arr = mrr * 12;
    const revenue = pick(raw, "Total revenue recognized this month (Rs) — from P&L Operating Income", i);
    const opex = pick(raw, "Total operating expenses this month (Rs) — from P&L", i);
    const netBurn = opex - revenue;
    const cashBalance = pick(raw, "Cash & bank balance, end of month (Rs) — from Balance Sheet", i);
    const headcount = pick(raw, "Headcount, end of month", i) || prev.headcount;

    return {
      ...prev,
      month,
      mrr,
      arr,
      revenue,
      opex,
      netBurn,
      cashBalance,
      activeCustomers: pick(raw, "Total active customers, end of month (count)", i) || prev.activeCustomers,
      newCustomers: pick(raw, "New customers acquired this month (count)", i),
      churnedCustomers: pick(raw, "Customers churned this month (count)", i),
      nps: pick(raw, "NPS score this month (survey tool, -100 to 100)", i) || prev.nps,
      headcount,
      openRoles: pick(raw, "Open roles (count)", i) || prev.openRoles,
      leads: pick(raw, "Leads generated this month (count)", i),
      qualified: pick(raw, "Leads qualified this month (count)", i),
      demos: pick(raw, "Demos completed this month (count)", i),
      closedWon: pick(raw, "Deals closed-won this month (count)", i),
      revenuePerEmployee: headcount > 0 ? Math.round(revenue / headcount) : prev.revenuePerEmployee,
      mrrGrowthMom:
        i > 0 && prev.mrr > 0
          ? (mrr - base.months[i - 1].mrr) / base.months[i - 1].mrr
          : null,
      netNewMrr: prev.netNewMrr,
      arpu: prev.arpu,
      mrrQuickRatio: prev.mrrQuickRatio,
      cac: prev.cac,
      ltv: prev.ltv,
      ltvCacRatio: prev.ltvCacRatio,
      logoChurnRate: prev.logoChurnRate,
      nrr: prev.nrr,
      runwayMonths: prev.runwayMonths,
      burnMultiple: prev.burnMultiple,
      attritionRate: prev.attritionRate,
    };
  });

  return {
    ...base,
    months,
    updatedAt: new Date().toISOString(),
  };
}

export function exportFounderExcel(state: FounderAnalyticsState): void {
  const rows = state.months.map((m) => ({
    Month: m.month,
    MRR: m.mrr,
    ARR: m.arr,
    Customers: m.activeCustomers,
    "Net Burn": m.netBurn,
    "Cash Balance": m.cashBalance,
    Runway: m.runwayMonths,
    Headcount: m.headcount,
    NPS: m.nps,
    CAC: m.cac,
    LTV: m.ltv,
    Leads: m.leads,
    "Closed Won": m.closedWon,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Founder Metrics");
  XLSX.writeFile(wb, `complyos-founder-metrics-${state.reportingMonth}.xlsx`);
}
