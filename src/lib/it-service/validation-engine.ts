import {
  evidenceForCalendarItem,
  findFocalCalendarItem,
  ymd,
} from "./compliance-utils";
import type { CalendarItem, EvidenceRecord } from "./types";

/** Validation engine: evidence completes only the linked (or current focal) period */
export function applyEvidenceValidation(
  calendar: CalendarItem[],
  evidence: EvidenceRecord[]
): CalendarItem[] {
  const today = ymd();

  return calendar.map((item) => {
    const approved = evidenceForCalendarItem(item, calendar, evidence);
    const pending = evidence.find(
      (e) =>
        e.complianceId === item.complianceId &&
        (e.calendarItemId === item.id ||
          (!e.calendarItemId &&
            findFocalCalendarItem(calendar, item.complianceId)?.id === item.id)) &&
        e.validationStatus === "pending"
    );

    if (approved) {
      return { ...item, status: "completed" as const };
    }
    if (pending) {
      return { ...item, status: "in_progress" as const };
    }
    if (item.dueDate < today && item.status !== "completed") {
      return { ...item, status: "overdue" as const };
    }
    if (item.status === "completed") {
      return item;
    }
    return { ...item, status: "pending" as const };
  });
}

export function validateUploadedEvidence(
  filename: string,
  mimeType: string
): { valid: boolean; status: "approved" | "pending" | "rejected" } {
  const allowed = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/png",
    "image/jpeg",
  ];
  const ext = filename.split(".").pop()?.toLowerCase();
  const allowedExt = ["pdf", "docx", "xlsx", "png", "jpg", "jpeg"];
  if (allowed.includes(mimeType) || (ext && allowedExt.includes(ext))) {
    return { valid: true, status: "approved" };
  }
  return { valid: false, status: "rejected" };
}
