import { getCompliance } from "./master-data";
import type {
  CalendarItem,
  CompanyProfile,
  NotificationRecord,
  NotificationType,
} from "./types";

const REMINDER_DAYS: { type: NotificationType; daysBefore: number }[] = [
  { type: "reminder_7d", daysBefore: 7 },
  { type: "reminder_3d", daysBefore: 3 },
];

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string): number {
  const a = new Date(from + "T00:00:00");
  const b = new Date(to + "T00:00:00");
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function formatDateLabel(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long" });
}

function buildMessage(
  type: NotificationType,
  complianceName: string,
  dueDate: string
): string {
  const label = formatDateLabel(dueDate);
  switch (type) {
    case "reminder_7d":
      return `Reminder: ${complianceName} due on ${label}.`;
    case "reminder_3d":
      return `Reminder: ${complianceName} due in 3 days.`;
    case "due_today":
      return `Compliance due today: ${complianceName}.`;
    case "overdue":
      return `Compliance overdue: ${complianceName} was due on ${label}.`;
    default:
      return `${complianceName} — ${label}`;
  }
}

/**
 * WhatsApp notification framework (architecture only — does not send messages).
 * Future targets: Twilio WhatsApp API, Meta WhatsApp Cloud API.
 */
export function generateNotifications(
  profile: CompanyProfile,
  calendar: CalendarItem[]
): NotificationRecord[] {
  const today = ymd(new Date());
  const recipient = profile.primaryContact || "pending";
  const records: NotificationRecord[] = [];

  for (const item of calendar) {
    if (item.status === "completed") continue;
    const comp = getCompliance(item.complianceId);
    if (!comp) continue;

    const diff = daysBetween(today, item.dueDate);

    if (item.status === "overdue" || diff < 0) {
      records.push({
        notificationId: `N-${item.id}-overdue`,
        complianceId: item.complianceId,
        dueDate: item.dueDate,
        recipient,
        notificationType: "overdue",
        message: buildMessage("overdue", comp.name, item.dueDate),
        sentAt: null,
        status: "pending",
        channel: "whatsapp",
      });
      continue;
    }

    if (diff === 0) {
      records.push({
        notificationId: `N-${item.id}-due`,
        complianceId: item.complianceId,
        dueDate: item.dueDate,
        recipient,
        notificationType: "due_today",
        message: buildMessage("due_today", comp.name, item.dueDate),
        sentAt: null,
        status: "pending",
        channel: "whatsapp",
      });
      continue;
    }

    for (const { type, daysBefore } of REMINDER_DAYS) {
      if (diff === daysBefore) {
        records.push({
          notificationId: `N-${item.id}-${type}`,
          complianceId: item.complianceId,
          dueDate: item.dueDate,
          recipient,
          notificationType: type,
          message: buildMessage(type, comp.name, item.dueDate),
          sentAt: null,
          status: "pending",
          channel: "whatsapp",
        });
      }
    }
  }

  return records;
}

/** Placeholder for future Twilio / Meta WhatsApp dispatch */
export async function dispatchWhatsAppNotification(
  _record: NotificationRecord
): Promise<{ ok: false; reason: string }> {
  return { ok: false, reason: "WhatsApp dispatch not configured — architecture only" };
}
