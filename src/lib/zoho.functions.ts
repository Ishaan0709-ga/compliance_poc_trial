import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { signState, redirectUri, ZOHO_AUTH_BASE, ZOHO_SCOPES, zohoFetch } from "@/server/zoho.server";

export const getZohoAuthUrl = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const clientId = process.env.ZOHO_CLIENT_ID;
    if (!clientId) throw new Error("Missing ZOHO_CLIENT_ID");
    const state = signState(context.userId);
    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      scope: ZOHO_SCOPES,
      redirect_uri: redirectUri(),
      access_type: "offline",
      prompt: "consent",
      state,
    });
    return { url: `${ZOHO_AUTH_BASE}/oauth/v2/auth?${params.toString()}` };
  });

export const getZohoStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await supabaseAdmin
      .from("zoho_connections" as any)
      .select("organization_id, organization_name, region, expires_at, updated_at")
      .eq("user_id", context.userId)
      .maybeSingle();
    const { count } = await supabaseAdmin
      .from("zoho_invoices" as any)
      .select("*", { count: "exact", head: true })
      .eq("user_id", context.userId);
    return { connected: !!data, ...((data as any) || {}), invoiceCount: count || 0 } as any;
  });

export const disconnectZoho = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await supabaseAdmin.from("zoho_connections" as any).delete().eq("user_id", context.userId);
    return { ok: true };
  });

export const syncZohoInvoices = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = context.userId;
    // 1) get organizations if not stored
    const { data: conn } = await supabaseAdmin
      .from("zoho_connections" as any)
      .select("organization_id")
      .eq("user_id", userId)
      .maybeSingle();
    let orgId = (conn as any)?.organization_id as string | null;
    if (!orgId) {
      const { json } = await zohoFetch(userId, `/books/v3/organizations`);
      const orgs = json.organizations || [];
      if (!orgs.length) throw new Error("No Zoho Books organization found");
      orgId = orgs[0].organization_id as string;
      await supabaseAdmin.from("zoho_connections" as any)
        .update({ organization_id: orgId, organization_name: orgs[0].name })
        .eq("user_id", userId);
    }
    // 2) fetch invoices
    const { json } = await zohoFetch(userId, `/books/v3/invoices?organization_id=${orgId}&per_page=100`);
    const invoices = (json.invoices || []) as any[];
    if (invoices.length) {
      const rows = invoices.map((i) => ({
        user_id: userId,
        zoho_invoice_id: i.invoice_id,
        invoice_number: i.invoice_number,
        customer_name: i.customer_name,
        status: i.status,
        invoice_date: i.date || null,
        due_date: i.due_date || null,
        total: i.total ?? 0,
        balance: i.balance ?? 0,
        currency: i.currency_code || "INR",
        raw: i,
      }));
      const { error } = await supabaseAdmin
        .from("zoho_invoices" as any)
        .upsert(rows, { onConflict: "user_id,zoho_invoice_id" });
      if (error) throw error;
    }
    return { synced: invoices.length };
  });

export const listZohoInvoices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await supabaseAdmin
      .from("zoho_invoices" as any)
      .select("zoho_invoice_id, invoice_number, customer_name, status, invoice_date, due_date, total, balance, currency")
      .eq("user_id", context.userId)
      .order("invoice_date", { ascending: false })
      .limit(100);
    if (error) throw error;
    return { invoices: data || [] };
  });
