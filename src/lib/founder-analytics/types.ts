export type PeriodFilter = "MTD" | "QTD" | "YTD";

export const MONTH_HEADERS = [
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
] as const;

export type MonthHeader = (typeof MONTH_HEADERS)[number];

/** Hardcoded blue-input cells from ishaan_excel.xlsx — Raw Data Input + gross margin */
export type RawMonthlyInput = {
  month: MonthHeader;
  activeSubscriptions: number;
  monthlySubscriptionCost: number;
  newSubscriptionsStarted: number;
  subscriptionsDowngradedMrrLost: number;
  subscriptionsCancelled: number;
  totalOperatingExpenses: number;
  cashAndBankBalance: number;
  /** Jan/Feb only — Mar+ computed from subscriptions */
  totalActiveCustomers: number | null;
  newCustomersAcquired: number | null;
  customersChurned: number | null;
  salesMarketingSpend: number;
  leadsGenerated: number;
  leadsQualified: number;
  demosCompleted: number;
  dealsClosedWon: number;
  npsScore: number;
  headcount: number;
  employeesExited: number;
  openRoles: number;
  grossMarginAssumption: number;
};

/** Raw Data Input — intermediate + linked rows (formulas on that sheet) */
export type RawDataComputed = {
  totalMonthlyNormalizedInvoiceValue: number;
  newMrrAddedThisMonth: number;
  subscriptionsUpgradedMrrAdded: number;
  mrrLostToCancellations: number;
  totalRevenueRecognized: number;
  totalActiveCustomers: number;
  newCustomersAcquired: number;
  customersChurned: number;
};

/** MRR-ARR sheet */
export type MrrArrComputed = {
  mrr: number;
  newMrrAdded: number;
  expansionMrr: number;
  contractionMrr: number;
  churnedMrr: number;
  netNewMrr: number;
  arr: number;
  mrrGrowthMom: number | null;
  mrrChurnRate: number | null;
  mrrQuickRatio: number | null;
  arpu: number;
};

/** Customer Metrics sheet */
export type CustomerMetricsComputed = {
  grossMarginAssumption: number;
  cac: number;
  customerChurnRate: number | null;
  arpu: number;
  ltv: number | null;
  ltvCacRatio: number | null;
  logoChurnRate: number | null;
  nrr: number | null;
  nps: number;
  leads: number;
  qualified: number;
  demos: number;
  closedWon: number;
  leadToCloseRate: number | null;
};

/** Burn-Runway sheet */
export type BurnRunwayComputed = {
  revenue: number;
  opex: number;
  netBurn: number;
  cashBalance: number;
  trailing3MonthAvgBurn: number;
  runwayMonths: number;
  burnMultiple: number | null;
};

/** Team-Ops sheet */
export type TeamOpsComputed = {
  headcount: number;
  openRoles: number;
  attritionRate: number | null;
  revenuePerEmployee: number;
  mrrPerEmployee: number;
};

/** Full computed month — all KPI sheets merged (Dashboard source) */
export type ComputedMonth = RawDataComputed &
  MrrArrComputed &
  CustomerMetricsComputed &
  BurnRunwayComputed &
  TeamOpsComputed & {
    month: MonthHeader;
    activeCustomers: number;
    newCustomers: number;
    churnedCustomers: number;
  };

export type ComplianceFiling = {
  id: string;
  name: string;
  status: "healthy" | "upcoming" | "overdue";
  dueDate: string;
  daysRemaining: number;
};

export type FounderAnalyticsState = {
  reportingMonth: MonthHeader;
  months: RawMonthlyInput[];
  compliance: ComplianceFiling[];
  updatedAt: string;
};

export type DashboardSnapshot = {
  month: ComputedMonth;
  prevMonth: ComputedMonth | null;
  chartMonths: ComputedMonth[];
  period: PeriodFilter;
};

/** @deprecated Legacy flat record — used only for localStorage migration */
export type LegacyMonthlyRecord = {
  month: string;
  mrr?: number;
  arr?: number;
  [key: string]: unknown;
};
