import { getDefaultFounderAnalyticsState } from "./seed-data";
import type { FounderAnalyticsState, LegacyMonthlyRecord, RawMonthlyInput } from "./types";
import { MONTH_HEADERS } from "./types";

const STORAGE_KEY = "complyos-founder-analytics";
const SCHEMA_VERSION = 2;

type StoredState = FounderAnalyticsState & { schemaVersion?: number };

function isLegacyRecord(row: unknown): row is LegacyMonthlyRecord {
  return (
    typeof row === "object" &&
    row !== null &&
    "mrr" in row &&
    !("activeSubscriptions" in row)
  );
}

function migrateLegacyToRaw(legacy: LegacyMonthlyRecord, index: number): RawMonthlyInput {
  const seed = getDefaultFounderAnalyticsState().months[index];
  const month = (legacy.month as RawMonthlyInput["month"]) ?? seed.month;
  return {
    ...seed,
    month,
    activeSubscriptions: Math.round((legacy.mrr as number) / (seed.monthlySubscriptionCost || 5000)) || seed.activeSubscriptions,
    totalOperatingExpenses: (legacy.opex as number) ?? seed.totalOperatingExpenses,
    cashAndBankBalance: (legacy.cashBalance as number) ?? seed.cashAndBankBalance,
    headcount: (legacy.headcount as number) ?? seed.headcount,
    openRoles: (legacy.openRoles as number) ?? seed.openRoles,
    leadsGenerated: (legacy.leads as number) ?? seed.leadsGenerated,
    leadsQualified: (legacy.qualified as number) ?? seed.leadsQualified,
    demosCompleted: (legacy.demos as number) ?? seed.demosCompleted,
    dealsClosedWon: (legacy.closedWon as number) ?? seed.dealsClosedWon,
    npsScore: (legacy.nps as number) ?? seed.npsScore,
    newSubscriptionsStarted: (legacy.newCustomers as number) ?? seed.newSubscriptionsStarted,
    subscriptionsCancelled: (legacy.churnedCustomers as number) ?? seed.subscriptionsCancelled,
    salesMarketingSpend:
      (legacy.cac as number) != null && (legacy.newCustomers as number)
        ? (legacy.cac as number) * (legacy.newCustomers as number)
        : seed.salesMarketingSpend,
    totalActiveCustomers: index < 2 ? ((legacy.activeCustomers as number) ?? seed.totalActiveCustomers) : null,
    newCustomersAcquired: index < 2 ? ((legacy.newCustomers as number) ?? seed.newCustomersAcquired) : null,
    customersChurned: index < 2 ? ((legacy.churnedCustomers as number) ?? seed.customersChurned) : null,
  };
}

function normalizeState(parsed: StoredState): FounderAnalyticsState {
  if (parsed.schemaVersion === SCHEMA_VERSION && parsed.months?.length) {
    const first = parsed.months[0];
    if ("activeSubscriptions" in first) {
      return {
        reportingMonth: parsed.reportingMonth ?? "Jun-26",
        months: parsed.months as RawMonthlyInput[],
        compliance: parsed.compliance ?? getDefaultFounderAnalyticsState().compliance,
        updatedAt: parsed.updatedAt ?? new Date().toISOString(),
      };
    }
  }

  if (parsed.months?.length && isLegacyRecord(parsed.months[0])) {
    return {
      reportingMonth: (parsed.reportingMonth as FounderAnalyticsState["reportingMonth"]) ?? "Jun-26",
      months: (parsed.months as LegacyMonthlyRecord[]).map((m, i) => migrateLegacyToRaw(m, i)),
      compliance: parsed.compliance ?? getDefaultFounderAnalyticsState().compliance,
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  }

  return getDefaultFounderAnalyticsState();
}

export function loadFounderAnalytics(): FounderAnalyticsState {
  if (typeof window === "undefined") return getDefaultFounderAnalyticsState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultFounderAnalyticsState();
    const parsed = JSON.parse(raw) as StoredState;
    if (!parsed.months?.length) return getDefaultFounderAnalyticsState();
    const normalized = normalizeState(parsed);
    if (!MONTH_HEADERS.includes(normalized.reportingMonth)) {
      normalized.reportingMonth = "Jun-26";
    }
    return normalized;
  } catch {
    return getDefaultFounderAnalyticsState();
  }
}

export function saveFounderAnalytics(state: FounderAnalyticsState): FounderAnalyticsState {
  const next: StoredState = {
    ...state,
    schemaVersion: SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("founder-analytics-update"));
  }
  return next;
}

export function resetFounderAnalytics(): FounderAnalyticsState {
  const fresh = getDefaultFounderAnalyticsState();
  return saveFounderAnalytics(fresh);
}
