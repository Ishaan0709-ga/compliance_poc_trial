import { useCallback, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Btn } from "@/components/ui-kit";

export type TableColumn<T extends Record<string, unknown>> = {
  key: keyof T & string;
  label: string;
  type?: "text" | "number";
  readOnly?: boolean;
};

export function EditableDataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  onChange,
  onAddRow,
  rowKey,
}: {
  columns: TableColumn<T>[];
  rows: T[];
  onChange: (rows: T[]) => void;
  onAddRow?: () => T;
  rowKey: (row: T, index: number) => string;
}) {
  const [editing, setEditing] = useState<{ row: number; col: string } | null>(null);

  const updateCell = useCallback(
    (rowIdx: number, key: string, raw: string) => {
      const next = rows.map((r, i) => {
        if (i !== rowIdx) return r;
        const col = columns.find((c) => c.key === key);
        const value =
          col?.type === "number"
            ? raw === "" || raw === "—"
              ? null
              : Number(raw.replace(/,/g, ""))
            : raw;
        return { ...r, [key]: value };
      });
      onChange(next);
    },
    [columns, onChange, rows]
  );

  const deleteRow = (idx: number) => {
    onChange(rows.filter((_, i) => i !== idx));
  };

  const addRow = () => {
    if (!onAddRow) return;
    onChange([...rows, onAddRow()]);
  };

  const displayValue = (val: unknown) => {
    if (val == null) return "";
    if (typeof val === "number") return String(val);
    return String(val);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-border bg-surface-2/80">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="whitespace-nowrap px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-ink-4"
                >
                  {col.label}
                </th>
              ))}
              <th className="w-10 px-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={rowKey(row, rowIdx)} className="border-b border-border/60 hover:bg-surface-2/40">
                {columns.map((col) => {
                  const isEditing = editing?.row === rowIdx && editing.col === col.key;
                  const val = row[col.key];
                  return (
                    <td key={col.key} className="px-1 py-0.5">
                      {col.readOnly ? (
                        <div className="px-2 py-1.5 font-medium text-ink-3">{displayValue(val)}</div>
                      ) : (
                        <input
                          className={`w-full min-w-[88px] rounded-md border px-2 py-1.5 text-[12px] font-semibold tabular-nums tracking-[-0.01em] outline-none transition-colors ${
                            isEditing
                              ? "border-primary bg-white text-ink ring-1 ring-primary/30"
                              : "border-slate-200 bg-white text-slate-900 hover:border-slate-300"
                          }`}
                          value={displayValue(val)}
                          onFocus={() => setEditing({ row: rowIdx, col: col.key })}
                          onBlur={() => setEditing(null)}
                          onChange={(e) => updateCell(rowIdx, col.key, e.target.value)}
                        />
                      )}
                    </td>
                  );
                })}
                <td className="px-2">
                  <button
                    type="button"
                    onClick={() => deleteRow(rowIdx)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-ink-4 hover:bg-destructive-muted hover:text-destructive"
                    title="Delete row"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {onAddRow && (
        <div className="border-t border-border bg-surface-2/40 px-3 py-2">
          <Btn variant="o" className="!py-1.5 !text-[12px]" onClick={addRow}>
            <Plus className="h-3.5 w-3.5" /> Add row
          </Btn>
        </div>
      )}
    </div>
  );
}
