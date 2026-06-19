import { sendWhatsAppBatch } from "./whatsapp.functions";
import { getDispatchableNotifications } from "./notification-service";
import type { CompanyProfile, NotificationRecord } from "./types";

export type AutoWhatsAppResult = {
  sent: number;
  demo: boolean;
  messages: string[];
  sentIds: string[];
  error?: string;
};

const SESSION_KEY = "complyos-wa-auto-session";

function sessionFlag(id: string): string {
  return `${SESSION_KEY}-${id}`;
}

/** Auto-dispatch pending WhatsApp reminders (10-day / 3-day / due today) */
export async function autoDispatchWhatsApp(
  profile: CompanyProfile | null,
  notifications: NotificationRecord[]
): Promise<AutoWhatsAppResult> {
  if (!profile?.primaryContact) {
    return { sent: 0, demo: true, messages: [], sentIds: [], error: "No primary contact on profile" };
  }

  const pending = getDispatchableNotifications(notifications).filter(
    (n) => !sessionStorage.getItem(sessionFlag(n.notificationId))
  );

  if (pending.length === 0) {
    return { sent: 0, demo: true, messages: [], sentIds: [] };
  }

  const batch = pending.slice(0, 5);
  try {
    const result = await sendWhatsAppBatch({
      data: {
        recipient: profile.primaryContact,
        messages: batch.map((n) => ({
          notificationId: n.notificationId,
          message: n.message,
        })),
      },
    });

    const sentIds: string[] = [];
    const messages: string[] = [];
    let demo = false;

    for (const r of result.results) {
      if (r.result.ok) {
        sentIds.push(r.notificationId);
        const msg = batch.find((b) => b.notificationId === r.notificationId);
        if (msg) messages.push(msg.message);
        if (r.result.demo) demo = true;
        sessionStorage.setItem(sessionFlag(r.notificationId), new Date().toISOString());
      }
    }

    return { sent: sentIds.length, demo, messages, sentIds };
  } catch (e) {
    return {
      sent: 0,
      demo: true,
      messages: [],
      sentIds: [],
      error: e instanceof Error ? e.message : "WhatsApp dispatch failed",
    };
  }
}
