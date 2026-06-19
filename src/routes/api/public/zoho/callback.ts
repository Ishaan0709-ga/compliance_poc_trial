import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { exchangeCode, verifyState } from "@/server/zoho.server";

export const Route = createFileRoute("/api/public/zoho/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const error = url.searchParams.get("error");
        const redirectBack = (msg: string, ok = false) =>
          new Response(null, {
            status: 302,
            headers: { Location: `/founder/books/connectors?zoho=${ok ? "success" : "error"}&msg=${encodeURIComponent(msg)}` },
          });
        if (error) return redirectBack(error);
        if (!code || !state) return redirectBack("missing_code_or_state");
        const userId = verifyState(state);
        if (!userId) return redirectBack("invalid_state");
        try {
          const tok = await exchangeCode(code);
          const expires_at = new Date(Date.now() + tok.expires_in * 1000).toISOString();
          const { error: upErr } = await supabaseAdmin.from("zoho_connections" as any).upsert({
            user_id: userId,
            region: "in",
            access_token: tok.access_token,
            refresh_token: tok.refresh_token,
            expires_at,
            scope: tok.scope || null,
          }, { onConflict: "user_id" });
          if (upErr) return redirectBack(upErr.message);
          return redirectBack("connected", true);
        } catch (e: any) {
          return redirectBack(e?.message || "exchange_failed");
        }
      },
    },
  },
});
