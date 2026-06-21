import * as XLSX from "xlsx";
import type { FounderAnalyticsState, RawMonthlyInput } from "./types";
import { MONTH_HEADERS } from "./types";
import { getDefaultFounderAnalyticsState } from "./seed-data";

const RAW_INPUT_LABELS: { label: string; key: keyof RawMonthlyInput }[] = [
  { label: "Active subscriptions (count, end of month)", key: "activeSubscriptions" },
  { label: "Monthly Subscription Cost", key: "monthlySubscriptionCost" },
  { label: "New subscriptions started this month (count)", key: "newSubscriptionsStarted" },
  { label: "Subscriptions downgraded this month — MRR lost (Rs)", key: "subscriptionsDowngradedMrrLost" },
  { label: "Subscriptions cancelled this month (count)", key: "subscriptionsCancelled" },
  { label: "Total operating expenses this month (Rs) — from P&L", key: "totalOperatingExpenses" },
  { label: "Cash & bank balance, end of month (Rs) — from Balance Sheet", key: "cashAndBankBalance" },
  { label: "Total active customers, end of month (count)", key: "totalActiveCustomers" },
  { label: "New customers acquired this month (count)", key: "newCustomersAcquired" },
  { label: "Customers churned this month (count)", key: "customersChurned" },
  { label: "Sales & marketing spend this month (Rs)", key: "salesMarketingSpend" },
  { label: "Leads generated this month (count)", key: "leadsGenerated" },
  { label: "Leads qualified this month (count)", key: "leadsQualified" },
  { label: "Demos completed this month (count)", key: "demosCompleted" },
  { label: "Deals closed-won this month (count)", key: "dealsClosedWon" },
  { label: "NPS score this month (survey tool, -100 to 100)", key: "npsScore" },
  { label: "Headcount, end of month", key: "headcount" },
  { label: "Employees exited this month (count)", key: "employeesExited" },
  { label: "Open roles (count)", key: "openRoles" },
];

function num(v: unknown): number | null {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string" && v.trim() && v !== "n/a") {
    const n = Number(v.replace(/,/g, "").replace(/%/g, ""));
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

function readRawSheet(wb: XLSX.WorkBook): Partial<Record<string, (number | null)[]>> {
  const sheet = wb.Sheets["Raw Data Input"];
  if (!sheet) return {};
  const range = XLSX.utils.decode_range(sheet["!ref"] ?? "A1");
  const map: Partial<Record<string, (number | null)[]>> = {};

  for (let r = range.s.r; r <= range.e.r; r++) {
    const labelCell = sheet[XLSX.utils.encode_cell({ r, c: 1 })];
    const label = String(labelCell?.v ?? "").trim();
    if (!label || label === "Month" || label.startsWith("REVENUE") || label.startsWith("P&L") || label.startsWith("CUSTOMERS") || label.startsWith("TEAM")) continue;

    const values: (number | null)[] = [];
    for (let c = 2; c <= 13; c++) {
      const cell = sheet[XLSX.utils.encode_cell({ r, c })];
      if (!cell) {
        values.push(null);
        continue;
      }
      if (cell.f) {
        values.push(null);
      } else {
        values.push(num(cell.v));
      }
    }
    map[label] = values;
  }

  const gmSheet = wb.Sheets["Customer Metrics"];
  if (gmSheet) {
    const gmCell = gmSheet["C6"];
    if (gmCell?.v != null) {
      map["Gross margin assumption (%) — used in LTV calc"] = Array(12).fill(num(gmCell.v));
    }
  }

  return map;
}

function pick(map: Partial<Record<string, (number | null)[]>>, label: string, i: number, fallback: number | null): number | null {
  return map[label]?.[i] ?? fallback;
}

export async function importFounderExcel(file: File): Promise<FounderAnalyticsState> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });
  const raw = readRawSheet(wb);
  const base = getDefaultFounderAnalyticsState();

  const months: RawMonthlyInput[] = MONTH_HEADERS.map((month, i) => {
    const prev = base.months[i];
    const gm = pick(raw, "Gross margin assumption (%) — used in LTV calc", i, prev.grossMarginAssumption) ?? 0.8;

    return {
      month,
      activeSubscriptions: pick(raw, "Active subscriptions (count, end of month)", i, prev.activeSubscriptions) ?? prev.activeSubscriptions,
      monthlySubscriptionCost: pick(raw, "Monthly Subscription Cost", i, prev.monthlySubscriptionCost) ?? prev.monthlySubscriptionCost,
      newSubscriptionsStarted: pick(raw, "New subscriptions started this month (count)", i, prev.newSubscriptionsStarted) ?? prev.newSubscriptionsStarted,
      subscriptionsDowngradedMrrLost: pick(raw, "Subscriptions downgraded this month — MRR lost (Rs)", i, prev.subscriptionsDowngradedMrrLost) ?? prev.subscriptionsDowngradedMrrLost,
      subscriptionsCancelled: pick(raw, "Subscriptions cancelled this month (count)", i, prev.subscriptionsCancelled) ?? prev.subscriptionsCancelled,
      totalOperatingExpenses: pick(raw, "Total operating expenses this month (Rs) — from P&L", i, prev.totalOperatingExpenses) ?? prev.totalOperatingExpenses,
      cashAndBankBalance: pick(raw, "Cash & bank balance, end of month (Rs) — from Balance Sheet", i, prev.cashAndBankBalance) ?? prev.cashAndBankBalance,
      totalActiveCustomers: i < 2 ? pick(raw, "Total active customers, end of month (count)", i, prev.totalActiveCustomers) : null,
      newCustomersAcquired: i < 2 ? pick(raw, "New customers acquired this month (count)", i, prev.newCustomersAcquired) : null,
      customersChurned: i < 2 ? pick(raw, "Customers churned this month (count)", i, prev.customersChurned) : null,
      salesMarketingSpend: pick(raw, "Sales & marketing spend this month (Rs)", i, prev.salesMarketingSpend) ?? prev.salesMarketingSpend,
      leadsGenerated: pick(raw, "Leads generated this month (count)", i, prev.leadsGenerated) ?? prev.leadsGenerated,
      leadsQualified: pick(raw, "Leads qualified this month (count)", i, prev.leadsQualified) ?? prev.leadsQualified,
      demosCompleted: pick(raw, "Demos completed this month (count)", i, prev.demosCompleted) ?? prev.demosCompleted,
      dealsClosedWon: pick(raw, "Deals closed-won this month (count)", i, prev.dealsClosedWon) ?? prev.dealsClosedWon,
      npsScore: pick(raw, "NPS score this month (survey tool, -100 to 100)", i, prev.npsScore) ?? prev.npsScore,
      headcount: pick(raw, "Headcount, end of month", i, prev.headcount) ?? prev.headcount,
      employeesExited: pick(raw, "Employees exited this month (count)", i, prev.employeesExited) ?? prev.employeesExited,
      openRoles: pick(raw, "Open roles (count)", i, prev.openRoles) ?? prev.openRoles,
      grossMarginAssumption: gm,
    };
  });

  return {
    ...base,
    months,
    updatedAt: new Date().toISOString(),
  };
}

export function exportFounderExcel(state: FounderAnalyticsState): void {
  const wb = XLSX.utils.book_new();
  const header = ["Parameter", ...MONTH_HEADERS];
  const dataRows = RAW_INPUT_LABELS.map(({ label, key }) => [
    label,
    ...state.months.map((m) => {
      const v = m[key];
      return v ?? "";
    }),
  ]);
  const ws = XLSX.utils.aoa_to_sheet([header, ...dataRows]);
  XLSX.utils.book_append_sheet(wb, ws, "Raw Data Input");
  XLSX.writeFile(wb, `complyos-founder-metrics-${state.reportingMonth}.xlsx`);
}
