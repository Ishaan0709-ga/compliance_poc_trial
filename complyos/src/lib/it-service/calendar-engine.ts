import { getCompliance } from "./master-data";
import type { CalendarItem, CompanyProfile } from "./types";

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

function monthLabel(d: Date) {
  return d.toLocaleString("en-IN", { month: "short", year: "numeric" });
}

function fyEndYear(profile: CompanyProfile, ref: Date): number {
  const fyStart = profile.financialYearStart - 1; // 0-indexed month
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

function dueFromLogic(
  profile: CompanyProfile,
  dueLogic: string,
  ref: Date
): Date | null {
  const next = new Date(ref.getFullYear(), ref.getMonth() + 1, 1);

  switch (dueLogic) {
    case "monthly_11th":
      return new Date(next.getFullYear(), next.getMonth(), 11);
    case "monthly_13th":
      return new Date(next.getFullYear(), next.getMonth(), 13);
    case "monthly_15th":
      return new Date(next.getFullYear(), next.getMonth(), 15);
    case "monthly_last_day":
      return new Date(next.getFullYear(), next.getMonth(), 0);
    case "quarterly_fy": {
      const qs = quarterMonths(profile.financialYearStart);
      const m = ref.getMonth();
      const qIdx = qs.findIndex((q) => q.includes(m));
      const endMonth = qs[qIdx >= 0 ? qIdx : 0][2];
      const year = m > endMonth ? ref.getFullYear() + 1 : ref.getFullYear();
      return new Date(year, endMonth, 28);
    }
    case "quarterly_end_31st": {
      const qEnd = new Date(ref.getFullYear(), ref.getMonth() + 3, 0);
      return new Date(qEnd.getFullYear(), qEnd.getMonth() + 1, 31);
    }
    case "annual_fy_end": {
      const fyEndMonth = (profile.financialYearStart + 11) % 12;
      const year = fyEndYear(profile, ref);
      return new Date(year, fyEndMonth, 30);
    }
    case "annual_sep_30": {
      const year = fyEndYear(profile, ref);
      return new Date(year, 8, 30);
    }
    case "annual_oct_30": {
      const year = fyEndYear(profile, ref);
      return new Date(year, 9, 30);
    }
    case "annual_oct_31": {
      const year = fyEndYear(profile, ref);
      return new Date(year, 9, 31);
    }
    case "event_based":
      return null;
    default:
      return new Date(next.getFullYear(), next.getMonth(), 15);
  }
}

/** Calendar engine: generate due dates from master frequency + due logic */
export function generateCalendar(
  profile: CompanyProfile,
  complianceIds: string[],
  from: Date = new Date(),
  months = 6
): CalendarItem[] {
  const items: CalendarItem[] = [];
  const today = ymd(from);

  for (const cid of complianceIds) {
    const c = getCompliance(cid);
    if (!c) continue;

    if (c.frequency === "Event Based") {
      const due = new Date(from.getFullYear(), from.getMonth() + 2, 15);
      items.push({
        id: `${cid}-event-${ymd(due)}`,
        companyId: profile.companyId,
        complianceId: cid,
        dueDate: ymd(due),
        period: "On demand",
        status: due < from ? "overdue" : "pending",
        owner: c.owner,
        riskLevel: c.riskLevel,
      });
      continue;
    }

    for (let i = 0; i < months; i++) {
      const m = new Date(from.getFullYear(), from.getMonth() + i, 1);
      let shouldAdd = false;

      switch (c.frequency) {
        case "Monthly":
          shouldAdd = true;
          break;
        case "Quarterly":
          shouldAdd = m.getMonth() % 3 === (profile.financialYearStart - 1) % 3;
          break;
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
      let status: CalendarItem["status"] = "pending";
      if (dueStr < today) status = "overdue";

      items.push({
        id: `${cid}-${period.replace(/\s/g, "-")}`,
        companyId: profile.companyId,
        complianceId: cid,
        dueDate: dueStr,
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
  const today = ymd(from);
  return calendar
    .filter((c) => c.status !== "completed")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, limit);
}
