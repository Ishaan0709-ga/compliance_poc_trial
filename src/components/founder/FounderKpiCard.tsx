import { founderChangeClass, founderStat } from "./founder-stat-styles";

export function FounderKpiCard({
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
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-card">
      <div className={founderStat.valueLg}>{value}</div>
      <div className={`mt-2 ${founderStat.label}`}>{label}</div>
      {change && <div className={`mt-1 ${founderChangeClass(tone)}`}>{change}</div>}
    </div>
  );
}
