import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// ---------- helpers ----------
const sb = (ctx: any) => ctx.supabase;

// ============ Bank accounts ============

export const listBankAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await sb(context)
      .from("bank_accounts")
      .select("*")
      .eq("user_id", (context as any).userId)
      .eq("is_active", true)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return { accounts: data || [] };
  });

export const createBankAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: any) =>
    z.object({
      name: z.string().min(1).max(120),
      bank: z.string().max(120).optional(),
      account_number_last4: z.string().regex(/^\d{2,6}$/).optional(),
      ifsc: z.string().max(20).optional(),
      account_type: z.enum(["current", "savings", "eefc", "cc", "wallet"]).optional(),
      currency: z.string().length(3).default("INR"),
      opening_balance: z.number().default(0),
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await sb(context)
      .from("bank_accounts")
      .insert({
        ...data,
        current_balance: data.opening_balance,
        user_id: (context as any).userId,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

// ============ Transactions ============

export const listTransactions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: any) =>
    z.object({ limit: z.number().min(1).max(500).default(100) }).parse(d ?? {})
  )
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await sb(context)
      .from("transactions")
      .select("*")
      .eq("user_id", (context as any).userId)
      .order("txn_date", { ascending: false })
      .limit(data.limit);
    if (error) throw new Error(error.message);
    return { transactions: rows || [] };
  });

export const createTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: any) =>
    z.object({
      bank_account_id: z.string().uuid().optional().nullable(),
      txn_date: z.string(), // YYYY-MM-DD
      description: z.string().min(1).max(500),
      counterparty: z.string().max(200).optional(),
      amount: z.number(),
      currency: z.string().length(3).default("INR"),
      direction: z.enum(["in", "out"]),
      category: z.string().max(80).optional(),
      subcategory: z.string().max(80).optional(),
      gst_rate: z.number().optional(),
      gst_amount: z.number().optional(),
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const signed = data.direction === "in" ? Math.abs(data.amount) : -Math.abs(data.amount);
    const { data: row, error } = await sb(context)
      .from("transactions")
      .insert({ ...data, amount: signed, user_id: (context as any).userId })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

// ============ Invoices ============

export const listInvoices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await sb(context)
      .from("invoices")
      .select("*")
      .eq("user_id", (context as any).userId)
      .order("invoice_date", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return { invoices: data || [] };
  });

export const createInvoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: any) =>
    z.object({
      invoice_number: z.string().min(1).max(60),
      customer_name: z.string().min(1).max(200),
      customer_gstin: z.string().max(20).optional(),
      invoice_date: z.string(),
      due_date: z.string().optional(),
      subtotal: z.number(),
      gst_rate: z.number().optional(),
      gst_amount: z.number().default(0),
      total: z.number(),
      currency: z.string().length(3).default("INR"),
      is_export: z.boolean().default(false),
      status: z.enum(["draft", "sent", "paid", "overdue", "void"]).default("draft"),
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await sb(context)
      .from("invoices")
      .insert({
        ...data,
        balance: data.status === "paid" ? 0 : data.total,
        user_id: (context as any).userId,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

// ============ Bills ============

export const listBills = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await sb(context)
      .from("bills")
      .select("*")
      .eq("user_id", (context as any).userId)
      .order("bill_date", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return { bills: data || [] };
  });

export const createBill = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: any) =>
    z.object({
      bill_number: z.string().max(60).optional(),
      vendor_name: z.string().min(1).max(200),
      vendor_gstin: z.string().max(20).optional(),
      bill_date: z.string(),
      due_date: z.string().optional(),
      subtotal: z.number(),
      gst_rate: z.number().optional(),
      gst_amount: z.number().default(0),
      tds_amount: z.number().default(0),
      total: z.number(),
      category: z.string().max(80).optional(),
      currency: z.string().length(3).default("INR"),
      status: z.enum(["open", "paid", "overdue", "void"]).default("open"),
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await sb(context)
      .from("bills")
      .insert({
        ...data,
        balance: data.status === "paid" ? 0 : data.total,
        user_id: (context as any).userId,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

// ============ Documents & extraction jobs ============

export const listDocuments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await sb(context)
      .from("documents")
      .select("*")
      .eq("user_id", (context as any).userId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return { documents: data || [] };
  });

export const listExtractionJobs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await sb(context)
      .from("extraction_jobs")
      .select("*")
      .eq("user_id", (context as any).userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return { jobs: data || [] };
  });

/**
 * Upload a file to Supabase Storage (bucket: ingest) and create
 * `documents` + queued `extraction_jobs` rows.
 * The AI extraction step is invoked separately via runExtraction().
 */
export const uploadDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => {
    if (!(data instanceof FormData)) throw new Error("Expected upload form data");
    const file = data.get("file");
    const kind = String(data.get("kind") || "other");
    if (!(file instanceof File)) throw new Error("No file selected");
    if (file.size < 1) throw new Error("Selected file is empty");
    if (file.size > 25 * 1024 * 1024) throw new Error("File must be under 25 MB");
    if (!["bank_statement", "invoice", "bill", "receipt", "contract", "other"].includes(kind))
      throw new Error("Invalid document kind");
    return { file, kind };
  })
  .handler(async ({ data, context }) => {
    const userId = (context as any).userId as string;
    const supabase = sb(context);
    const safe = data.file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${userId}/${data.kind}/${Date.now()}_${safe}`;
    const buf = await data.file.arrayBuffer();
    const up = await supabase.storage.from("ingest").upload(path, buf, {
      contentType: data.file.type || "application/octet-stream",
      upsert: false,
    });
    if (up.error) throw new Error(up.error.message);

    const { data: doc, error: docErr } = await supabase
      .from("documents")
      .insert({
        user_id: userId,
        kind: data.kind,
        filename: data.file.name,
        mime_type: data.file.type,
        size_bytes: data.file.size,
        storage_path: path,
        source: "upload",
      })
      .select("*")
      .single();
    if (docErr) throw new Error(docErr.message);

    const { data: job, error: jobErr } = await supabase
      .from("extraction_jobs")
      .insert({
        user_id: userId,
        document_id: doc.id,
        kind: data.kind,
        status: "queued",
      })
      .select("*")
      .single();
    if (jobErr) throw new Error(jobErr.message);

    return { document: doc, job };
  });

// ============ KPIs (computed live from transactions) ============

export const getKpis = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = (context as any).userId;
    const supabase = sb(context);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0, 10);

    const [txnsRes, accountsRes, invRes, billRes] = await Promise.all([
      supabase.from("transactions").select("amount,direction,txn_date,gst_amount,category")
        .eq("user_id", userId).gte("txn_date", prevMonthStart),
      supabase.from("bank_accounts").select("current_balance,currency").eq("user_id", userId).eq("is_active", true),
      supabase.from("invoices").select("balance,total,status").eq("user_id", userId),
      supabase.from("bills").select("balance,total,status").eq("user_id", userId),
    ]);

    const txns: any[] = txnsRes.data || [];
    const sumIn = (rows: any[], filter: (r: any) => boolean) =>
      rows.filter(filter).reduce((s: number, r: any) => s + Number(r.amount || 0), 0);

    const thisMonth = txns.filter((t: any) => t.txn_date >= monthStart);
    const lastMonth = txns.filter((t: any) => t.txn_date >= prevMonthStart && t.txn_date <= prevMonthEnd);

    const revenue = sumIn(thisMonth, (r) => r.direction === "in");
    const expenses = Math.abs(sumIn(thisMonth, (r) => r.direction === "out"));
    const lastRev = sumIn(lastMonth, (r) => r.direction === "in");
    const lastExp = Math.abs(sumIn(lastMonth, (r) => r.direction === "out"));

    const cash = (accountsRes.data || []).reduce((s: number, a: any) => s + Number(a.current_balance || 0), 0);
    const ar = (invRes.data || []).reduce((s: number, i: any) => s + Number(i.balance || 0), 0);
    const ap = (billRes.data || []).reduce((s: number, b: any) => s + Number(b.balance || 0), 0);
    const gstCollected = thisMonth.filter((t: any) => t.direction === "in")
      .reduce((s: number, t: any) => s + Number(t.gst_amount || 0), 0);
    const gstPaid = thisMonth.filter((t: any) => t.direction === "out")
      .reduce((s: number, t: any) => s + Number(t.gst_amount || 0), 0);

    const burn = expenses;
    const runwayMonths = burn > 0 ? cash / burn : null;

    return {
      revenue,
      expenses,
      net: revenue - expenses,
      cash,
      ar,
      ap,
      gstCollected,
      gstPaid,
      runwayMonths,
      revChangePct: lastRev > 0 ? ((revenue - lastRev) / lastRev) * 100 : null,
      expChangePct: lastExp > 0 ? ((expenses - lastExp) / lastExp) * 100 : null,
      hasData: txns.length > 0 || (accountsRes.data || []).length > 0,
    };
  });
