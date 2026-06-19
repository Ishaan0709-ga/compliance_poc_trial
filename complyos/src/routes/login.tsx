import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, ArrowRight, Briefcase, Building2, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "ComplyOS — The Operating System for Startups" },
      { name: "description", content: "Run your startup on ComplyOS: compliance, finance, and operations in one AI-powered OS for founders, admins and partners." },
      { property: "og:title", content: "ComplyOS — The Operating System for Startups" },
      { property: "og:description", content: "Run your startup on ComplyOS: compliance, finance, and operations in one AI-powered OS for founders, admins and partners." },
      { name: "twitter:title", content: "ComplyOS — The Operating System for Startups" },
      { name: "twitter:description", content: "Run your startup on ComplyOS: compliance, finance, and operations in one AI-powered OS for founders, admins and partners." },
    ],
  }),
  component: LoginPage,
});

const ROLES = [
  {
    id: "founder",
    label: "Founder",
    sub: "Startup / MSME owners",
    icon: Sparkles,
    to: "/founder",
    blurb: "Track orders, manage docs, get AI compliance & finance guidance.",
  },
  {
    id: "admin",
    label: "Admin",
    sub: "ComplyOS team",
    icon: Building2,
    to: "/admin",
    blurb: "Operational command centre: orders, partners, CRM, BI.",
  },
  {
    id: "partner",
    label: "Partner",
    sub: "CA · CS · Legal",
    icon: Briefcase,
    to: "/partner",
    blurb: "Receive assignments, submit deliverables, manage payouts.",
  },
] as const;

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<(typeof ROLES)[number]["id"]>("founder");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("demo1234");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const target = ROLES.find((r) => r.id === role)!.to;
        navigate({ to: target as "/founder" });
      }
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setBusy(true);
    try {
      const fn = mode === "signin"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/founder` } });
      const { error } = await fn;
      if (error) { setErr(error.message); return; }
      const target = ROLES.find((r) => r.id === role)!.to;
      navigate({ to: target as "/founder" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      {/* Left: brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-onboard text-white md:flex md:flex-col md:justify-between md:p-10">
        <div className="absolute inset-0 grid-bg pointer-events-none opacity-50" />
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <ShieldCheck className="h-5 w-5" strokeWidth={2.4} />
          </div>
          <span className="text-[20px] font-extrabold tracking-[-0.03em]">
            Comply<span className="text-[oklch(0.78_0.12_265)]">OS</span>
          </span>
        </div>
        <div className="relative max-w-md">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[oklch(0.82_0.1_265)]">
            <Sparkles className="h-3 w-3" /> AI Operating System
          </div>
          <h1 className="text-[40px] font-extrabold leading-[1.05] tracking-[-0.04em]">
            The startup operating system for{" "}
            <span className="bg-gradient-to-r from-[oklch(0.78_0.12_265)] to-[oklch(0.85_0.15_295)] bg-clip-text text-transparent">
              Indian founders
            </span>
            .
          </h1>
          <p className="mt-4 text-[14px] leading-relaxed text-white/65">
            Three portals — Founder, Admin, Partner — on a unified document, compliance and AI
            backbone. From Day 0 to Series A.
          </p>
        </div>
        <div className="relative text-[11px] text-white/40">
          © {new Date().getFullYear()} ComplyOS × Grae AI · Confidential
        </div>
      </div>

      {/* Right: login form */}
      <div className="flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
              Sign in
            </div>
            <h2 className="mt-2 text-[28px] font-extrabold tracking-[-0.03em] text-ink">
              Welcome back.
            </h2>
            <p className="mt-1 text-[13px] text-ink-3">
              Choose your portal and sign in to continue.
            </p>
          </div>

          {/* Role selector */}
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
                      ? "border-primary-border bg-primary-muted shadow-card"
                      : "border-border bg-surface hover:border-primary-border/50 hover:bg-surface-2"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      active ? "bg-primary text-primary-foreground" : "bg-surface-2 text-ink-3"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-[14px] font-extrabold text-ink">{r.label}</div>
                      <div className="text-[11px] text-ink-4">· {r.sub}</div>
                    </div>
                    <div className="text-[12px] text-ink-3">{r.blurb}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="mb-1 block text-[12px] font-bold text-ink-2">Work email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.in"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-[14px] outline-none focus:border-primary focus:ring-2 focus:ring-primary-muted"
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-bold text-ink-2">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-[14px] outline-none focus:border-primary focus:ring-2 focus:ring-primary-muted"
              />
            </div>
            {err && <div className="text-[12px] text-destructive">{err}</div>}
            <button
              type="submit"
              disabled={busy}
              className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-[14px] font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {mode === "signin" ? "Sign in" : "Create account"} · {ROLES.find((r) => r.id === role)!.label}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="w-full text-center text-[12px] text-ink-3 hover:text-ink"
            >
              {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-[12px] text-ink-4">
            <Link to="/" className="hover:text-ink-2">
              ← Back to home
            </Link>
            <a href="#" className="hover:text-ink-2">
              Forgot password?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
