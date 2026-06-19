import { useServerFn } from "@tanstack/react-start";
import {
  sendExecutiveSummaryWhatsApp,
  sendWhatsAppBatch,
  type WhatsAppSendResult,
} from "./whatsapp.functions";

export type WhatsAppBatchPayload = {
  recipient: string;
  messages: {
    notificationId: string;
    message: string;
    complianceId?: string | null;
    messageType?: string;
  }[];
};

export type WhatsAppBatchSender = (
  args: { data: WhatsAppBatchPayload }
) => Promise<{ results: { notificationId: string; result: WhatsAppSendResult }[] }>;

/** TanStack Start server functions must be invoked via useServerFn from React. */
export function useWhatsAppActions() {
  const sendBatch = useServerFn(sendWhatsAppBatch);
  const sendExecutiveSummary = useServerFn(sendExecutiveSummaryWhatsApp);
  return { sendBatch, sendExecutiveSummary };
}
