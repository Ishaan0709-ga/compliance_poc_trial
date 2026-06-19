import { ymd } from "./date-utils";
import type { CalendarItem, EvidenceRecord } from "./types";

const SCORE_ON_TIME = 100;
const SCORE_LATE = 70;
const SCORE_MISSING = 0;

export { ymd };

/** Current open period for a compliance — overdue first, then nearest pending */
export function findFocalCalendarItem(
  calendar: CalendarItem[],
  complianceId: string
): CalendarItem | undefined {
  const items = calendar
    .filter((c) => c.complianceId === complianceId)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  if (items.length === 0) return undefined;

  const open = items.filter((i) => i.status !== "completed");
  const overdue = open.filter((i) => i.status === "overdue");
  if (overdue.length > 0) return overdue[0];
  if (open.length > 0) return open[0];
  return items[items.length - 1];
}

export function hasApprovedEvidence(
  complianceId: string,
  evidence: EvidenceRecord[]
): boolean {
  return evidence.some(
    (e) => e.complianceId === complianceId && e.validationStatus === "approved"
  );
}

/** Approved evidence that applies to a specific calendar row */
export function evidenceForCalendarItem(
  item: CalendarItem,
  calendar: CalendarItem[],
  evidence: EvidenceRecord[]
): EvidenceRecord | undefined {
  const linked = evidence.find(
    (e) =>
      e.calendarItemId === item.id &&
      e.complianceId === item.complianceId &&
      e.validationStatus === "approved"
  );
  if (linked) return linked;

  const focal = findFocalCalendarItem(calendar, item.complianceId);
  if (focal?.id !== item.id) return undefined;

  return evidence.find(
    (e) =>
      e.complianceId === item.complianceId &&
      !e.calendarItemId &&
      e.validationStatus === "approved"
  );
}

/**
 * PPT scoring — one score per compliance (not per calendar row).
 * No evidence → 0. Evidence on time → 100. Late → 70.
 */
export function scoreCompliance(
  complianceId: string,
  calendar: CalendarItem[],
  evidence: EvidenceRecord[],
  today: string = ymd()
): { score: number; status: CalendarItem["status"] } {
  const approved = evidence.filter(
    (e) => e.complianceId === complianceId && e.validationStatus === "approved"
  );

  if (approved.length === 0) {
    const items = calendar.filter((c) => c.complianceId === complianceId);
    const anyOverdue = items.some(
      (i) => i.status === "overdue" || (i.dueDate < today && i.status !== "completed")
    );
    return { score: SCORE_MISSING, status: anyOverdue ? "overdue" : "pending" };
  }

  const focal = findFocalCalendarItem(calendar, complianceId);
  const ev =
    approved.find((e) => e.calendarItemId === focal?.id) ||
    approved.find((e) => !e.calendarItemId) ||
    approved[0];

  if (!focal) {
    return { score: SCORE_ON_TIME, status: "completed" };
  }

  const uploadedOn = ev.uploadedAt.slice(0, 10);
  const wasLate = uploadedOn > focal.dueDate && focal.dueDate < today;

  if (focal.status === "overdue" && !wasLate) {
    return { score: SCORE_LATE, status: "completed" };
  }
  if (wasLate) {
    return { score: SCORE_LATE, status: "completed" };
  }
  return { score: SCORE_ON_TIME, status: "completed" };
}

export { SCORE_ON_TIME, SCORE_LATE, SCORE_MISSING };
