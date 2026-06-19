/** Founder dashboard / KPI number typography — bold sans, not mono */
export const founderStat = {
  /** Hero KPI cards — ₹1.76 Cr */
  valueLg: "text-[26px] font-bold leading-none tracking-[-0.03em] text-slate-900 tabular-nums",
  /** Metric cards — MRR row */
  valueMd: "text-[22px] font-bold leading-none tracking-[-0.02em] text-slate-900 tabular-nums",
  /** Table rows, side panels */
  valueSm: "text-[15px] font-bold tracking-[-0.02em] text-slate-900 tabular-nums",
  /** Inline stats, chart header */
  valueXs: "text-[14px] font-bold tracking-[-0.01em] text-slate-900 tabular-nums",
  label: "text-[12px] font-normal text-slate-500",
  labelCaps: "text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500",
  changeUp: "text-[11px] font-medium text-emerald-600",
  changeDown: "text-[11px] font-medium text-rose-600",
  changeNeutral: "text-[11px] font-medium text-slate-500",
} as const;

export function founderChangeClass(tone: "up" | "dn" | "neu" = "neu") {
  if (tone === "up") return founderStat.changeUp;
  if (tone === "dn") return founderStat.changeDown;
  return founderStat.changeNeutral;
}
