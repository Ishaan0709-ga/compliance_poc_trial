import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { ArrowLeft, Download, Save, Upload } from "lucide-react";
import { PortalShell } from "@/components/PortalShell";
import { FounderSpreadsheetGrid } from "@/components/founder/FounderSpreadsheetGrid";
import { EditableDataTable } from "@/components/founder/EditableDataTable";
import { Btn, Pill } from "@/components/ui-kit";
import { computeAllMonths } from "@/lib/founder-analytics/formulas";
import { exportFounderExcel, importFounderExcel } from "@/lib/founder-analytics/excel-import";
import { loadFounderAnalytics, saveFounderAnalytics } from "@/lib/founder-analytics/storage";
import {
  BURN_RUNWAY_SHEET_ROWS,
  CUSTOMER_METRICS_SHEET_ROWS,
  MRR_ARR_SHEET_ROWS,
  RAW_DATA_SHEET_ROWS,
  TEAM_OPS_SHEET_ROWS,
} from "@/lib/founder-analytics/sheet-definitions";
import type {
  ComplianceFiling,
  FounderAnalyticsState,
  MonthHeader,
  RawMonthlyInput,
} from "@/lib/founder-analytics/types";
import { MONTH_HEADERS } from "@/lib/founder-analytics/types";

export const Route = createFileRoute("/founder/data-center")({
  head: () => ({ meta: [{ title: "Data Center — ComplyOS" }] }),
  component: DataCenterPage,
});

type TabId =
  | "raw"
  | "mrr-arr"
  | "customer-metrics"
  | "burn-runway"
  | "team-ops"
  | "compliance";

const TABS: { id: TabId; label: string; excelSheet: string }[] = [
  { id: "raw", label: "Raw Data Input", excelSheet: "Raw Data Input" },
  { id: "mrr-arr", label: "MRR-ARR", excelSheet: "MRR-ARR" },
  { id: "customer-metrics", label: "Customer Metrics", excelSheet: "Customer Metrics" },
  { id: "burn-runway", label: "Burn-Runway", excelSheet: "Burn-Runway" },
  { id: "team-ops", label: "Team-Ops", excelSheet: "Team-Ops" },
  { id: "compliance", label: "Compliance", excelSheet: "—" },
];

function DataCenterPage() {
  const [state, setState] = useState<FounderAnalyticsState>(loadFounderAnalytics);
  const [tab, setTab] = useState<TabId>("raw");
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const computed = useMemo(() => computeAllMonths(state.months), [state.months]);

  const handleInputChange = useCallback(
    (monthIndex: number, key: keyof RawMonthlyInput, value: number) => {
      setState((s) => {
        const months = s.months.map((m, i) => (i === monthIndex ? { ...m, [key]: value } : m));
        return { ...s, months };
      });
      setSaved(false);
    },
    []
  );

  const handleSave = () => {
    saveFounderAnalytics(state);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleImport = async (file: File) => {
    const imported = await importFounderExcel(file);
    setState(imported);
    saveFounderAnalytics(imported);
    setSaved(true);
  };

  const updateCompliance = useCallback((compliance: ComplianceFiling[]) => {
    setState((s) => ({ ...s, compliance }));
    setSaved(false);
  }, []);

  const activeTab = TABS.find((t) => t.id === tab)!;

  return (
    <PortalShell portalId="founder">
      <div className="mb-5 flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            to="/founder"
            className="mb-2 inline-flex items-center gap-1 text-[12px] font-medium text-ink-4 hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
          </Link>
          <h1 className="text-[26px] font-extrabold tracking-[-0.03em] text-ink">Data Center</h1>
          <p className="mt-1 text-[13px] text-ink-3">
            Spreadsheet-aligned with <strong>ishaan_excel.xlsx</strong> — white cells are inputs, grey cells
            are formulas (same as Excel).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleImport(f);
              e.target.value = "";
            }}
          />
          <Btn variant="o" onClick={() => fileRef.current?.click()}>
            <Upload className="h-3.5 w-3.5" /> Import Excel
          </Btn>
          <Btn variant="o" onClick={() => exportFounderExcel(state)}>
            <Download className="h-3.5 w-3.5" /> Export Data
          </Btn>
          <Btn onClick={handleSave}>
            <Save className="h-3.5 w-3.5" /> Save Changes
          </Btn>
          {saved && <Pill tone="done">Saved</Pill>}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-1 rounded-xl border border-border bg-surface-2 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-2 text-[12px] font-bold transition-colors ${
              tab === t.id
                ? "bg-background text-primary shadow-sm"
                : "text-ink-4 hover:text-ink-2"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-ink-4">Reporting month</span>
          <select
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-[13px] font-medium"
            value={state.reportingMonth}
            onChange={(e) => {
              setState((s) => ({
                ...s,
                reportingMonth: e.target.value as MonthHeader,
              }));
              setSaved(false);
            }}
          >
            {MONTH_HEADERS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <Pill tone="infra">Sheet: {activeTab.excelSheet}</Pill>
      </div>

      {tab === "raw" && (
        <FounderSpreadsheetGrid
          title="Raw Data Input"
          subtitle="Enter monthly figures here. Source noted per section. All values in INR unless noted."
          rows={RAW_DATA_SHEET_ROWS}
          months={state.months}
          computed={computed}
          onInputChange={handleInputChange}
        />
      )}

      {tab === "mrr-arr" && (
        <FounderSpreadsheetGrid
          title="MRR-ARR"
          subtitle="Linked from Raw Data Input. Do not overwrite — updates automatically when inputs change."
          rows={MRR_ARR_SHEET_ROWS.map((r) => ({ ...r, kind: r.kind === "input" ? "computed" : r.kind }))}
          months={state.months}
          computed={computed}
        />
      )}

      {tab === "customer-metrics" && (
        <FounderSpreadsheetGrid
          title="Customer Metrics"
          subtitle="Gross margin is editable (yellow assumption in Excel). All other rows are calculated."
          rows={CUSTOMER_METRICS_SHEET_ROWS}
          months={state.months}
          computed={computed}
          onInputChange={handleInputChange}
        />
      )}

      {tab === "burn-runway" && (
        <FounderSpreadsheetGrid
          title="Burn & Runway"
          subtitle="Linked from Raw Data Input (Zoho Books P&L / Balance Sheet) and MRR-ARR."
          rows={BURN_RUNWAY_SHEET_ROWS}
          months={state.months}
          computed={computed}
        />
      )}

      {tab === "team-ops" && (
        <FounderSpreadsheetGrid
          title="Team & Ops"
          subtitle="Linked from Raw Data Input (Zoho People / Payroll) and MRR-ARR sheet."
          rows={TEAM_OPS_SHEET_ROWS}
          months={state.months}
          computed={computed}
        />
      )}

      {tab === "compliance" && (
        <EditableDataTable
          columns={[
            { key: "name", label: "Filing" },
            { key: "status", label: "Status" },
            { key: "dueDate", label: "Due Date" },
            { key: "daysRemaining", label: "Days Left", type: "number" },
          ]}
          rows={state.compliance.map((c) => ({
            id: c.id,
            name: c.name,
            status: c.status,
            dueDate: c.dueDate,
            daysRemaining: c.daysRemaining,
          }))}
          rowKey={(r) => String(r.id)}
          onChange={(rows) =>
            updateCompliance(
              rows.map((r) => ({
                id: String(r.id),
                name: String(r.name),
                status: (r.status as ComplianceFiling["status"]) || "upcoming",
                dueDate: String(r.dueDate),
                daysRemaining: Number(r.daysRemaining) || 0,
              }))
            )
          }
          onAddRow={() => ({
            id: `custom-${Date.now()}`,
            name: "New filing",
            status: "upcoming",
            dueDate: new Date().toISOString().slice(0, 10),
            daysRemaining: 30,
          })}
        />
      )}

      <p className="mt-4 text-[11px] text-ink-4">
        Matches <code className="rounded bg-surface-2 px-1">ishaan_excel.xlsx</code> structure. Import reads
        blue input cells from Raw Data Input + gross margin from Customer Metrics. Dashboard pulls the
        reporting month column — same as Excel Dashboard sheet cell D5.
      </p>
    </PortalShell>
  );
}
