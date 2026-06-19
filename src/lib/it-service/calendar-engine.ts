import { getCompliance } from "./master-data";
import { ymd } from "./date-utils";
import type { CalendarItem, CompanyProfile } from "./types";

function monthLabel(d: Date) {
  return d.toLocaleString("en-IN", { month: "short", year: "numeric" });
}

function fyEndYear(profile: CompanyProfile, ref: Date): number {
  const fyStart = profile.financialYearStart - 1;
  return ref.getMonth() >= fyStart ? ref.getFullYear() + 1 : ref.getFullYear();
}

function fyLabel(profile: CompanyProfile, ref: Date) {
  const end = fyEndYear(profile, ref);
  return `FY ${end - 1}-${String(end % 100).padStart(2, "0")}`;
}

function quarterMonths(fyStart: number): number[][] {
  const s = fyStart - 1;
  return [
    [s, (s + 1) % 12, (s + 2) % 12],
    [(s + 3) % 12, (s + 4) % 12, (s + 5) % 12],
    [(s + 6) % 12, (s + 7) % 12, (s + 8) % 12],
    [(s + 9) % 12, (s + 10) % 12, (s + 11) % 12],
  ];
}

/** Due date within the period month (ref), not pushed to next month */
function dueFromLogic(
  profile: CompanyProfile,
  dueLogic: string,
  ref: Date
): Date | null {
  const year = ref.getFullYear();
  const month = ref.getMonth();

  switch (dueLogic) {
    case "monthly_11th":
      return new Date(year, month, 11);
    case "monthly_7th":
      return new Date(year, month, 7);
    case "monthly_13th":
      return new Date(year, month, 13);
    case "monthly_15th":
      return new Date(year, month, 15);
    case "monthly_last_day":
      return new Date(year, month + 1, 0);
    case "quarterly_fy": {
      const qs = quarterMonths(profile.financialYearStart);
      const qIdx = qs.findIndex((q) => q.includes(month));
      const endMonth = qs[qIdx >= 0 ? qIdx : 0][2];
      const endYear = month > endMonth ? year + 1 : year;
      return new Date(endYear, endMonth, 28);
    }
    case "quarterly_end_31st": {
      const qEnd = new Date(year, month + 3, 0);
      return new Date(qEnd.getFullYear(), qEnd.getMonth(), Math.min(31, qEnd.getDate()));
    }
    case "annual_fy_end": {
      const fyEndMonth = (profile.financialYearStart + 11) % 12;
      const endYear = fyEndYear(profile, ref);
      return new Date(endYear, fyEndMonth, 30);
    }
    case "annual_sep_30": {
      return new Date(fyEndYear(profile, ref), 8, 30);
    }
    case "annual_oct_30": {
      return new Date(fyEndYear(profile, ref), 9, 30);
    }
    case "annual_oct_31": {
      return new Date(fyEndYear(profile, ref), 9, 31);
    }
    case "event_based":
      return null;
    default:
      return new Date(year, month, 15);
  }
}

/** Calendar engine: generate due dates from master frequency + due logic */
export function generateCalendar(
  profile: CompanyProfile,
  complianceIds: string[],
  from: Date = new Date(),
  months = 12,
  dueDateOverrides: Record<string, string> = {}
): CalendarItem[] {
  const items: CalendarItem[] = [];
  const today = ymd(from);
  const startMonth = new Date(from.getFullYear(), from.getMonth(), 1);

  for (const cid of complianceIds) {
    const c = getCompliance(cid);
    if (!c) continue;

    if (c.frequency === "Event Based") {
      const due = new Date(from);
      due.setDate(due.getDate() + 14);
      items.push({
        id: `${cid}-event-${ymd(due)}`,
        companyId: profile.companyId,
        complianceId: cid,
        dueDate: ymd(due),
        period: "On demand",
        status: ymd(due) < today ? "overdue" : "pending",
        owner: c.owner,
        riskLevel: c.riskLevel,
      });
      continue;
    }

    for (let i = 0; i < months; i++) {
      const m = new Date(startMonth.getFullYear(), startMonth.getMonth() + i, 1);
      let shouldAdd = false;

      switch (c.frequency) {
        case "Monthly":
          shouldAdd = true;
          break;
        case "Quarterly": {
          const qs = quarterMonths(profile.financialYearStart);
          shouldAdd = qs.some((q) => q[2] === m.getMonth());
          break;
        }
        case "Half-Yearly":
          shouldAdd = m.getMonth() % 6 === (profile.financialYearStart - 1) % 6;
          break;
        case "Annual":
          shouldAdd = m.getMonth() === (profile.financialYearStart + 11) % 12;
          break;
      }

      if (!shouldAdd) continue;

      const due = dueFromLogic(profile, c.dueLogic, m);
      if (!due) continue;

      const period =
        c.frequency === "Monthly"
          ? monthLabel(m)
          : c.frequency === "Annual"
            ? fyLabel(profile, m)
            : `Q${Math.floor(m.getMonth() / 3) + 1} ${m.getFullYear()}`;

      const dueStr = ymd(due);
      const itemId = `${cid}-${period.replace(/\s/g, "-")}`;
      const override = dueDateOverrides[itemId];
      const finalDue = override ?? dueStr;
      let status: CalendarItem["status"] = "pending";
      if (finalDue < today) status = "overdue";

      items.push({
        id: itemId,
        companyId: profile.companyId,
        complianceId: cid,
        dueDate: finalDue,
        systemDueDate: dueStr,
        period,
        status,
        owner: c.owner,
        riskLevel: c.riskLevel,
      });
    }
  }

  return items.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export function getUpcomingCalendar(
  calendar: CalendarItem[],
  limit = 8,
  from: Date = new Date()
): CalendarItem[] {
  return calendar
    .filter((c) => c.status !== "completed")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, limit);
}
