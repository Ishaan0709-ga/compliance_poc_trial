import type { ComputedMonth, RawMonthlyInput } from "./types";

export type SheetRowKind = "section" | "input" | "computed";

export type SheetRowDef = {
  kind: SheetRowKind;
  label: string;
  /** Raw input field key — only for editable rows on Raw Data Input */
  inputKey?: keyof RawMonthlyInput;
  /** Computed field key on ComputedMonth */
  computedKey?: keyof ComputedMonth;
  /** Jan/Feb-only inputs — Mar+ these become computed */
  janFebInputOnly?: boolean;
  format?: "number" | "percent" | "ratio" | "na";
};

export const RAW_DATA_SHEET_ROWS: SheetRowDef[] = [
  {
    kind: "section",
    label: "REVENUE & SUBSCRIPTIONS  (Source: Zoho Books — Recurring Invoices API)",
  },
  {
    kind: "input",
    label: "Active subscriptions (count, end of month)",
    inputKey: "activeSubscriptions",
  },
  {
    kind: "input",
    label: "Monthly Subscription Cost",
    inputKey: "monthlySubscriptionCost",
  },
  {
    kind: "computed",
    label: "Total monthly-normalized invoice value of active subs (Rs)",
    computedKey: "totalMonthlyNormalizedInvoiceValue",
  },
  {
    kind: "input",
    label: "New subscriptions started this month (count)",
    inputKey: "newSubscriptionsStarted",
  },
  {
    kind: "computed",
    label: "New MRR added this month (Rs)",
    computedKey: "newMrrAddedThisMonth",
  },
  {
    kind: "computed",
    label: "Subscriptions upgraded this month — MRR added (Rs)",
    computedKey: "subscriptionsUpgradedMrrAdded",
  },
  {
    kind: "input",
    label: "Subscriptions downgraded this month — MRR lost (Rs)",
    inputKey: "subscriptionsDowngradedMrrLost",
  },
  {
    kind: "input",
    label: "Subscriptions cancelled this month (count)",
    inputKey: "subscriptionsCancelled",
  },
  {
    kind: "computed",
    label: "MRR lost to cancellations this month (Rs)",
    computedKey: "mrrLostToCancellations",
  },
  {
    kind: "section",
    label: "P&L / CASH FLOW  (Source: Zoho Books — /reports/profitandloss, /reports/cashflow)",
  },
  {
    kind: "computed",
    label: "Total revenue recognized this month (Rs) — from P&L Operating Income",
    computedKey: "totalRevenueRecognized",
  },
  {
    kind: "input",
    label: "Total operating expenses this month (Rs) — from P&L",
    inputKey: "totalOperatingExpenses",
  },
  {
    kind: "input",
    label: "Cash & bank balance, end of month (Rs) — from Balance Sheet",
    inputKey: "cashAndBankBalance",
  },
  {
    kind: "section",
    label: "CUSTOMERS & SALES  (Source: Zoho CRM / Zoho Books Contacts)",
  },
  {
    kind: "input",
    label: "Total active customers, end of month (count)",
    inputKey: "totalActiveCustomers",
    janFebInputOnly: true,
    computedKey: "totalActiveCustomers",
  },
  {
    kind: "input",
    label: "New customers acquired this month (count)",
    inputKey: "newCustomersAcquired",
    janFebInputOnly: true,
    computedKey: "newCustomersAcquired",
  },
  {
    kind: "input",
    label: "Customers churned this month (count)",
    inputKey: "customersChurned",
    janFebInputOnly: true,
    computedKey: "customersChurned",
  },
  {
    kind: "input",
    label: "Sales & marketing spend this month (Rs)",
    inputKey: "salesMarketingSpend",
  },
  {
    kind: "input",
    label: "Leads generated this month (count)",
    inputKey: "leadsGenerated",
  },
  {
    kind: "input",
    label: "Leads qualified this month (count)",
    inputKey: "leadsQualified",
  },
  {
    kind: "input",
    label: "Demos completed this month (count)",
    inputKey: "demosCompleted",
  },
  {
    kind: "input",
    label: "Deals closed-won this month (count)",
    inputKey: "dealsClosedWon",
  },
  {
    kind: "input",
    label: "NPS score this month (survey tool, -100 to 100)",
    inputKey: "npsScore",
  },
  {
    kind: "section",
    label: "TEAM & OPS  (Source: Zoho People / Payroll)",
  },
  {
    kind: "input",
    label: "Headcount, end of month",
    inputKey: "headcount",
  },
  {
    kind: "input",
    label: "Employees exited this month (count)",
    inputKey: "employeesExited",
  },
  {
    kind: "input",
    label: "Open roles (count)",
    inputKey: "openRoles",
  },
];

export const MRR_ARR_SHEET_ROWS: SheetRowDef[] = [
  { kind: "section", label: "MONTHLY RECURRING REVENUE" },
  {
    kind: "computed",
    label: "MRR — total active normalized monthly value (Rs)",
    computedKey: "mrr",
  },
  { kind: "computed", label: "New MRR added", computedKey: "newMrrAdded" },
  { kind: "computed", label: "Expansion MRR (upgrades)", computedKey: "expansionMrr" },
  { kind: "computed", label: "Contraction MRR (downgrades)", computedKey: "contractionMrr" },
  { kind: "computed", label: "Churned MRR (cancellations)", computedKey: "churnedMrr" },
  {
    kind: "computed",
    label: "Net new MRR  (new + expansion - contraction - churn)",
    computedKey: "netNewMrr",
  },
  { kind: "section", label: "ANNUAL RECURRING REVENUE" },
  { kind: "computed", label: "ARR  (MRR x 12)", computedKey: "arr" },
  { kind: "section", label: "GROWTH METRICS" },
  {
    kind: "computed",
    label: "MRR growth rate MoM (%)",
    computedKey: "mrrGrowthMom",
    format: "percent",
  },
  {
    kind: "computed",
    label: "MRR churn rate (%)  = churned MRR / prior month MRR",
    computedKey: "mrrChurnRate",
    format: "percent",
  },
  {
    kind: "computed",
    label: "MRR quick ratio  = (new + expansion) / (contraction + churn)",
    computedKey: "mrrQuickRatio",
    format: "ratio",
  },
  {
    kind: "computed",
    label: "ARPU  = MRR / active subscriptions",
    computedKey: "arpu",
  },
];

export const CUSTOMER_METRICS_SHEET_ROWS: SheetRowDef[] = [
  { kind: "section", label: "ASSUMPTIONS" },
  {
    kind: "input",
    label: "Gross margin assumption (%) — used in LTV calc",
    inputKey: "grossMarginAssumption",
    format: "percent",
  },
  { kind: "section", label: "CUSTOMER ACQUISITION COST (CAC)" },
  {
    kind: "computed",
    label: "CAC  = sales & marketing spend / new customers acquired",
    computedKey: "cac",
  },
  { kind: "section", label: "CUSTOMER LIFETIME VALUE (LTV)" },
  {
    kind: "computed",
    label: "Customer churn rate (%)  = churned customers / active customers (start of month)",
    computedKey: "customerChurnRate",
    format: "percent",
  },
  {
    kind: "computed",
    label: "ARPU  (linked from MRR-ARR sheet)",
    computedKey: "arpu",
  },
  {
    kind: "computed",
    label: "LTV  = (ARPU x gross margin) / customer churn rate",
    computedKey: "ltv",
  },
  { kind: "computed", label: "LTV : CAC ratio", computedKey: "ltvCacRatio", format: "ratio" },
  { kind: "section", label: "RETENTION & SATISFACTION" },
  {
    kind: "computed",
    label: "Logo churn rate (%)  (same as customer churn above)",
    computedKey: "logoChurnRate",
    format: "percent",
  },
  {
    kind: "computed",
    label: "Net revenue retention (%)  = 1 - MRR churn rate + expansion rate",
    computedKey: "nrr",
    format: "percent",
  },
  {
    kind: "computed",
    label: "NPS score  (linked from Raw Data Input)",
    computedKey: "nps",
  },
  { kind: "section", label: "SALES FUNNEL & CONVERSION" },
  { kind: "computed", label: "Leads generated", computedKey: "leads" },
  { kind: "computed", label: "Leads qualified", computedKey: "qualified" },
  { kind: "computed", label: "Demos completed", computedKey: "demos" },
  { kind: "computed", label: "Deals closed-won", computedKey: "closedWon" },
  {
    kind: "computed",
    label: "Lead-to-close conversion rate (%)",
    computedKey: "leadToCloseRate",
    format: "percent",
  },
];

export const BURN_RUNWAY_SHEET_ROWS: SheetRowDef[] = [
  { kind: "section", label: "MONTHLY BURN" },
  {
    kind: "computed",
    label: "Revenue recognized this month",
    computedKey: "revenue",
  },
  {
    kind: "computed",
    label: "Operating expenses this month",
    computedKey: "opex",
  },
  {
    kind: "computed",
    label: "Net burn  = operating expenses - revenue",
    computedKey: "netBurn",
  },
  { kind: "section", label: "CASH POSITION" },
  {
    kind: "computed",
    label: "Cash & bank balance, end of month",
    computedKey: "cashBalance",
  },
  {
    kind: "computed",
    label: "Trailing 3-month average burn",
    computedKey: "trailing3MonthAvgBurn",
  },
  { kind: "section", label: "RUNWAY & EFFICIENCY" },
  {
    kind: "computed",
    label: "Cash runway (months)  = cash balance / trailing 3-mo avg burn",
    computedKey: "runwayMonths",
  },
  {
    kind: "computed",
    label: "Burn multiple  = net burn / net new ARR",
    computedKey: "burnMultiple",
    format: "ratio",
  },
];

export const TEAM_OPS_SHEET_ROWS: SheetRowDef[] = [
  { kind: "section", label: "HEADCOUNT" },
  { kind: "computed", label: "Headcount, end of month", computedKey: "headcount" },
  { kind: "computed", label: "Open roles", computedKey: "openRoles" },
  {
    kind: "computed",
    label: "Attrition rate (%)  = exits this month / headcount (start of month)",
    computedKey: "attritionRate",
    format: "percent",
  },
  { kind: "section", label: "PRODUCTIVITY" },
  {
    kind: "computed",
    label: "Revenue per employee  = monthly revenue / headcount",
    computedKey: "revenuePerEmployee",
  },
  {
    kind: "computed",
    label: "MRR per employee  = MRR / headcount",
    computedKey: "mrrPerEmployee",
  },
];

export function isRowEditable(row: SheetRowDef, monthIndex: number): boolean {
  if (row.kind === "section" || row.kind === "computed") return false;
  if (row.janFebInputOnly && monthIndex >= 2) return false;
  return row.kind === "input";
}

export function getCellValue(
  row: SheetRowDef,
  monthIndex: number,
  input: RawMonthlyInput,
  computed: ComputedMonth
): number | null {
  if (row.kind === "section") return null;
  if (isRowEditable(row, monthIndex) && row.inputKey) {
    const v = input[row.inputKey];
    return typeof v === "number" ? v : null;
  }
  if (row.computedKey) {
    const v = computed[row.computedKey];
    if (v == null) return null;
    if (typeof v === "number") return v;
  }
  return null;
}

export function formatSheetValue(
  value: number | null | undefined,
  format?: SheetRowDef["format"]
): string {
  if (value == null) return "n/a";
  if (format === "percent") return `${(value * 100).toFixed(2)}%`;
  if (format === "ratio") return value.toFixed(2);
  if (Number.isInteger(value)) return String(value);
  return value.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

/** Resolve whether a raw-data row should show as input or computed for a given month */
export function resolveRawRowKind(row: SheetRowDef, monthIndex: number): SheetRowKind {
  if (row.kind === "section") return "section";
  if (row.janFebInputOnly && monthIndex >= 2) return "computed";
  return row.kind;
}

export function getRawRowComputedKey(row: SheetRowDef): keyof ComputedMonth | undefined {
  if (row.computedKey) return row.computedKey;
  if (row.inputKey === "totalActiveCustomers") return "totalActiveCustomers";
  if (row.inputKey === "newCustomersAcquired") return "newCustomersAcquired";
  if (row.inputKey === "customersChurned") return "customersChurned";
  return undefined;
}
