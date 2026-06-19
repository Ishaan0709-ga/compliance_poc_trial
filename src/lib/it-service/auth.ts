import { supabase } from "@/integrations/supabase/client";

let activeUserId: string | null = null;

export function setITServiceUserId(userId: string | null) {
  activeUserId = userId;
}

export function getITServiceUserId(): string | null {
  return activeUserId;
}

export function getITServiceStorageKey(): string {
  return activeUserId
    ? `complyos-it-service-${activeUserId}`
    : "complyos-it-service-guest";
}

/** Normalize Indian mobile → E.164 (+91…) */
export function normalizeIndianPhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  if (input.startsWith("+")) return input.replace(/\s/g, "");
  return `+${digits}`;
}

export function formatPhoneDisplay(phone: string | undefined | null): string {
  if (!phone) return "";
  const d = phone.replace(/\D/g, "");
  if (d.length >= 12 && d.startsWith("91")) {
    const local = d.slice(2);
    return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
  }
  return phone;
}

export function userInitials(user: {
  phone?: string | null;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): string {
  const name = user.user_metadata?.full_name as string | undefined;
  if (name) {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();
  }
  if (user.phone) {
    const d = user.phone.replace(/\D/g, "").slice(-2);
    return d || "IT";
  }
  const fromEmail = user.email?.match(/^its\+(\d+)@phone\.complyos\.app$/);
  if (fromEmail) return fromEmail[1].slice(-2);
  if (user.email) return user.email.slice(0, 2).toUpperCase();
  return "IT";
}

/** Map mobile number → internal auth email (Supabase email/password) */
export function phoneToAuthEmail(phone: string): string {
  const digits = normalizeIndianPhone(phone).replace(/\D/g, "");
  return `its+${digits}@phone.complyos.app`;
}

export function displayPhoneFromUser(user: {
  phone?: string | null;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): string {
  const meta = user.user_metadata?.phone as string | undefined;
  if (meta) return formatPhoneDisplay(meta);
  if (user.phone) return formatPhoneDisplay(user.phone);
  const email = user.email ?? "";
  const m = email.match(/^its\+(\d+)@phone\.complyos\.app$/);
  if (m) return formatPhoneDisplay(`+${m[1]}`);
  return user.email ?? "";
}

export async function signInWithPhonePin(
  phone: string,
  pin: string
): Promise<{
  user: import("@supabase/supabase-js").User | null;
  error: string | null;
  needsSignup?: boolean;
}> {
  const normalized = normalizeIndianPhone(phone);
  const email = phoneToAuthEmail(normalized);

  const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
    email,
    password: pin,
  });

  if (!signInErr && signInData.user) {
    return { user: signInData.user, error: null };
  }

  const invalidCreds =
    signInErr?.message?.toLowerCase().includes("invalid login") ||
    signInErr?.message?.toLowerCase().includes("invalid credentials");

  if (invalidCreds) {
    return { user: null, error: null, needsSignup: true };
  }

  return { user: null, error: signInErr?.message ?? "Sign in failed" };
}

export async function registerWithPhonePin(
  phone: string,
  pin: string
): Promise<{ user: import("@supabase/supabase-js").User | null; error: string | null }> {
  const normalized = normalizeIndianPhone(phone);
  const email = phoneToAuthEmail(normalized);

  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
    email,
    password: pin,
    options: {
      data: {
        phone: normalized,
        login_method: "phone_pin",
      },
    },
  });

  if (signUpErr) return { user: null, error: signUpErr.message };

  if (signUpData.session?.user) {
    return { user: signUpData.session.user, error: null };
  }

  const retry = await supabase.auth.signInWithPassword({ email, password: pin });
  if (retry.data.user) return { user: retry.data.user, error: null };

  return {
    user: null,
    error:
      retry.error?.message ??
      "Account created. If email confirmation is enabled in Supabase, disable it for phone sign-in.",
  };
}

/**
 * Sign in with mobile + 6-digit PIN (no SMS provider required).
 * First visit registers the number; return visits verify the same PIN.
 */
export async function signInOrRegisterWithPhonePin(
  phone: string,
  pin: string
): Promise<{ user: import("@supabase/supabase-js").User | null; error: string | null }> {
  const signIn = await signInWithPhonePin(phone, pin);
  if (signIn.user) return { user: signIn.user, error: null };
  if (!signIn.needsSignup) return { user: null, error: signIn.error };
  return registerWithPhonePin(phone, pin);
}

/** @deprecated SMS OTP — only works when Supabase Phone provider is enabled */
export async function sendPhoneOtp(phone: string) {
  return supabase.auth.signInWithOtp({ phone: normalizeIndianPhone(phone) });
}

export function isPhoneProviderError(message: string): boolean {
  const m = message.toLowerCase();
  return m.includes("unsupported phone") || m.includes("phone provider");
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

export async function signOutITService() {
  await supabase.auth.signOut();
  setITServiceUserId(null);
}
