import { useCallback, useState } from "react";
import type { ComputedMonth, RawMonthlyInput } from "@/lib/founder-analytics/types";
import {
  formatSheetValue,
  getCellValue,
  resolveRawRowKind,
  type SheetRowDef,
} from "@/lib/founder-analytics/sheet-definitions";

type Props = {
  title: string;
  subtitle?: string;
  rows: SheetRowDef[];
  months: RawMonthlyInput[];
  computed: ComputedMonth[];
  onInputChange?: (monthIndex: number, key: keyof RawMonthlyInput, value: number) => void;
};

const NA_KEYS: (keyof ComputedMonth)[] = [
  "mrrGrowthMom",
  "mrrChurnRate",
  "customerChurnRate",
  "ltv",
  "ltvCacRatio",
  "logoChurnRate",
  "nrr",
  "attritionRate",
];

function cellClass(editable: boolean, focused: boolean): string {
  if (editable) {
    return focused
      ? "border-primary bg-white text-slate-900 ring-1 ring-primary/30"
      : "border-slate-200 bg-white text-slate-900 hover:border-slate-300";
  }
  return "border-transparent bg-slate-100 text-slate-600";
}

function displayCellValue(
  row: SheetRowDef,
  colIdx: number,
  value: number | null
): string {
  if (value == null) {
    if (colIdx === 0 && row.computedKey && NA_KEYS.includes(row.computedKey)) return "n/a";
    return "";
  }
  if (row.inputKey === "grossMarginAssumption" && row.kind === "input") {
    return String(value);
  }
  return formatSheetValue(value, row.format);
}

export function FounderSpreadsheetGrid({
  title,
  subtitle,
  rows,
  months,
  computed,
  onInputChange,
}: Props) {
  const [focused, setFocused] = useState<{ row: number; col: number } | null>(null);

  const update = useCallback(
    (monthIndex: number, key: keyof RawMonthlyInput, raw: string) => {
      if (!onInputChange) return;
      const n = raw === "" ? 0 : Number(raw.replace(/,/g, ""));
      if (Number.isNaN(n)) return;
      onInputChange(monthIndex, key, n);
    },
    [onInputChange]
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
      <div className="border-b border-border bg-surface-2/60 px-4 py-3">
        <h2 className="text-[15px] font-bold text-ink">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[12px] text-ink-4">{subtitle}</p>}
        <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-ink-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-6 rounded border border-slate-200 bg-white" /> Input (editable)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-6 rounded bg-slate-100" /> Formula (calculated)
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-max border-collapse text-[12px]">
          <thead>
            <tr className="border-b border-border bg-slate-50">
              <th className="sticky left-0 z-10 min-w-[280px] max-w-[360px] border-r border-border bg-slate-50 px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wide text-ink-4">
                Parameter
              </th>
              {months.map((m) => (
                <th
                  key={m.month}
                  className="min-w-[96px] whitespace-nowrap px-2 py-2 text-center text-[11px] font-bold text-ink-3"
                >
                  {m.month}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => {
              if (row.kind === "section") {
                return (
                  <tr key={`sec-${rowIdx}`} className="bg-primary-muted/20">
                    <td
                      colSpan={months.length + 1}
                      className="px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-primary"
                    >
                      {row.label}
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={`${row.label}-${rowIdx}`} className="border-b border-border/50 hover:bg-surface-2/30">
                  <td className="sticky left-0 z-10 border-r border-border bg-surface px-3 py-1.5 text-[12px] font-medium text-ink-2">
                    {row.label}
                  </td>
                  {months.map((input, colIdx) => {
                    const kind = resolveRawRowKind(row, colIdx);
                    const editable = kind === "input" && !!onInputChange && !!row.inputKey;
                    const comp = computed[colIdx];
                    const value = getCellValue(row, colIdx, input, comp);
                    const display = displayCellValue(row, colIdx, value);
                    const isFocused = focused?.row === rowIdx && focused?.col === colIdx;

                    return (
                      <td key={input.month} className="px-1 py-0.5">
                        {editable && row.inputKey ? (
                          <input
                            type="text"
                            className={`w-full min-w-[88px] rounded border px-2 py-1.5 text-right text-[12px] font-semibold tabular-nums outline-none transition-colors ${cellClass(true, isFocused)}`}
                            value={value ?? ""}
                            onFocus={() => setFocused({ row: rowIdx, col: colIdx })}
                            onBlur={() => setFocused(null)}
                            onChange={(e) => update(colIdx, row.inputKey!, e.target.value)}
                          />
                        ) : (
                          <div
                            className={`min-w-[88px] rounded border px-2 py-1.5 text-right text-[12px] font-medium tabular-nums ${cellClass(false, false)}`}
                          >
                            {display}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
