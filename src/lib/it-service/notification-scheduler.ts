import { generateNotifications, getDispatchableNotifications } from "./notification-service";
import type { WhatsAppBatchSender } from "./use-whatsapp-actions";
import { ymd } from "./date-utils";
import {
  demoDueDateTenDaysFromToday,
  isTenDayReminderWindow,
  pickDemoCalendarItem,
} from "./demo-reminder";
import type {
  DeliveryStatus,
  ITServiceState,
  NotificationHistoryRecord,
} from "./types";

export type SchedulerResult = {
  dispatched: number;
  history: NotificationHistoryRecord[];
  sentNotificationIds: string[];
  error?: string;
};

async function dispatchPending(
  sendBatch: WhatsAppBatchSender,
  mobileNumber: string,
  userId: string,
  pending: ReturnType<typeof getDispatchableNotifications>
): Promise<SchedulerResult> {
  if (pending.length === 0) {
    return { dispatched: 0, history: [], sentNotificationIds: [] };
  }

  const result = await sendBatch({
    data: {
      recipient: mobileNumber,
      messages: pending.slice(0, 8).map((n) => ({
        notificationId: n.notificationId,
        message: n.message,
        complianceId: n.complianceId,
        messageType: n.notificationType,
      })),
    },
  });

  const history: NotificationHistoryRecord[] = [];
  const sentNotificationIds: string[] = [];
  const sentAt = new Date().toISOString();
  let error: string | undefined;

  for (const r of result.results) {
    const item = pending.find((p) => p.notificationId === r.notificationId);
    if (!item) continue;

    if (!r.result.ok && r.result.error) error = r.result.error;

    const deliveryStatus: DeliveryStatus = r.result.ok
      ? r.result.demo
        ? "queued"
        : "delivered"
      : "failed";

    if (r.result.ok && !r.result.demo) sentNotificationIds.push(r.notificationId);

    history.push({
      notificationId: item.notificationId,
      userId,
      complianceId: item.complianceId,
      recipientNumber: mobileNumber,
      messageType: item.notificationType,
      messageBody: item.message,
      sentAt,
      deliveryStatus,
      twilioMessageSid: r.result.sid ?? null,
    });
  }

  return { dispatched: sentNotificationIds.length, history, sentNotificationIds, error };
}

/** Daily scheduler — silent, backend only */
export async function runDailyNotificationScheduler(
  sendBatch: WhatsAppBatchSender,
  state: ITServiceState,
  userId: string,
  mobileNumber: string,
  force = false
): Promise<SchedulerResult | null> {
  const today = ymd(new Date());
  if (!force && state.lastNotificationRunDate === today) return null;
  if (state.profile?.whatsappEnabled === false) return null;
  if (state.profile?.notificationEnabled === false) return null;
  if (!mobileNumber || mobileNumber.replace(/\D/g, "").length < 10) return null;

  const notifications = generateNotifications(state.calendar, mobileNumber, [], {
    whatsappEnabled: state.profile?.whatsappEnabled,
    notificationEnabled: state.profile?.notificationEnabled,
  });

  return dispatchPending(
    sendBatch,
    mobileNumber,
    userId,
    getDispatchableNotifications(notifications)
  );
}

/**
 * Demo: ensure 10-day window item exists, then send WhatsApp.
 * Never exposes message body in UI.
 */
export async function runWhatsAppDemo(
  sendBatch: WhatsAppBatchSender,
  state: ITServiceState,
  userId: string,
  mobileNumber: string,
  calendarAfterDueDateSet: ITServiceState
): Promise<SchedulerResult & { demoDueDate: string }> {
  const demoDue = demoDueDateTenDaysFromToday();
  const target = pickDemoCalendarItem(state);

  let working = calendarAfterDueDateSet;

  const hasWindow = working.calendar.some(
    (c) => c.status !== "completed" && isTenDayReminderWindow(c.dueDate)
  );

  if (!hasWindow && target) {
    working = {
      ...working,
      calendar: working.calendar.map((c) =>
        c.id === target.id
          ? { ...c, dueDate: demoDue, systemDueDate: c.systemDueDate ?? c.dueDate }
          : c
      ),
    };
  }

  let notifications = generateNotifications(working.calendar, mobileNumber, [], {
    whatsappEnabled: true,
    notificationEnabled: true,
  });

  let pending = getDispatchableNotifications(notifications);

  if (pending.length === 0 && target) {
    const item = working.calendar.find(
      (c) => c.complianceId === target.complianceId && c.status !== "completed"
    );
    if (item) {
      notifications = generateNotifications(
        working.calendar.map((c) =>
          c.id === item.id ? { ...c, dueDate: demoDue } : c
        ),
        mobileNumber,
        [],
        { whatsappEnabled: true, notificationEnabled: true }
      );
      pending = getDispatchableNotifications(notifications).slice(0, 1);
    }
  }

  const result = await dispatchPending(sendBatch, mobileNumber, userId, pending);
  return { ...result, demoDueDate: demoDue };
}
