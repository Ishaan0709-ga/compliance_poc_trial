import type { ReactNode } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { founderStat } from "./founder-stat-styles";

export function FounderMetricCard({
  icon,
  title,
  value,
  trend,
  hint,
  tone = "neutral",
}: {
  icon: ReactNode;
  title: string;
  value: string;
  trend?: string;
  hint?: string;
  tone?: "up" | "down" | "neutral";
}) {
  const trendColor =
    tone === "up" ? "text-emerald-600" : tone === "down" ? "text-rose-600" : "text-ink-4";

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border/80 bg-gradient-to-br from-surface via-surface to-surface-2/60 p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-md">
      <div className="absolute -right-3 -top-3 h-16 w-16 rounded-full bg-primary/5 blur-2xl transition-opacity group-hover:opacity-100" />
      <div className="relative flex items-start justify-between gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 bg-background/80 text-primary shadow-sm">
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-0.5 text-[11px] font-semibold ${trendColor}`}>
            {tone === "up" && <TrendingUp className="h-3 w-3" />}
            {tone === "down" && <TrendingDown className="h-3 w-3" />}
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div className="relative mt-3">
        <div className={founderStat.labelCaps}>{title}</div>
        <div className={`mt-1 ${founderStat.valueMd}`}>{value}</div>
        {hint && <div className="mt-1 text-[11px] text-ink-3">{hint}</div>}
      </div>
    </div>
  );
}
