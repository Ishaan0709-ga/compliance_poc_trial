import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { normalizeIndianPhone, phoneToAuthEmail } from "@/lib/it-service/auth";

const resetPinSchema = z.object({
  phone: z.string().min(10),
  newPin: z.string().regex(/^\d{6}$/, "PIN must be exactly 6 digits"),
});

async function findAuthUserByEmail(email: string) {
  let page = 1;
  while (page <= 20) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (data.users.length < 200) break;
    page++;
  }
  return null;
}

export const resetItServicePin = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => resetPinSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const email = phoneToAuthEmail(normalizeIndianPhone(data.phone));
      const user = await findAuthUserByEmail(email);

      if (!user) {
        return {
          ok: false as const,
          error: "No account found for this mobile number. Please sign up first.",
        };
      }

      const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password: data.newPin,
      });

      if (updErr) {
        return { ok: false as const, error: updErr.message };
      }

      return { ok: true as const };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not reset PIN";
      if (msg.includes("SUPABASE_SERVICE_ROLE")) {
        return {
          ok: false as const,
          error: "PIN reset is unavailable in this environment. Contact your administrator.",
        };
      }
      return { ok: false as const, error: msg };
    }
  });

export type ResetItServicePinResult = Awaited<ReturnType<typeof resetItServicePin>>;
