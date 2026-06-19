import { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-[13px] text-ink-3">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({
  children,
  className = "",
  title,
  action,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-surface p-5 shadow-card ${className}`}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between">
          {title && (
            <div className="text-[12px] font-medium text-ink-3">{title}</div>
          )}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function Kpi({
  value,
  label,
  change,
  tone = "neu",
}: {
  value: string;
  label: string;
  change?: string;
  tone?: "up" | "dn" | "neu";
}) {
  const toneCls =
    tone === "up" ? "text-success" : tone === "dn" ? "text-destructive" : "text-ink-4";
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-card">
      <div className="text-[26px] font-semibold leading-none tracking-[-0.03em] text-ink">
        {value}
      </div>
      <div className="mt-2 text-[12px] text-ink-3">{label}</div>
      {change && <div className={`mt-1 text-[11px] font-medium ${toneCls}`}>{change}</div>}
    </div>
  );
}

export function Pill({
  children,
  tone = "n",
}: {
  children: ReactNode;
  tone?: "done" | "pend" | "miss" | "n" | "infra";
}) {
  const map = {
    done: "bg-success-muted text-success",
    pend: "bg-warning-muted text-warning",
    miss: "bg-destructive-muted text-destructive",
    n: "bg-surface-2 text-ink-3",
    infra: "bg-purple-muted text-purple",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-[10.5px] font-medium ${map[tone]}`}
    >
      {children}
    </span>
  );
}

export function Btn({
  children,
  variant = "p",
  className = "",
  ...rest
}: {
  children: ReactNode;
  variant?: "p" | "o" | "d" | "g";
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const map = {
    p: "bg-primary text-primary-foreground hover:bg-primary/90",
    o: "bg-surface text-ink-2 border border-border hover:bg-surface-2",
    d: "bg-destructive-muted text-destructive border border-destructive-border hover:bg-destructive-muted/80",
    g: "bg-transparent text-ink-3 hover:text-ink hover:bg-surface-2",
  } as const;
  return (
    <button
      className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors ${map[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ScoreRing({
  score,
  label,
  reg,
  tone = "g",
}: {
  score: number;
  label?: string;
  reg: string;
  tone?: "g" | "a" | "r";
}) {
  const stroke =
    tone === "g"
      ? "var(--success)"
      : tone === "a"
        ? "var(--warning)"
        : "var(--destructive)";
  const c = 2 * Math.PI * 18;
  const off = c - (score / 100) * c;
  return (
    <div className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-md">
      <div className="relative h-12 w-12 flex-shrink-0">
        <svg viewBox="0 0 44 44" className="-rotate-90">
          <circle cx="22" cy="22" r="18" stroke="var(--border)" strokeWidth="3.5" fill="none" />
          <circle
            cx="22"
            cy="22"
            r="18"
            stroke={stroke}
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={c}
            strokeDashoffset={off}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-mono text-[11px] font-semibold">
          {score}
        </div>
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-[0.1em] text-ink-4">{reg}</div>
        <div className="text-[20px] font-semibold leading-none tracking-[-0.02em] text-ink">
          {score}%
        </div>
        {label && <div className="mt-0.5 text-[11px] text-ink-4">{label}</div>}
      </div>
    </div>
  );
}

export function Banner({
  tone,
  icon,
  text,
  cta,
}: {
  tone: "danger" | "warn" | "info";
  icon: ReactNode;
  text: string;
  cta?: string;
}) {
  const map = {
    danger: "bg-destructive-muted/60 border-destructive-border/60",
    warn: "bg-warning-muted/60 border-warning-border/60",
    info: "bg-primary-muted/60 border-primary-border/60",
  } as const;
  const iconTone = {
    danger: "text-destructive",
    warn: "text-warning",
    info: "text-primary",
  } as const;
  return (
    <div
      className={`mb-4 flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5 ${map[tone]}`}
    >
      <span className={`flex-shrink-0 ${iconTone[tone]}`}>{icon}</span>
      <span className="flex-1 text-[13px] text-ink-2">{text}</span>
      {cta && <span className={`whitespace-nowrap text-[12px] font-medium ${iconTone[tone]}`}>{cta} →</span>}
    </div>
  );
}

export function SectionTitle({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">{children}</h2>
      {hint && <span className="text-[11px] text-ink-4">{hint}</span>}
    </div>
  );
}
