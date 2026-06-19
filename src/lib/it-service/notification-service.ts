import { getCompliance } from "./master-data";
import { buildComplianceMessage } from "./notification-messages";
import { ymd, daysBetween } from "./date-utils";
import type {
  CalendarItem,
  NotificationRecord,
  NotificationType,
} from "./types";

const REMINDER_SCHEDULE: { type: NotificationType; daysBefore: number }[] = [
  { type: "reminder_10d", daysBefore: 10 },
  { type: "reminder_3d", daysBefore: 3 },
];

function isValidMobile(recipient: string): boolean {
  const digits = recipient.replace(/\D/g, "");
  return digits.length >= 10;
}

/** Generate daily WhatsApp queue — messages stay backend-only */
export function generateNotifications(
  calendar: CalendarItem[],
  recipientMobile: string,
  existing: NotificationRecord[] = [],
  opts: { whatsappEnabled?: boolean; notificationEnabled?: boolean } = {}
): NotificationRecord[] {
  if (opts.whatsappEnabled === false || opts.notificationEnabled === false) {
    return existing.filter((n) => n.status === "sent");
  }
  if (!isValidMobile(recipientMobile)) return [];

  const today = ymd(new Date());
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
      const notificationId = `N-${item.id}-${type}-${today}`;
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
        recipient: recipientMobile,
        notificationType: type,
        message: buildComplianceMessage(type, comp.name, item.dueDate),
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

    for (const { type, daysBefore } of REMINDER_SCHEDULE) {
      if (diff === daysBefore) push(type);
    }
  }

  return records;
}

export function getDispatchableNotifications(
  notifications: NotificationRecord[]
): NotificationRecord[] {
  return notifications
    .filter((n) => n.status === "pending" && isValidMobile(n.recipient))
    .sort((a, b) => {
      const priority = (t: NotificationType) =>
        t === "reminder_10d" ? 0 : t === "reminder_3d" ? 1 : t === "due_today" ? 2 : 3;
      return priority(a.notificationType) - priority(b.notificationType);
    });
}
