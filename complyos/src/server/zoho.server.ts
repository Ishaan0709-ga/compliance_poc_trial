import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const REGION = "in";
export const ZOHO_AUTH_BASE = `https://accounts.zoho.${REGION}`;
export const ZOHO_API_BASE = `https://www.zohoapis.${REGION}`;
export const ZOHO_SCOPES = "ZohoBooks.fullaccess.read,ZohoBooks.contacts.READ,ZohoBooks.invoices.READ,ZohoBooks.settings.READ";

function secret() {
  const s = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!s) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  return s;
}

export function signState(userId: string) {
  const ts = Date.now().toString();
  const payload = `${userId}.${ts}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

export function verifyState(state: string): string | null {
  try {
    const decoded = Buffer.from(state, "base64url").toString();
    const [userId, ts, sig] = decoded.split(".");
    if (!userId || !ts || !sig) return null;
    const expected = createHmac("sha256", secret()).update(`${userId}.${ts}`).digest("hex");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    if (Date.now() - Number(ts) > 15 * 60 * 1000) return null;
    return userId;
  } catch { return null; }
}

export function redirectUri() {
  const base = process.env.SITE_URL || "https://complyos.lovable.app";
  return `${base}/api/public/zoho/callback`;
}

export async function exchangeCode(code: string) {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: process.env.ZOHO_CLIENT_ID!,
    client_secret: process.env.ZOHO_CLIENT_SECRET!,
    redirect_uri: redirectUri(),
    code,
  });
  const res = await fetch(`${ZOHO_AUTH_BASE}/oauth/v2/token`, { method: "POST", body: params });
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(`Zoho token exchange failed: ${JSON.stringify(json)}`);
  return json as { access_token: string; refresh_token: string; expires_in: number; scope?: string; api_domain?: string };
}

export async function refreshAccessToken(refreshToken: string) {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: process.env.ZOHO_CLIENT_ID!,
    client_secret: process.env.ZOHO_CLIENT_SECRET!,
    refresh_token: refreshToken,
  });
  const res = await fetch(`${ZOHO_AUTH_BASE}/oauth/v2/token`, { method: "POST", body: params });
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(`Zoho refresh failed: ${JSON.stringify(json)}`);
  return json as { access_token: string; expires_in: number };
}

export async function getValidAccessToken(userId: string) {
  const { data: conn, error } = await supabaseAdmin
    .from("zoho_connections" as any)
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!conn) throw new Error("Zoho not connected");
  const c = conn as any;
  if (new Date(c.expires_at).getTime() - Date.now() > 60_000) return c;
  const refreshed = await refreshAccessToken(c.refresh_token);
  const expires_at = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();
  await supabaseAdmin.from("zoho_connections" as any).update({ access_token: refreshed.access_token, expires_at }).eq("user_id", userId);
  return { ...c, access_token: refreshed.access_token, expires_at };
}

export async function zohoFetch(userId: string, path: string) {
  const c = await getValidAccessToken(userId);
  const res = await fetch(`${ZOHO_API_BASE}${path}`, {
    headers: { Authorization: `Zoho-oauthtoken ${c.access_token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Zoho API ${path} failed [${res.status}]: ${JSON.stringify(json)}`);
  return { json, conn: c };
}
