/** Local calendar date as YYYY-MM-DD (avoids UTC off-by-one in IST) */
export function ymd(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseYmd(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function daysBetween(from: string, to: string): number {
  const a = parseYmd(from);
  const b = parseYmd(to);
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export function formatDateLabel(iso: string): string {
  return parseYmd(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}
