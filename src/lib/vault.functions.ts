import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const API_URL = "https://connector-gateway.lovable.dev";
const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const DOC_TYPES = [
  "Certificate of Incorporation (CIN)",
  "Memorandum of Association (MoA)",
  "Articles of Association (AoA)",
  "Share Certificate",
  "Board Resolution",
  "Authorization Letter",
  "PAN Card",
  "TAN Allotment Letter",
  "GST Registration Certificate",
  "GSTR-1 / GSTR-3B Return",
  "Income Tax Return (ITR)",
  "Form 16 / Form 16A",
  "DPIIT / Startup India Recognition",
  "DIN Allotment Letter",
  "Director KYC (DIR-3)",
  "Employment Agreement",
  "NDA / Confidentiality Agreement",
  "SAFE / SHA / SSA",
  "Term Sheet",
  "Cap Table",
  "Bank Statement",
  "Invoice / Bill",
  "Salary Slip",
  "Lease / Rent Agreement",
  "Other",
] as const;

const CATEGORIES = [
  "Incorporation",
  "ROC / MCA",
  "GST",
  "Income Tax",
  "Funding & Equity",
  "Contracts",
  "HR & Payroll",
  "Bank statements",
  "Other",
] as const;

function s3KeyFor(userId: string, fileName: string) {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `vault/${userId}/${Date.now()}_${safe}`;
}

async function signStorageUrl(mode: "read" | "write", objectPath: string) {
  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY!;
  const AWS_S3_API_KEY = process.env.AWS_S3_API_KEY!;
  const r = await fetch(`${API_URL}/api/v1/sign_storage_url?provider=aws_s3&mode=${mode}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": AWS_S3_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ object_path: objectPath }),
  });
  if (!r.ok) throw new Error(`Sign ${mode} failed [${r.status}]: ${await r.text()}`);
  return r.json() as Promise<{ url: string; expires_in?: number; method?: string }>;
}

async function classifyFromName(fileName: string, mimeType: string) {
  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
  const fallback = { doc_type: "Other", category: "Other", confidence: 0.3, summary: "" };
  if (!LOVABLE_API_KEY) return fallback;

  const sys = `You classify Indian startup company documents from filename + mime alone.
Return STRICT JSON with keys: doc_type, category, confidence (0-1), summary (<=140 chars).
doc_type MUST be one of: ${DOC_TYPES.join(" | ")}.
category MUST be one of: ${CATEGORIES.join(" | ")}.
Map: CIN/Incorporation -> Incorporation; MoA/AoA -> Incorporation; Share certificate/Cap table/SAFE/SHA/Term sheet -> Funding & Equity; GST returns/registration -> GST; ITR/Form 16 -> Income Tax; Lease/NDA/Employment -> Contracts; Salary slip -> HR & Payroll; Bank statement -> Bank statements; Board Resolution/DIN/DIR-3/Authorization Letter/DPIIT -> ROC / MCA.`;

  try {
    const r = await fetch(AI_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: `Filename: ${fileName}\nMime: ${mimeType}\nReturn only JSON.` },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!r.ok) return fallback;
    const j = await r.json();
    const txt = j?.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(txt);
    return {
      doc_type: DOC_TYPES.includes(parsed.doc_type) ? parsed.doc_type : "Other",
      category: CATEGORIES.includes(parsed.category) ? parsed.category : "Other",
      confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0.5)),
      summary: String(parsed.summary || "").slice(0, 200),
    };
  } catch {
    return fallback;
  }
}

export const getVaultUploadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { fileName: string; mimeType: string; size: number }) =>
    z.object({
      fileName: z.string().min(1).max(255),
      mimeType: z.string().min(1).max(120),
      size: z.number().min(1).max(50 * 1024 * 1024),
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const userId = (context as any).userId as string;
    const key = s3KeyFor(userId, data.fileName);
    const j = await signStorageUrl("write", key);
    return { upload_url: j.url as string, method: (j.method as string) || "PUT", s3_key: key };
  });

export const uploadVaultDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => {
    if (!(data instanceof FormData)) throw new Error("Expected upload form data");
    const file = data.get("file");
    if (!(file instanceof File)) throw new Error("No file selected");
    if (file.size < 1) throw new Error("Selected file is empty");
    if (file.size > 50 * 1024 * 1024) throw new Error("File must be under 50 MB");
    return { file };
  })
  .handler(async ({ data, context }) => {
    const userId = (context as any).userId as string;
    const supabase = (context as any).supabase;
    const mimeType = data.file.type || "application/octet-stream";
    const key = s3KeyFor(userId, data.file.name);
    const signed = await signStorageUrl("write", key);
    const upload = await fetch(signed.url, {
      method: signed.method || "PUT",
      body: await data.file.arrayBuffer(),
      headers: { "Content-Type": mimeType },
    });
    if (!upload.ok) throw new Error(`Upload failed [${upload.status}]: ${await upload.text()}`);

    const cls = await classifyFromName(data.file.name, mimeType);
    const { data: row, error } = await supabase
      .from("vault_documents")
      .insert({
        user_id: userId,
        file_name: data.file.name,
        s3_key: key,
        size_bytes: data.file.size,
        mime_type: mimeType,
        doc_type: cls.doc_type,
        category: cls.category,
        ai_confidence: cls.confidence,
        ai_summary: cls.summary,
      })
      .select("id,file_name,s3_key,size_bytes,mime_type,doc_type,category,ai_confidence,ai_summary,created_at")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const getVaultDownloadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { s3_key: string }) => z.object({ s3_key: z.string().min(1) }).parse(d))
  .handler(async ({ data, context }) => {
    const userId = (context as any).userId as string;
    if (!data.s3_key.startsWith(`vault/${userId}/`)) throw new Error("Forbidden");
    const j = await signStorageUrl("read", data.s3_key);
    return { download_url: j.url as string };
  });

export const classifyDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { fileName: string; mimeType: string }) =>
    z.object({ fileName: z.string().min(1), mimeType: z.string().min(1) }).parse(d)
  )
  .handler(async ({ data }) => {
    return classifyFromName(data.fileName, data.mimeType);
  });
