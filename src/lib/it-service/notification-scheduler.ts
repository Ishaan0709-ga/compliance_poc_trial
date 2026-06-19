import { sendWhatsAppBatch } from "./whatsapp.functions";
import { getDispatchableNotifications, generateNotifications } from "./notification-service";
import { ymd } from "./date-utils";
import type {
  DeliveryStatus,
  ITServiceState,
  NotificationHistoryRecord,
} from "./types";

export type SchedulerResult = {
  dispatched: number;
  history: NotificationHistoryRecord[];
  sentNotificationIds: string[];
};

/** Daily scheduler — runs once per calendar day, silent backend dispatch */
export async function runDailyNotificationScheduler(
  state: ITServiceState,
  userId: string,
  mobileNumber: string
): Promise<SchedulerResult | null> {
  const today = ymd(new Date());
  if (state.lastNotificationRunDate === today) return null;
  if (state.profile?.whatsappEnabled === false) return null;
  if (state.profile?.notificationEnabled === false) return null;
  if (!mobileNumber || mobileNumber.replace(/\D/g, "").length < 10) return null;

  const notifications = generateNotifications(
    state.calendar,
    mobileNumber,
    state.notifications,
    {
      whatsappEnabled: state.profile?.whatsappEnabled,
      notificationEnabled: state.profile?.notificationEnabled,
    }
  );

  const pending = getDispatchableNotifications(notifications);
  if (pending.length === 0) {
    return { dispatched: 0, history: [], sentNotificationIds: [] };
  }

  const result = await sendWhatsAppBatch({
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

  for (const r of result.results) {
    const item = pending.find((p) => p.notificationId === r.notificationId);
    if (!item) continue;

    const deliveryStatus: DeliveryStatus = r.result.ok
      ? r.result.demo
        ? "queued"
        : "delivered"
      : "failed";

    if (r.result.ok) sentNotificationIds.push(r.notificationId);

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

  return {
    dispatched: sentNotificationIds.length,
    history,
    sentNotificationIds,
  };
}
