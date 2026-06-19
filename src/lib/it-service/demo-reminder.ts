import { ymd, parseYmd, daysBetween } from "./date-utils";
import type { ITServiceState } from "./types";

/** Due date exactly 10 days from today — triggers reminder_10d */
export function demoDueDateTenDaysFromToday(from: Date = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + 10);
  return ymd(d);
}

/** Pick best calendar row for WhatsApp demo (pending, not completed) */
export function pickDemoCalendarItem(state: ITServiceState) {
  const open = state.calendar.filter((c) => c.status !== "completed");
  return (
    open.find((c) => c.complianceId.startsWith("GOV")) ||
    open.find((c) => c.complianceId.startsWith("HR")) ||
    open[0]
  );
}

export function isTenDayReminderWindow(dueDate: string, from: Date = new Date()): boolean {
  return daysBetween(ymd(from), dueDate) === 10;
}

export function formatDueChip(dueDate: string): { day: number; month: string } {
  const d = parseYmd(dueDate);
  return {
    day: d.getDate(),
    month: d.toLocaleString("en-IN", { month: "short" }),
  };
}
