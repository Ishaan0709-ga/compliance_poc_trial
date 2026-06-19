import type { CalendarItem, CalendarStatus } from "./types";

export const STATUS_STYLES: Record<
  CalendarStatus | "event",
  { pill: string; dot: string; label: string }
> = {
  completed: {
    pill: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-500",
    label: "Completed",
  },
  in_progress: {
    pill: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
    label: "In Progress",
  },
  pending: {
    pill: "bg-sky-50 text-sky-800 border-sky-200",
    dot: "bg-sky-500",
    label: "Pending",
  },
  overdue: {
    pill: "bg-rose-50 text-rose-800 border-rose-200",
    dot: "bg-rose-500",
    label: "Overdue",
  },
  event: {
    pill: "bg-violet-50 text-violet-800 border-violet-200",
    dot: "bg-violet-500",
    label: "Event Based",
  },
};

export function chipClass(item: CalendarItem, frequency?: string): string {
  const base = "truncate rounded-md border px-1.5 py-0.5 text-[9px] font-bold leading-tight";
  if (frequency === "Event Based") return `${base} ${STATUS_STYLES.event.pill}`;
  const key = item.status in STATUS_STYLES ? item.status : "pending";
  return `${base} ${STATUS_STYLES[key as CalendarStatus].pill}`;
}

export function buildMonthGrid(year: number, month: number, items: CalendarItem[]) {
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: { date: Date | null; items: CalendarItem[] }[] = [];
  for (let i = 0; i < startPad; i++) cells.push({ date: null, items: [] });
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const key = date.toISOString().slice(0, 10);
    cells.push({ date, items: items.filter((i) => i.dueDate === key) });
  }
  return cells;
}

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
