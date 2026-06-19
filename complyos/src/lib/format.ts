export function inr(n: number | null | undefined, opts: { compact?: boolean } = {}) {
  if (n == null || isNaN(Number(n))) return "—";
  const v = Number(n);
  if (opts.compact) {
    const abs = Math.abs(v);
    if (abs >= 1e7) return `${v < 0 ? "-" : ""}₹ ${(abs / 1e7).toFixed(2)} Cr`;
    if (abs >= 1e5) return `${v < 0 ? "-" : ""}₹ ${(abs / 1e5).toFixed(2)} L`;
    if (abs >= 1e3) return `${v < 0 ? "-" : ""}₹ ${(abs / 1e3).toFixed(1)}k`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(v);
}

export function pct(n: number | null | undefined, digits = 1) {
  if (n == null || isNaN(Number(n))) return "—";
  const sign = n > 0 ? "↑" : n < 0 ? "↓" : "·";
  return `${sign} ${Math.abs(n).toFixed(digits)}%`;
}

export function dateShort(s?: string | null) {
  if (!s) return "—";
  const d = new Date(s);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}
