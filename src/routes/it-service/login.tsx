import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ShieldCheck, Server, Loader2, ArrowRight } from "lucide-react";
import { Btn } from "@/components/ui-kit";
import { supabase } from "@/integrations/supabase/client";
import {
  setITServiceUserId,
  signInWithPhonePin,
  registerWithPhonePin,
} from "@/lib/it-service/auth";
import { loadState } from "@/lib/it-service/storage";

type LoginSearch = { redirect?: string };

export const Route = createFileRoute("/it-service/login")({
  head: () => ({
    meta: [{ title: "Sign in — IT Service — ComplyOS" }],
  }),
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: ITServiceLoginPage,
});

function ITServiceLoginPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState<"phone" | "pin">("phone");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const goNext = useCallback(() => {
    const state = loadState();
    if (redirect && redirect.startsWith("/it-service")) {
      navigate({ to: redirect as "/it-service/dashboard" });
      return;
    }
    if (state?.profile?.onboardingComplete) {
      navigate({ to: "/it-service/dashboard" });
    } else {
      navigate({ to: "/it-service/onboarding" });
    }
  }, [navigate, redirect]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setITServiceUserId(data.user.id);
        goNext();
      }
    });
  }, [goNext]);

  const continueToPin = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setInfo(null);
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setErr("Enter a valid 10-digit mobile number.");
      return;
    }
    setStep("pin");
    setMode("signin");
    setPin("");
    setConfirmPin("");
  };

  const verifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setInfo(null);
    setBusy(true);
    try {
      if (pin.length < 6) {
        setErr("Enter a 6-digit PIN.");
        return;
      }

      if (mode === "signup") {
        if (confirmPin.length < 6) {
          setErr("Confirm your 6-digit PIN.");
          return;
        }
        if (pin !== confirmPin) {
          setErr("PINs do not match.");
          return;
        }
        const { user, error } = await registerWithPhonePin(phone, pin);
        if (error || !user) {
          setErr(error ?? "Could not create account.");
          return;
        }
        setITServiceUserId(user.id);
        setInfo("Account created. Welcome to ComplyOS IT Service.");
        goNext();
        return;
      }

      const { user, error, needsSignup } = await signInWithPhonePin(phone, pin);
      if (user) {
        setITServiceUserId(user.id);
        goNext();
        return;
      }
      if (needsSignup) {
        setMode("signup");
        setInfo("New number — confirm your PIN to create an account.");
        setConfirmPin("");
        return;
      }
      setErr(error ?? "Could not sign in.");
    } finally {
      setBusy(false);
    }
  };

  const displayPhone = `+91 ${phone.replace(/\D/g, "").slice(-10)}`;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-onboard text-white">
      <header className="flex items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-primary text-primary-foreground">
            <ShieldCheck className="h-4 w-4" strokeWidth={2.4} />
          </div>
          <span className="text-[16px] font-extrabold tracking-[-0.03em]">
            Comply<span className="text-[oklch(0.78_0.12_265)]">OS</span>
          </span>
        </Link>
        <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold">
          <Server className="h-3.5 w-3.5" />
          IT Service
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-6 pb-20">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">
            {step === "phone" ? "Step 1 of 2" : mode === "signup" ? "Create account" : "Sign in"}
          </div>
          <h1 className="text-[28px] font-extrabold tracking-[-0.03em]">
            {step === "phone"
              ? "Mobile sign in"
              : mode === "signup"
                ? "Set your PIN"
                : "Enter PIN"}
          </h1>
          <p className="mt-2 text-[14px] text-white/60">
            {step === "phone"
              ? "Indian mobile number + 6-digit PIN. One account per number — your compliance data stays private."
              : mode === "signup"
                ? `${displayPhone} — choose a PIN you'll remember. Used for sign in and WhatsApp reminders.`
                : `${displayPhone} — enter your PIN to continue.`}
          </p>

          {step === "phone" ? (
            <form onSubmit={continueToPin} className="mt-8 space-y-4">
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-white/80">Mobile number</label>
                <div className="flex overflow-hidden rounded-lg border border-white/15 bg-white/10">
                  <span className="flex items-center border-r border-white/15 px-3 text-[14px] font-bold text-white/70">+91</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="98100 27657"
                    className="flex-1 bg-transparent px-3 py-2.5 text-[14px] outline-none placeholder:text-white/30"
                  />
                </div>
              </div>
              {err && <p className="text-[12px] text-red-300">{err}</p>}
              <Btn type="submit" disabled={phone.replace(/\D/g, "").length < 10} className="w-full justify-center !bg-primary !py-3 !text-[14px] !text-primary-foreground">
                Continue <ArrowRight className="h-4 w-4" />
              </Btn>
            </form>
          ) : (
            <form onSubmit={verifyPin} className="mt-8 space-y-4">
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-white/80">6-digit PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  required
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="• • • • • •"
                  className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-3 text-center font-mono text-[20px] tracking-[0.35em] outline-none"
                />
              </div>
              {mode === "signup" && (
                <div>
                  <label className="mb-1.5 block text-[12px] font-semibold text-white/80">Confirm PIN</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    autoComplete="new-password"
                    required
                    maxLength={6}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="• • • • • •"
                    className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-3 text-center font-mono text-[20px] tracking-[0.35em] outline-none"
                  />
                </div>
              )}
              {info && <p className="text-[12px] text-sky-200">{info}</p>}
              {err && <p className="text-[12px] text-red-300">{err}</p>}
              <Btn type="submit" disabled={busy || pin.length < 6 || (mode === "signup" && confirmPin.length < 6)} className="w-full justify-center !bg-primary !py-3 !text-[14px] !text-primary-foreground">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {mode === "signup" ? "Create account" : "Sign in"}
              </Btn>
              <div className="flex flex-wrap gap-3 text-[13px]">
                <button type="button" onClick={() => { setStep("phone"); setPin(""); setConfirmPin(""); setErr(null); setInfo(null); }} className="text-white/50 hover:text-white/80">
                  ← Change number
                </button>
                {mode === "signup" ? (
                  <button type="button" onClick={() => { setMode("signin"); setConfirmPin(""); setInfo(null); }} className="text-white/50 hover:text-white/80">
                    Already have PIN? Sign in
                  </button>
                ) : (
                  <button type="button" onClick={() => { setMode("signup"); setInfo("Create a new account with this number."); }} className="text-white/50 hover:text-white/80">
                    New user? Sign up
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
