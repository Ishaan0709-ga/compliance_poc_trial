import { getCompliance } from "./master-data";
import { ymd, daysBetween, formatDateLabel } from "./date-utils";
import type {
  CalendarItem,
  CompanyProfile,
  NotificationRecord,
  NotificationType,
} from "./types";

const REMINDER_WINDOWS: { type: NotificationType; daysBefore: number }[] = [
  { type: "reminder_10d", daysBefore: 10 },
  { type: "reminder_3d", daysBefore: 3 },
];

function buildMessage(
  type: NotificationType,
  complianceName: string,
  dueDate: string,
  daysUntil?: number
): string {
  const label = formatDateLabel(dueDate);
  switch (type) {
    case "reminder_10d":
      return `🔔 ComplyOS: "${complianceName}" is due in ${daysUntil ?? 10} days (${label}). Please prepare evidence.`;
    case "reminder_3d":
      return `⚠️ ComplyOS: "${complianceName}" due in 3 days (${label}). Action required.`;
    case "due_today":
      return `🚨 ComplyOS: "${complianceName}" is due TODAY. Upload evidence now.`;
    case "overdue":
      return `❗ ComplyOS: "${complianceName}" is OVERDUE (was due ${label}). Immediate action needed.`;
    default:
      return `ComplyOS: ${complianceName} — ${label}`;
  }
}

/** Generate WhatsApp reminders — triggers at 10 days, 3 days, due today, overdue */
export function generateNotifications(
  profile: CompanyProfile,
  calendar: CalendarItem[],
  existing: NotificationRecord[] = []
): NotificationRecord[] {
  const today = ymd(new Date());
  const recipient = profile.primaryContact || "";
  const sentIds = new Set(
    existing.filter((n) => n.status === "sent").map((n) => n.notificationId)
  );
  const records: NotificationRecord[] = [];

  for (const item of calendar) {
    if (item.status === "completed") continue;
    const comp = getCompliance(item.complianceId);
    if (!comp) continue;

    const diff = daysBetween(today, item.dueDate);

    const push = (type: NotificationType) => {
      const notificationId = `N-${item.id}-${type}`;
      if (sentIds.has(notificationId)) {
        const prev = existing.find((n) => n.notificationId === notificationId);
        if (prev) {
          records.push(prev);
          return;
        }
      }
      records.push({
        notificationId,
        complianceId: item.complianceId,
        dueDate: item.dueDate,
        recipient,
        notificationType: type,
        message: buildMessage(type, comp.name, item.dueDate, diff > 0 ? diff : undefined),
        sentAt: sentIds.has(notificationId)
          ? existing.find((n) => n.notificationId === notificationId)?.sentAt ?? null
          : null,
        status: sentIds.has(notificationId) ? "sent" : "pending",
        channel: "whatsapp",
      });
    };

    if (item.status === "overdue" || diff < 0) {
      push("overdue");
      continue;
    }

    if (diff === 0) {
      push("due_today");
      continue;
    }

    for (const { type, daysBefore } of REMINDER_WINDOWS) {
      if (type === "reminder_10d" && diff > 0 && diff <= daysBefore) {
        push(type);
      } else if (type !== "reminder_10d" && diff === daysBefore) {
        push(type);
      }
    }
  }

  return records;
}

/** Notifications ready to auto-send (10-day window priority) */
export function getDispatchableNotifications(
  notifications: NotificationRecord[]
): NotificationRecord[] {
  return notifications
    .filter((n) => n.status === "pending" && n.recipient.length >= 10)
    .sort((a, b) => {
      const priority = (t: NotificationType) =>
        t === "reminder_10d" ? 0 : t === "reminder_3d" ? 1 : t === "due_today" ? 2 : 3;
      return priority(a.notificationType) - priority(b.notificationType);
    });
}
