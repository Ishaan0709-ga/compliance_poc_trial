export type PeriodFilter = "MTD" | "QTD" | "YTD";

export type ComplianceFiling = {
  id: string;
  name: string;
  status: "healthy" | "upcoming" | "overdue";
  dueDate: string;
  daysRemaining: number;
};

export type MonthlyRecord = {
  month: string;
  mrr: number;
  arr: number;
  netNewMrr: number;
  mrrGrowthMom: number | null;
  arpu: number;
  mrrQuickRatio: number | null;
  activeCustomers: number;
  newCustomers: number;
  churnedCustomers: number;
  cac: number;
  ltv: number | null;
  ltvCacRatio: number | null;
  logoChurnRate: number | null;
  nrr: number | null;
  nps: number;
  revenue: number;
  opex: number;
  netBurn: number;
  cashBalance: number;
  runwayMonths: number;
  burnMultiple: number | null;
  headcount: number;
  openRoles: number;
  attritionRate: number | null;
  revenuePerEmployee: number;
  leads: number;
  qualified: number;
  demos: number;
  closedWon: number;
};

export type FounderAnalyticsState = {
  reportingMonth: string;
  months: MonthlyRecord[];
  compliance: ComplianceFiling[];
  updatedAt: string;
};

export type DashboardSnapshot = {
  month: MonthlyRecord;
  prevMonth: MonthlyRecord | null;
  chartMonths: MonthlyRecord[];
  period: PeriodFilter;
};
