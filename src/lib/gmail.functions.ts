import { createServerFn } from "@tanstack/react-start";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";
const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

interface InvoiceHit {
  id: string;
  from: string;
  subject: string;
  date: string;
  snippet: string;
  amount?: string;
  currency?: string;
  invoiceDate?: string;
  vendor: string;
  source: "ai-pdf" | "text" | "none";
}

function header(headers: Array<{ name: string; value: string }>, name: string) {
  return headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";
}

function parseAmountText(text: string): { amount?: string; currency?: string } {
  const prefixed = text.match(/(₹|INR|Rs\.?|USD|\$|EUR|€|GBP|£)\s?([\d,]+(?:\.\d{1,2})?)/i);
  if (prefixed) return { amount: prefixed[2].replace(/,/g, ""), currency: normCurrency(prefixed[1]) };
  const suffixed = text.match(/([\d,]+(?:\.\d{1,2})?)\s?(INR|USD|EUR|GBP|Rs\.?)/i);
  if (suffixed) return { amount: suffixed[1].replace(/,/g, ""), currency: normCurrency(suffixed[2]) };
  const labeled = text.match(/(?:total|amount(?:\s+due)?|grand\s+total|balance|due)[^\d\n]{0,12}([\d,]+(?:\.\d{1,2})?)/i);
  if (labeled) return { amount: labeled[1].replace(/,/g, "") };
  return {};
}

function normCurrency(s: string): string {
  const v = s.toUpperCase().replace(/\./g, "");
  if (v === "₹" || v === "RS" || v === "INR") return "INR";
  if (v === "$" || v === "USD") return "USD";
  if (v === "€" || v === "EUR") return "EUR";
  if (v === "£" || v === "GBP") return "GBP";
  return "INR";
}

function decodeBody(payload: any): string {
  const parts: string[] = [];
  function walk(p: any) {
    if (!p) return;
    if (p.body?.data) {
      try {
        const b64 = String(p.body.data).replace(/-/g, "+").replace(/_/g, "/");
        parts.push(atob(b64));
      } catch {}
    }
    if (Array.isArray(p.parts)) p.parts.forEach(walk);
  }
  walk(payload);
  return parts.join("\n").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ");
}

function findPdfAttachments(payload: any): Array<{ attachmentId: string; filename: string; mimeType: string }> {
  const out: Array<{ attachmentId: string; filename: string; mimeType: string }> = [];
  function walk(p: any) {
    if (!p) return;
    const mt = String(p.mimeType || "");
    const fn = String(p.filename || "");
    if (p.body?.attachmentId && (mt === "application/pdf" || /\.pdf$/i.test(fn))) {
      out.push({ attachmentId: p.body.attachmentId, filename: fn, mimeType: mt || "application/pdf" });
    }
    if (Array.isArray(p.parts)) p.parts.forEach(walk);
  }
  walk(payload);
  return out;
}

async function extractFromPdfWithAI(
  pdfB64: string,
  filename: string,
  apiKey: string,
): Promise<{ amount?: string; currency?: string; invoiceDate?: string; vendor?: string } | null> {
  const prompt = `Extract invoice details from this PDF. Return STRICT JSON only, no prose:
{"amount":"<numeric total, no commas>","currency":"INR|USD|EUR|GBP","invoice_date":"YYYY-MM-DD","vendor":"<billing party name>"}
If unknown, use null. The total is the final payable / grand total amount.`;
  const body = {
    model: "google/gemini-2.5-flash",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "file", file: { filename, file_data: `data:application/pdf;base64,${pdfB64}` } },
        ],
      },
    ],
  };
  const r = await fetch(AI_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const t = await r.text();
    console.error("[AI] pdf extract failed", r.status, t.slice(0, 300));
    return null;
  }
  const data: any = await r.json();
  const txt = String(data?.choices?.[0]?.message?.content ?? "");
  const m = txt.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    const parsed = JSON.parse(m[0]);
    return {
      amount: parsed.amount != null ? String(parsed.amount).replace(/,/g, "") : undefined,
      currency: parsed.currency ? normCurrency(String(parsed.currency)) : undefined,
      invoiceDate: parsed.invoice_date ?? undefined,
      vendor: parsed.vendor ?? undefined,
    };
  } catch {
    return null;
  }
}

export const scanGmailInvoices = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    const GOOGLE_MAIL_API_KEY = process.env.GOOGLE_MAIL_API_KEY;
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!GOOGLE_MAIL_API_KEY) throw new Error("Gmail not connected");

    const headers = {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": GOOGLE_MAIL_API_KEY,
    };

    const q = encodeURIComponent(
      'newer_than:90d (subject:(invoice OR bill OR receipt OR "tax invoice" OR payment) OR has:attachment filename:pdf invoice)'
    );
    const listRes = await fetch(`${GATEWAY_URL}/users/me/messages?maxResults=20&q=${q}`, { headers });
    if (!listRes.ok) throw new Error(`Gmail list failed [${listRes.status}]: ${await listRes.text()}`);
    const list = (await listRes.json()) as { messages?: Array<{ id: string }> };
    const ids = (list.messages ?? []).slice(0, 15);

    const results: InvoiceHit[] = [];
    for (const { id } of ids) {
      const r = await fetch(`${GATEWAY_URL}/users/me/messages/${id}?format=full`, { headers });
      if (!r.ok) continue;
      const msg = (await r.json()) as {
        id: string;
        snippet: string;
        payload: { headers: Array<{ name: string; value: string }>; body?: any; parts?: any };
      };
      const from = header(msg.payload.headers, "From");
      const subject = header(msg.payload.headers, "Subject");
      const date = header(msg.payload.headers, "Date");
      const body = decodeBody(msg.payload);

      let amount: string | undefined;
      let currency: string | undefined;
      let invoiceDate: string | undefined;
      let aiVendor: string | undefined;
      let source: InvoiceHit["source"] = "none";

      // 1) Try PDF attachment via AI
      const pdfs = findPdfAttachments(msg.payload);
      if (pdfs.length > 0) {
        const att = pdfs[0];
        try {
          const ar = await fetch(
            `${GATEWAY_URL}/users/me/messages/${id}/attachments/${att.attachmentId}`,
            { headers },
          );
          if (ar.ok) {
            const aj = (await ar.json()) as { data?: string; size?: number };
            if (aj.data) {
              const b64 = aj.data.replace(/-/g, "+").replace(/_/g, "/");
              const extracted = await extractFromPdfWithAI(b64, att.filename || "invoice.pdf", LOVABLE_API_KEY);
              if (extracted) {
                amount = extracted.amount;
                currency = extracted.currency;
                invoiceDate = extracted.invoiceDate;
                aiVendor = extracted.vendor;
                if (amount) source = "ai-pdf";
              }
            }
          } else {
            console.error("[scanGmail] attachment fetch failed", ar.status);
          }
        } catch (e: any) {
          console.error("[scanGmail] pdf extract err", e?.message);
        }
      }

      // 2) Fallback to text parsing
      if (!amount) {
        const t = parseAmountText(`${subject}\n${msg.snippet}\n${body}`);
        if (t.amount) {
          amount = t.amount;
          currency = currency ?? t.currency;
          source = "text";
        }
      }

      results.push({
        id: msg.id,
        from,
        subject,
        date,
        snippet: msg.snippet,
        amount,
        currency,
        invoiceDate,
        vendor: aiVendor || vendorFromAddr(from),
        source,
      });
    }
    return { count: results.length, items: results };
  } catch (e: any) {
    console.error("[scanGmail] error", e?.message, e?.stack);
    throw new Error(`scanGmail failed: ${e?.message ?? String(e)}`);
  }
});

function vendorFromAddr(from: string): string {
  const m = from.match(/^"?([^"<]+?)"?\s*</);
  return (m?.[1] || from.split("@")[0] || from).trim();
}
