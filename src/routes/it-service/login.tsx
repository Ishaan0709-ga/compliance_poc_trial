import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowRight,
  KeyRound,
  Loader2,
  Phone,
  Server,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { AuthMessage, PinInput } from "@/components/auth/AuthField";
import { resetItServicePin } from "@/lib/auth.functions";
import { supabase } from "@/integrations/supabase/client";
import {
  formatPhoneDisplay,
  normalizeIndianPhone,
  registerWithPhonePin,
  setITServiceUserId,
  signInWithPhonePin,
} from "@/lib/it-service/auth";
import { loadState } from "@/lib/it-service/storage";

type LoginSearch = { redirect?: string };

type Flow = "signin" | "signup" | "forgot";
type Step = "phone" | "pin" | "forgot-pin";

export const Route = createFileRoute("/it-service/login")({
  head: () => ({
    meta: [{ title: "Sign in — IT Service — ComplyOS" }],
  }),
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: ITServiceLoginPage,
});

function StepPill({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${active ? "text-white" : done ? "text-white/70" : "text-white/35"}`}>
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
          active ? "bg-primary text-primary-foreground" : done ? "bg-white/20" : "bg-white/10"
        }`}
      >
        {done ? "✓" : n}
      </span>
      <span className="text-[12px] font-semibold">{label}</span>
    </div>
  );
}

function ITServiceLoginPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const resetPinFn = useServerFn(resetItServicePin);

  const [flow, setFlow] = useState<Flow>("signin");
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const goNext = useCallback(() => {
    const state = loadState();
    if (redirect?.startsWith("/it-service")) {
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

  const digits = phone.replace(/\D/g, "");
  const displayPhone = formatPhoneDisplay(normalizeIndianPhone(phone));

  const resetForm = () => {
    setErr(null);
    setInfo(null);
    setPin("");
    setConfirmPin("");
  };

  const continueFromPhone = (e: React.FormEvent) => {
    e.preventDefault();
    resetForm();
    if (digits.length < 10) {
      setErr("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    setStep(flow === "forgot" ? "forgot-pin" : "pin");
  };

  const submitPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setInfo(null);

    if (pin.length !== 6) {
      setErr("Enter your 6-digit PIN.");
      return;
    }

    setBusy(true);
    try {
      if (flow === "signup") {
        if (confirmPin.length !== 6) {
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
        setInfo("Account created successfully.");
        goNext();
        return;
      }

      const { user, error } = await signInWithPhonePin(phone, pin);
      if (user) {
        setITServiceUserId(user.id);
        goNext();
        return;
      }
      setErr(error ?? "Could not sign in.");
    } finally {
      setBusy(false);
    }
  };

  const submitForgotPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setInfo(null);

    if (pin.length !== 6 || confirmPin.length !== 6) {
      setErr("Enter and confirm your new 6-digit PIN.");
      return;
    }
    if (pin !== confirmPin) {
      setErr("PINs do not match.");
      return;
    }

    setBusy(true);
    try {
      const result = await resetPinFn({ data: { phone: digits, newPin: pin } });
      if (!result.ok) {
        setErr(result.error);
        return;
      }
      const { user, error } = await signInWithPhonePin(phone, pin);
      if (user) {
        setITServiceUserId(user.id);
        setInfo("PIN reset successful. Redirecting…");
        goNext();
        return;
      }
      setInfo("PIN updated. Sign in with your new PIN.");
      setFlow("signin");
      setStep("pin");
      setConfirmPin("");
    } finally {
      setBusy(false);
    }
  };

  const stepNum = step === "phone" ? 1 : 2;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-onboard text-white">
      <div className="absolute inset-0 grid-bg pointer-events-none opacity-40" />
      <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
      <div className="absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-cyan/20 blur-3xl" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <ShieldCheck className="h-4 w-4" strokeWidth={2.4} />
          </div>
          <span className="text-[17px] font-extrabold tracking-[-0.03em]">
            Comply<span className="text-[oklch(0.78_0.12_265)]">OS</span>
          </span>
        </Link>
        <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-bold backdrop-blur">
          <Server className="h-3.5 w-3.5 text-cyan" />
          IT Service
        </div>
      </header>

      <div className="relative z-10 flex flex-1 items-center justify-center px-6 pb-16 pt-4">
        <div className="w-full max-w-[420px]">
          {step === "phone" && flow !== "forgot" && (
            <div className="mb-6 flex rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur">
              {(
                [
                  { id: "signin" as const, label: "Sign in", icon: KeyRound },
                  { id: "signup" as const, label: "Sign up", icon: UserPlus },
                ] as const
              ).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setFlow(id);
                    resetForm();
                  }}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-[13px] font-bold transition-all ${
                    flow === id ? "bg-white/15 text-white shadow-sm" : "text-white/50 hover:text-white/75"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-7 shadow-2xl shadow-black/20 backdrop-blur-md">
            <div className="mb-5 flex items-center gap-3">
              <StepPill n={1} label="Mobile" active={stepNum === 1} done={stepNum > 1} />
              <div className="h-px flex-1 bg-white/10" />
              <StepPill
                n={2}
                label={flow === "forgot" ? "New PIN" : flow === "signup" ? "Set PIN" : "PIN"}
                active={stepNum === 2}
                done={false}
              />
            </div>

            <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">
              {step === "phone"
                ? flow === "signup"
                  ? "Create account"
                  : "Sign in"
                : flow === "forgot"
                  ? "Reset PIN"
                  : flow === "signup"
                    ? "Set your PIN"
                    : "Enter PIN"}
            </div>
            <h1 className="text-[26px] font-extrabold tracking-[-0.03em]">
              {step === "phone"
                ? flow === "signup"
                  ? "Register with mobile"
                  : "Welcome back"
                : flow === "forgot"
                  ? "Choose a new PIN"
                  : flow === "signup"
                    ? "Create your PIN"
                    : "Enter your PIN"}
            </h1>
            <p className="mt-2 text-[13px] leading-relaxed text-white/55">
              {step === "phone"
                ? "Indian mobile (+91) and a 6-digit PIN. One account per number — your compliance data stays private."
                : flow === "forgot"
                  ? `${displayPhone} — set a new 6-digit PIN you'll use to sign in.`
                  : `${displayPhone} — ${flow === "signup" ? "choose a PIN you'll remember." : "enter the PIN you set at registration."}`}
            </p>

            {step === "phone" ? (
              <form onSubmit={continueFromPhone} className="mt-7 space-y-4">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-white/80">
                    <Phone className="h-3.5 w-3.5" /> Mobile number
                  </label>
                  <div className="flex overflow-hidden rounded-xl border border-white/15 bg-white/10 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
                    <span className="flex items-center border-r border-white/15 px-3.5 text-[14px] font-bold text-white/70">
                      +91
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="98765 43210"
                      className="flex-1 bg-transparent px-3 py-3 text-[15px] font-medium tracking-wide outline-none placeholder:text-white/25"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-white/40">10 digits, no country code needed.</p>
                </div>

                {err && <AuthMessage tone="error">{err}</AuthMessage>}

                <button
                  type="submit"
                  disabled={digits.length < 10}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-[14px] font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>

                {flow === "signin" && (
                  <button
                    type="button"
                    onClick={() => {
                      setFlow("forgot");
                      resetForm();
                    }}
                    className="w-full text-center text-[13px] font-medium text-white/50 hover:text-white/80"
                  >
                    Forgot PIN?
                  </button>
                )}
                {flow === "forgot" && (
                  <button
                    type="button"
                    onClick={() => {
                      setFlow("signin");
                      resetForm();
                    }}
                    className="w-full text-center text-[13px] font-medium text-white/50 hover:text-white/80"
                  >
                    ← Back to sign in
                  </button>
                )}
              </form>
            ) : step === "forgot-pin" ? (
              <form onSubmit={submitForgotPin} className="mt-7 space-y-4">
                <PinInput label="New 6-digit PIN" value={pin} onChange={setPin} autoComplete="new-password" />
                <PinInput label="Confirm PIN" value={confirmPin} onChange={setConfirmPin} autoComplete="new-password" />
                {err && <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-200">{err}</p>}
                {info && <p className="rounded-xl border border-sky-400/30 bg-sky-500/10 px-3 py-2 text-[12px] text-sky-100">{info}</p>}
                <button
                  type="submit"
                  disabled={busy || pin.length < 6 || confirmPin.length < 6}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-[14px] font-bold text-primary-foreground disabled:opacity-50"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Reset PIN & sign in
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("phone");
                    setFlow("signin");
                    resetForm();
                  }}
                  className="text-[13px] text-white/50 hover:text-white/80"
                >
                  ← Back
                </button>
              </form>
            ) : (
              <form onSubmit={submitPin} className="mt-7 space-y-4">
                <PinInput
                  label={flow === "signup" ? "Choose 6-digit PIN" : "6-digit PIN"}
                  value={pin}
                  onChange={setPin}
                  autoComplete={flow === "signup" ? "new-password" : "current-password"}
                />
                {flow === "signup" && (
                  <PinInput label="Confirm PIN" value={confirmPin} onChange={setConfirmPin} autoComplete="new-password" />
                )}
                {err && <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-200">{err}</p>}
                {info && <p className="rounded-xl border border-sky-400/30 bg-sky-500/10 px-3 py-2 text-[12px] text-sky-100">{info}</p>}
                <button
                  type="submit"
                  disabled={busy || pin.length < 6 || (flow === "signup" && confirmPin.length < 6)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-[14px] font-bold text-primary-foreground disabled:opacity-50"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {flow === "signup" ? "Create account" : "Sign in"}
                </button>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("phone");
                      resetForm();
                    }}
                    className="text-white/50 hover:text-white/80"
                  >
                    ← Change number
                  </button>
                  {flow === "signin" && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setFlow("forgot");
                          setStep("forgot-pin");
                          resetForm();
                        }}
                        className="text-white/50 hover:text-white/80"
                      >
                        Forgot PIN?
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFlow("signup");
                          setPin("");
                          setConfirmPin("");
                          setErr(null);
                        }}
                        className="font-medium text-primary-foreground/80 hover:text-white"
                      >
                        New user? Sign up
                      </button>
                    </>
                  )}
                  {flow === "signup" && (
                    <button
                      type="button"
                      onClick={() => {
                        setFlow("signin");
                        setConfirmPin("");
                        setErr(null);
                      }}
                      className="text-white/50 hover:text-white/80"
                    >
                      Already registered? Sign in
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>

          <div className="mt-6 flex flex-col items-center gap-2 text-center text-[12px] text-white/40 sm:flex-row sm:justify-between">
            <Link to="/" className="hover:text-white/65">
              ← Main site
            </Link>
            <Link to="/login" className="hover:text-white/65">
              Founder / Admin login →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
