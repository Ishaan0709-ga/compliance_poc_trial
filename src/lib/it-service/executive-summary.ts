import { getCompliance } from "./master-data";
import { buildExecutiveSummaryMessage } from "./notification-messages";
import { getUpcomingCalendar } from "./calendar-engine";
import type { ITServiceState } from "./types";

export interface ExecutiveSummaryData {
  overallScore: number;
  overdue: string[];
  upcoming: string[];
  criticalItems: number;
  pendingItems: number;
  recentActivity: string[];
  whatsappText: string;
}

export function buildExecutiveSummary(state: ITServiceState): ExecutiveSummaryData {
  const overdue = state.calendar
    .filter((c) => c.status === "overdue")
    .slice(0, 8)
    .map((c) => getCompliance(c.complianceId)?.name ?? c.complianceId);

  const upcoming = getUpcomingCalendar(state.calendar, 6)
    .filter((c) => c.status !== "overdue")
    .map((c) => getCompliance(c.complianceId)?.name ?? c.complianceId);

  const criticalItems = state.calendar.filter(
    (c) =>
      c.riskLevel === "Critical" &&
      c.status !== "completed"
  ).length;

  const pendingItems = state.calendar.filter(
    (c) => c.status === "pending" || c.status === "in_progress"
  ).length;

  const recentActivity = state.recentActivity.slice(0, 5).map((a) => a.title);

  const base = {
    overallScore: state.kpis.overallScore,
    overdue,
    upcoming,
    criticalItems,
    pendingItems,
    recentActivity,
  };

  return {
    ...base,
    whatsappText: buildExecutiveSummaryMessage(base),
  };
}
