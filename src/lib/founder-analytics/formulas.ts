import type { ComputedMonth, FounderAnalyticsState, RawMonthlyInput } from "./types";

function safeDiv(num: number, den: number): number | null {
  if (!den || Number.isNaN(den)) return null;
  const r = num / den;
  return Number.isFinite(r) ? r : null;
}

function avg(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** Raw Data Input — formula rows on that sheet */
export function computeRawDataRow(input: RawMonthlyInput, monthIndex: number) {
  const mrr = input.activeSubscriptions * input.monthlySubscriptionCost;
  const newMrrAdded = mrr + input.newSubscriptionsStarted * input.monthlySubscriptionCost;
  const upgraded = newMrrAdded - mrr;
  const mrrLost = input.monthlySubscriptionCost * input.subscriptionsCancelled;
  const revenue = newMrrAdded - mrrLost;

  let activeCustomers: number;
  let newCustomers: number;
  let churned: number;

  if (monthIndex < 2) {
    activeCustomers =
      input.totalActiveCustomers ?? input.activeSubscriptions - input.subscriptionsCancelled;
    newCustomers = input.newCustomersAcquired ?? input.newSubscriptionsStarted;
    churned = input.customersChurned ?? input.subscriptionsCancelled;
  } else {
    activeCustomers = input.activeSubscriptions - input.subscriptionsCancelled;
    newCustomers = input.newSubscriptionsStarted;
    churned = input.subscriptionsCancelled;
  }

  return {
    totalMonthlyNormalizedInvoiceValue: mrr,
    newMrrAddedThisMonth: newMrrAdded,
    subscriptionsUpgradedMrrAdded: upgraded,
    mrrLostToCancellations: mrrLost,
    totalRevenueRecognized: revenue,
    totalActiveCustomers: activeCustomers,
    newCustomersAcquired: newCustomers,
    customersChurned: churned,
  };
}

function computeArpu(mrr: number, activeSubscriptions: number): number {
  return safeDiv(mrr, activeSubscriptions) ?? 0;
}

/** MRR-ARR sheet */
function computeMrrArr(
  raw: ReturnType<typeof computeRawDataRow>,
  input: RawMonthlyInput,
  activeSubscriptions: number,
  monthIndex: number,
  prevMrr: number | null
) {
  const mrr = raw.totalMonthlyNormalizedInvoiceValue;
  const newMrrAdded = raw.newMrrAddedThisMonth;
  const expansionMrr = raw.subscriptionsUpgradedMrrAdded;
  const contractionMrr = -input.subscriptionsDowngradedMrrLost;
  const churnedMrr = -raw.mrrLostToCancellations;
  const netNewMrr =
    newMrrAdded +
    expansionMrr -
    input.subscriptionsDowngradedMrrLost -
    raw.mrrLostToCancellations;

  return {
    mrr,
    newMrrAdded,
    expansionMrr,
    contractionMrr,
    churnedMrr,
    netNewMrr,
    arr: mrr * 12,
    mrrGrowthMom: prevMrr != null && prevMrr > 0 ? safeDiv(mrr - prevMrr, prevMrr) : null,
    mrrChurnRate:
      prevMrr != null && prevMrr > 0 ? safeDiv(raw.mrrLostToCancellations, prevMrr) : null,
    mrrQuickRatio: safeDiv(
      newMrrAdded + expansionMrr,
      input.subscriptionsDowngradedMrrLost + raw.mrrLostToCancellations
    ),
    arpu: computeArpu(mrr, activeSubscriptions),
  };
}

/** Customer Metrics sheet */
function computeCustomerMetrics(
  input: RawMonthlyInput,
  raw: ReturnType<typeof computeRawDataRow>,
  mrrArr: ReturnType<typeof computeMrrArr>,
  monthIndex: number,
  prevActiveCustomers: number | null,
  prevMrr: number | null
) {
  const arpu = mrrArr.arpu;
  const customerChurnRate =
    monthIndex > 0 && prevActiveCustomers
      ? safeDiv(raw.customersChurned, prevActiveCustomers)
      : null;
  const grossMargin = input.grossMarginAssumption;
  const ltv =
    customerChurnRate != null && customerChurnRate > 0
      ? (arpu * grossMargin) / customerChurnRate
      : null;
  const cac = safeDiv(input.salesMarketingSpend, raw.newCustomersAcquired) ?? 0;
  const ltvCacRatio = ltv != null && cac > 0 ? ltv / cac : null;
  const expansionRate =
    prevMrr != null && prevMrr > 0 ? raw.subscriptionsUpgradedMrrAdded / prevMrr : 0;
  const nrr =
    monthIndex > 0 && mrrArr.mrrChurnRate != null
      ? 1 - mrrArr.mrrChurnRate + expansionRate
      : null;

  return {
    grossMarginAssumption: grossMargin,
    cac,
    customerChurnRate,
    arpu,
    ltv,
    ltvCacRatio,
    logoChurnRate: customerChurnRate,
    nrr,
    nps: input.npsScore,
    leads: input.leadsGenerated,
    qualified: input.leadsQualified,
    demos: input.demosCompleted,
    closedWon: input.dealsClosedWon,
    leadToCloseRate: safeDiv(input.dealsClosedWon, input.leadsGenerated),
  };
}

/** Burn-Runway sheet */
function computeBurnRunway(
  raw: ReturnType<typeof computeRawDataRow>,
  input: RawMonthlyInput,
  netNewMrr: number,
  monthIndex: number,
  priorNetBurns: number[]
) {
  const revenue = raw.totalRevenueRecognized;
  const opex = input.totalOperatingExpenses;
  const netBurn = opex - revenue;
  const window = [...priorNetBurns, netBurn].slice(-3);
  const trailing = avg(window);
  const runwayMonths = trailing > 0 ? input.cashAndBankBalance / trailing : 0;
  const netNewArr = netNewMrr * 12;
  const burnMultiple = netNewArr > 0 ? safeDiv(netBurn, netNewArr) : null;

  return {
    revenue,
    opex,
    netBurn,
    cashBalance: input.cashAndBankBalance,
    trailing3MonthAvgBurn: trailing,
    runwayMonths,
    burnMultiple,
  };
}

/** Team-Ops sheet */
function computeTeamOps(
  raw: ReturnType<typeof computeRawDataRow>,
  input: RawMonthlyInput,
  mrr: number,
  monthIndex: number,
  prevHeadcount: number | null
) {
  return {
    headcount: input.headcount,
    openRoles: input.openRoles,
    attritionRate:
      monthIndex > 0 && prevHeadcount ? safeDiv(input.employeesExited, prevHeadcount) : null,
    revenuePerEmployee: safeDiv(raw.totalRevenueRecognized, input.headcount) ?? 0,
    mrrPerEmployee: safeDiv(mrr, input.headcount) ?? 0,
  };
}

/** Compute all months in order — mirrors all KPI sheets in ishaan_excel.xlsx */
export function computeAllMonths(inputs: RawMonthlyInput[]): ComputedMonth[] {
  const results: ComputedMonth[] = [];
  const netBurnHistory: number[] = [];

  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const raw = computeRawDataRow(input, i);
    const prev = i > 0 ? results[i - 1] : null;

    const mrrArr = computeMrrArr(raw, input, input.activeSubscriptions, i, prev?.mrr ?? null);
    const customer = computeCustomerMetrics(
      input,
      raw,
      mrrArr,
      i,
      prev?.activeCustomers ?? null,
      prev?.mrr ?? null
    );
    const burn = computeBurnRunway(raw, input, mrrArr.netNewMrr, i, netBurnHistory);
    netBurnHistory.push(burn.netBurn);
    const team = computeTeamOps(raw, input, mrrArr.mrr, i, prev?.headcount ?? null);

    results.push({
      month: input.month,
      ...raw,
      ...mrrArr,
      ...customer,
      ...burn,
      ...team,
      activeCustomers: raw.totalActiveCustomers,
      newCustomers: raw.newCustomersAcquired,
      churnedCustomers: raw.customersChurned,
    });
  }

  return results;
}

export function computeFounderAnalytics(state: FounderAnalyticsState): ComputedMonth[] {
  return computeAllMonths(state.months);
}
