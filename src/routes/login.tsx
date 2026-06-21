import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import {
  AuthField,
  AuthMessage,
  AuthSubmitButton,
  AuthTextInput,
  PasswordInput,
} from "@/components/auth/AuthField";
import { AuthBrandPanel, AuthMobileHeader, AuthModeTabs } from "@/components/auth/AuthShell";
import { supabase } from "@/integrations/supabase/client";

type AuthMode = "signin" | "signup" | "forgot" | "reset";

type LoginSearch = { mode?: string; reset?: string };

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — ComplyOS" },
      {
        name: "description",
        content: "Sign in to ComplyOS — Founder, Admin, and Partner portals for compliance and operations.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    mode: typeof search.mode === "string" ? search.mode : undefined,
    reset: typeof search.reset === "string" ? search.reset : undefined,
  }),
  component: LoginPage,
});

const ROLES = [
  {
    id: "founder",
    label: "Founder",
    sub: "Startup / MSME",
    icon: Sparkles,
    to: "/founder",
    blurb: "Orders, docs, AI compliance & finance.",
  },
  {
    id: "admin",
    label: "Admin",
    sub: "ComplyOS team",
    icon: Building2,
    to: "/admin",
    blurb: "Orders, partners, CRM, BI.",
  },
  {
    id: "partner",
    label: "Partner",
    sub: "CA · CS · Legal",
    icon: Briefcase,
    to: "/partner",
    blurb: "Assignments, deliverables, payouts.",
  },
] as const;

function LoginPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [role, setRole] = useState<(typeof ROLES)[number]["id"]>("founder");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [mode, setMode] = useState<AuthMode>(
    search.reset === "1" ? "reset" : search.mode === "signup" ? "signup" : "signin"
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user && mode !== "reset") {
        const target = ROLES.find((r) => r.id === role)!.to;
        navigate({ to: target as "/founder" });
      }
    });
  }, [mode, navigate, role]);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setMode("reset");
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const portal = ROLES.find((r) => r.id === role)!;

  const goToPortal = () => navigate({ to: portal.to as "/founder" });

  const submitSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setInfo(null);
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        setErr(error.message);
        return;
      }
      goToPortal();
    } finally {
      setBusy(false);
    }
  };

  const submitSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setInfo(null);
    if (password.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErr("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login?mode=signin`,
          data: { portal: role },
        },
      });
      if (error) {
        setErr(error.message);
        return;
      }
      if (data.session) {
        goToPortal();
        return;
      }
      setInfo("Check your email to confirm your account, then sign in.");
      setMode("signin");
    } finally {
      setBusy(false);
    }
  };

  const submitForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setInfo(null);
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login?reset=1`,
      });
      if (error) {
        setErr(error.message);
        return;
      }
      setInfo("Password reset link sent. Check your inbox and spam folder.");
    } finally {
      setBusy(false);
    }
  };

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setInfo(null);
    if (newPassword.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErr("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setErr(error.message);
        return;
      }
      setInfo("Password updated. Signing you in…");
      goToPortal();
    } finally {
      setBusy(false);
    }
  };

  const titles: Record<AuthMode, { kicker: string; title: string; sub: string }> = {
    signin: {
      kicker: "Sign in",
      title: "Welcome back.",
      sub: "Choose your portal and enter your credentials.",
    },
    signup: {
      kicker: "Create account",
      title: "Get started.",
      sub: "One account per work email. Pick the portal you'll use most.",
    },
    forgot: {
      kicker: "Forgot password",
      title: "Reset your password.",
      sub: "We'll email you a secure link to set a new password.",
    },
    reset: {
      kicker: "New password",
      title: "Choose a new password.",
      sub: "Must be at least 8 characters.",
    },
  };

  const copy = titles[mode];

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <AuthBrandPanel
        badge="Founder · Admin · Partner"
        title={
          <>
            The operating system for{" "}
            <span className="bg-gradient-to-r from-[oklch(0.78_0.12_265)] to-[oklch(0.85_0.15_295)] bg-clip-text text-transparent">
              Indian founders
            </span>
            .
          </>
        }
        subtitle="Three portals on one compliance, finance, and AI backbone — from Day 0 to Series A."
      />

      <div className="flex items-center justify-center bg-background px-6 py-10 md:py-12">
        <div className="w-full max-w-md">
          <AuthMobileHeader />

          <div className="mb-6">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
              {copy.kicker}
            </div>
            <h2 className="mt-2 text-[28px] font-extrabold tracking-[-0.03em] text-ink">
              {copy.title}
            </h2>
            <p className="mt-1 text-[13px] text-ink-3">{copy.sub}</p>
          </div>

          {(mode === "signin" || mode === "signup") && (
            <>
              <AuthModeTabs
                value={mode}
                onChange={(m) => {
                  setMode(m);
                  setErr(null);
                  setInfo(null);
                }}
                tabs={[
                  { id: "signin", label: "Sign in" },
                  { id: "signup", label: "Sign up" },
                ]}
              />

              <div className="mb-5 grid gap-2">
                {ROLES.map((r) => {
                  const Icon = r.icon;
                  const active = role === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                        active
                          ? "border-primary-border bg-primary-muted/60 shadow-sm"
                          : "border-border bg-white hover:border-primary-border/40 hover:bg-surface-2/50"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          active ? "bg-primary text-primary-foreground" : "bg-surface-2 text-ink-3"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span className="text-[14px] font-extrabold text-ink">{r.label}</span>
                          <span className="text-[11px] text-ink-4">· {r.sub}</span>
                        </div>
                        <p className="text-[12px] text-ink-3">{r.blurb}</p>
                      </div>
                      {active && <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {mode === "signin" && (
            <form onSubmit={submitSignIn} className="space-y-4">
              <AuthField label="Work email">
                <AuthTextInput
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@company.in"
                  autoComplete="email"
                  required
                />
              </AuthField>
              <AuthField label="Password">
                <PasswordInput value={password} onChange={setPassword} autoComplete="current-password" required />
              </AuthField>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    setErr(null);
                    setInfo(null);
                  }}
                  className="text-[12px] font-semibold text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              {err && <AuthMessage tone="error">{err}</AuthMessage>}
              {info && <AuthMessage tone="info">{info}</AuthMessage>}
              <AuthSubmitButton busy={busy}>
                Sign in · {portal.label}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </AuthSubmitButton>
            </form>
          )}

          {mode === "signup" && (
            <form onSubmit={submitSignUp} className="space-y-4">
              <AuthField label="Work email" hint="Use your company email for portal access.">
                <AuthTextInput
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@company.in"
                  autoComplete="email"
                  required
                />
              </AuthField>
              <AuthField label="Password" hint="Minimum 8 characters.">
                <PasswordInput
                  value={password}
                  onChange={setPassword}
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              </AuthField>
              <AuthField label="Confirm password">
                <PasswordInput
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              </AuthField>
              {err && <AuthMessage tone="error">{err}</AuthMessage>}
              {info && <AuthMessage tone="success">{info}</AuthMessage>}
              <AuthSubmitButton busy={busy}>
                Create account · {portal.label}
                <ArrowRight className="h-4 w-4" />
              </AuthSubmitButton>
            </form>
          )}

          {mode === "forgot" && (
            <form onSubmit={submitForgot} className="space-y-4">
              <AuthField
                label="Work email"
                hint="Enter the email you used to register. We'll send a reset link."
              >
                <AuthTextInput
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@company.in"
                  autoComplete="email"
                  required
                />
              </AuthField>
              {err && <AuthMessage tone="error">{err}</AuthMessage>}
              {info && <AuthMessage tone="success">{info}</AuthMessage>}
              <AuthSubmitButton busy={busy}>Send reset link</AuthSubmitButton>
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErr(null);
                  setInfo(null);
                }}
                className="w-full text-center text-[13px] font-medium text-ink-3 hover:text-ink"
              >
                ← Back to sign in
              </button>
            </form>
          )}

          {mode === "reset" && (
            <form onSubmit={submitReset} className="space-y-4">
              <AuthField label="New password" hint="Minimum 8 characters.">
                <PasswordInput
                  value={newPassword}
                  onChange={setNewPassword}
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              </AuthField>
              <AuthField label="Confirm new password">
                <PasswordInput
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              </AuthField>
              {err && <AuthMessage tone="error">{err}</AuthMessage>}
              {info && <AuthMessage tone="success">{info}</AuthMessage>}
              <AuthSubmitButton busy={busy}>Update password</AuthSubmitButton>
            </form>
          )}

          <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6 text-[12px] text-ink-4 sm:flex-row sm:items-center sm:justify-between">
            <Link to="/" className="font-medium hover:text-ink-2">
              ← Back to home
            </Link>
            <Link to="/it-service/login" className="font-medium text-primary hover:underline">
              IT Service portal →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
