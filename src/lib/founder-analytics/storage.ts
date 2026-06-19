import { getDefaultFounderAnalyticsState } from "./seed-data";
import type { FounderAnalyticsState } from "./types";

const STORAGE_KEY = "complyos-founder-analytics";

export function loadFounderAnalytics(): FounderAnalyticsState {
  if (typeof window === "undefined") return getDefaultFounderAnalyticsState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultFounderAnalyticsState();
    const parsed = JSON.parse(raw) as FounderAnalyticsState;
    if (!parsed.months?.length) return getDefaultFounderAnalyticsState();
    return parsed;
  } catch {
    return getDefaultFounderAnalyticsState();
  }
}

export function saveFounderAnalytics(state: FounderAnalyticsState): FounderAnalyticsState {
  const next = { ...state, updatedAt: new Date().toISOString() };
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
