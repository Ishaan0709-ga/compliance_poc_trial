import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { generateTasks } from "@/server/compliance.engine";

const sb = (ctx: any) => ctx.supabase;

export const getCompanyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await sb(context)
      .from("company_profile")
      .select("*")
      .eq("user_id", (context as any).userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { profile: data };
  });

export const saveCompanyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: any) =>
    z.object({
      legal_name: z.string().max(200).optional().nullable(),
      entity_type: z.enum(["private_limited", "llp", "opc", "partnership", "proprietorship", "public_limited"]).optional().nullable(),
      state: z.string().max(80).optional().nullable(),
      pan: z.string().max(20).optional().nullable(),
      gstin: z.string().max(20).optional().nullable(),
      cin: z.string().max(30).optional().nullable(),
      incorporation_date: z.string().optional().nullable(),
      headcount: z.number().int().min(0).max(100000).optional().nullable(),
      turnover_band: z.enum(["<40L", "40L-1.5Cr", "1.5-5Cr", "5-50Cr", "50Cr+"]).optional().nullable(),
      registrations: z.record(z.string(), z.boolean()).optional().nullable(),
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const userId = (context as any).userId as string;
    const { data: row, error } = await sb(context)
      .from("company_profile")
      .upsert({ user_id: userId, ...data, updated_at: new Date().toISOString() }, { onConflict: "user_id" })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const listComplianceTasks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await sb(context)
      .from("compliance_tasks")
      .select("*")
      .eq("user_id", (context as any).userId)
      .order("due_date", { ascending: true })
      .limit(200);
    if (error) throw new Error(error.message);
    return { tasks: data || [] };
  });

export const regenerateComplianceTasks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = (context as any).userId as string;
    const supabase = sb(context);
    const { data: profile } = await supabase
      .from("company_profile")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (!profile) throw new Error("Complete your company profile first.");

    const generated = generateTasks(profile as any, new Date(), 6);
    if (generated.length === 0) return { created: 0, tasks: [] };

    const rows = generated.map((t) => ({
      user_id: userId,
      rule_code: t.rule_code,
      title: t.title,
      description: t.description,
      category: t.category,
      authority: t.authority,
      period: t.period,
      due_date: t.due_date,
      penalty_info: t.penalty_info,
      status: "pending",
    }));

    const { data, error } = await supabase
      .from("compliance_tasks")
      .upsert(rows, { onConflict: "user_id,rule_code,period", ignoreDuplicates: false })
      .select("id");
    if (error) throw new Error(error.message);
    return { created: data?.length || 0 };
  });

export const updateComplianceTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: any) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(["pending", "in_progress", "filed", "late", "skipped"]).optional(),
      filed_on: z.string().optional().nullable(),
      acknowledgement: z.string().max(200).optional().nullable(),
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const { data: row, error } = await sb(context)
      .from("compliance_tasks")
      .update(patch)
      .eq("id", id)
      .eq("user_id", (context as any).userId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });
