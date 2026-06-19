import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  to: z.string().min(10),
  message: z.string().min(1).max(4000),
  notificationId: z.string().optional(),
});

export type WhatsAppSendResult = {
  ok: boolean;
  demo: boolean;
  sid?: string;
  error?: string;
};

async function sendViaTwilio(to: string, message: string): Promise<WhatsAppSendResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (!accountSid || !authToken || !from) {
    return {
      ok: true,
      demo: true,
      error: "Twilio env vars not configured — TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM",
    };
  }

  let toWhatsApp = to.trim();
  if (!toWhatsApp.startsWith("whatsapp:")) {
    const digits = toWhatsApp.replace(/\D/g, "");
    const e164 =
      digits.length === 10
        ? `+91${digits}`
        : digits.startsWith("91") && digits.length === 12
          ? `+${digits}`
          : toWhatsApp.startsWith("+")
            ? toWhatsApp
            : `+${digits}`;
    toWhatsApp = `whatsapp:${e164}`;
  }

  const fromWhatsApp = from.startsWith("whatsapp:") ? from : `whatsapp:${from}`;

  const body = new URLSearchParams({
    To: toWhatsApp,
    From: fromWhatsApp,
    Body: message,
  });

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    }
  );

  const json = (await res.json()) as { sid?: string; message?: string };

  if (!res.ok) {
    return { ok: false, demo: false, error: json.message ?? `Twilio HTTP ${res.status}` };
  }

  return { ok: true, demo: false, sid: json.sid };
}

/** Send a single WhatsApp message via Twilio */
export const sendWhatsAppNotification = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => inputSchema.parse(d))
  .handler(async ({ data }) => {
    const result = await sendViaTwilio(data.to, data.message);
    if (result.demo) {
      console.info("[ComplyOS WhatsApp demo]", data.to.slice(0, 6) + "…", data.message.slice(0, 40) + "…");
    }
    return result;
  });

/** Batch-send compliance reminders or executive summary */
export const sendWhatsAppBatch = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        recipient: z.string().min(10),
        messages: z.array(
          z.object({
            notificationId: z.string(),
            message: z.string(),
            complianceId: z.string().optional().nullable(),
            messageType: z.string().optional(),
          })
        ),
      })
      .parse(d)
  )
  .handler(async ({ data }) => {
    const results: { notificationId: string; result: WhatsAppSendResult }[] = [];
    for (const item of data.messages.slice(0, 8)) {
      const result = await sendViaTwilio(data.recipient, item.message);
      results.push({ notificationId: item.notificationId, result });
    }
    return { results };
  });

/** Send executive summary to logged-in user's mobile */
export const sendExecutiveSummaryWhatsApp = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ recipient: z.string().min(10), message: z.string().min(1) }).parse(d)
  )
  .handler(async ({ data }) => {
    return sendViaTwilio(data.recipient, data.message);
  });
