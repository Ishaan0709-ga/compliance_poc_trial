import { Link } from "@tanstack/react-router";
import { ShieldCheck, Sparkles } from "lucide-react";

export function AuthBrandPanel({
  title,
  subtitle,
  badge,
}: {
  title: React.ReactNode;
  subtitle: string;
  badge?: string;
}) {
  return (
    <div className="relative hidden overflow-hidden bg-gradient-onboard text-white md:flex md:flex-col md:justify-between md:p-10 lg:p-12">
      <div className="absolute inset-0 grid-bg pointer-events-none opacity-50" />
      <div className="absolute -right-24 top-1/4 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      <div className="relative flex items-center gap-2.5">
        <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
            <ShieldCheck className="h-5 w-5" strokeWidth={2.4} />
          </div>
          <span className="text-[20px] font-extrabold tracking-[-0.03em]">
            Comply<span className="text-[oklch(0.78_0.12_265)]">OS</span>
          </span>
        </Link>
      </div>
      <div className="relative max-w-md">
        {badge && (
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[oklch(0.82_0.1_265)]">
            <Sparkles className="h-3 w-3" /> {badge}
          </div>
        )}
        <h1 className="text-[36px] font-extrabold leading-[1.08] tracking-[-0.04em] lg:text-[42px]">
          {title}
        </h1>
        <p className="mt-4 text-[14px] leading-relaxed text-white/65">{subtitle}</p>
      </div>
      <div className="relative text-[11px] text-white/40">
        © {new Date().getFullYear()} ComplyOS · Secure · DPDP-ready
      </div>
    </div>
  );
}

export function AuthMobileHeader() {
  return (
    <div className="mb-8 flex items-center gap-2.5 md:hidden">
      <Link to="/" className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ShieldCheck className="h-4 w-4" strokeWidth={2.4} />
        </div>
        <span className="text-[18px] font-extrabold tracking-[-0.03em] text-ink">
          Comply<span className="text-primary">OS</span>
        </span>
      </Link>
    </div>
  );
}

export function AuthModeTabs<T extends string>({
  value,
  onChange,
  tabs,
}: {
  value: T;
  onChange: (v: T) => void;
  tabs: { id: T; label: string }[];
}) {
  return (
    <div className="mb-6 flex rounded-xl border border-border bg-surface-2 p-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={`flex-1 rounded-lg py-2 text-[13px] font-bold transition-all ${
            value === t.id
              ? "bg-white text-primary shadow-sm"
              : "text-ink-4 hover:text-ink-2"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
