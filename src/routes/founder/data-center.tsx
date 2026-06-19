import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { ArrowLeft, Download, Save, Upload } from "lucide-react";
import { PortalShell } from "@/components/PortalShell";
import { Btn, Pill } from "@/components/ui-kit";
import { EditableDataTable } from "@/components/founder/EditableDataTable";
import { exportFounderExcel, importFounderExcel } from "@/lib/founder-analytics/excel-import";
import { loadFounderAnalytics, saveFounderAnalytics } from "@/lib/founder-analytics/storage";
import type { ComplianceFiling, FounderAnalyticsState, MonthlyRecord } from "@/lib/founder-analytics/types";

export const Route = createFileRoute("/founder/data-center")({
  head: () => ({ meta: [{ title: "Data Center — ComplyOS" }] }),
  component: DataCenterPage,
});

type TabId = "revenue" | "customers" | "expenses" | "cashflow" | "compliance" | "team";

const TABS: { id: TabId; label: string }[] = [
  { id: "revenue", label: "Revenue" },
  { id: "customers", label: "Customers" },
  { id: "expenses", label: "Expenses" },
  { id: "cashflow", label: "Cashflow" },
  { id: "compliance", label: "Compliance" },
  { id: "team", label: "Team" },
];

function DataCenterPage() {
  const [state, setState] = useState<FounderAnalyticsState>(loadFounderAnalytics);
  const [tab, setTab] = useState<TabId>("revenue");
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const updateMonths = useCallback((months: MonthlyRecord[]) => {
    setState((s) => ({ ...s, months }));
    setSaved(false);
  }, []);

  const updateCompliance = useCallback((compliance: ComplianceFiling[]) => {
    setState((s) => ({ ...s, compliance }));
    setSaved(false);
  }, []);

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

  const revenueRows = state.months.map((m) => ({
    month: m.month,
    mrr: m.mrr,
    arr: m.arr,
    netNewMrr: m.netNewMrr,
    mrrGrowthMom: m.mrrGrowthMom != null ? (m.mrrGrowthMom * 100).toFixed(2) : "",
    activeCustomers: m.activeCustomers,
  }));

  const customerRows = state.months.map((m) => ({
    month: m.month,
    activeCustomers: m.activeCustomers,
    newCustomers: m.newCustomers,
    churned: m.churnedCustomers,
    cac: m.cac,
    ltv: m.ltv ?? "",
    churnPct: m.logoChurnRate != null ? (m.logoChurnRate * 100).toFixed(2) : "",
    nps: m.nps,
  }));

  const expenseRows = state.months.map((m) => ({
    month: m.month,
    revenue: m.revenue,
    opex: m.opex,
    netBurn: m.netBurn,
  }));

  const cashflowRows = state.months.map((m) => ({
    month: m.month,
    cashBalance: m.cashBalance,
    runwayMonths: m.runwayMonths,
    burnMultiple: m.burnMultiple ?? "",
  }));

  const teamRows = state.months.map((m) => ({
    month: m.month,
    headcount: m.headcount,
    openRoles: m.openRoles,
    attritionPct: m.attritionRate != null ? (m.attritionRate * 100).toFixed(2) : "",
    revPerEmployee: m.revenuePerEmployee,
    leads: m.leads,
    qualified: m.qualified,
    demos: m.demos,
    closedWon: m.closedWon,
  }));

  const syncFromTable = <K extends keyof MonthlyRecord>(
    rows: Record<string, unknown>[],
    mapper: (row: Record<string, unknown>, prev: MonthlyRecord) => MonthlyRecord
  ) => {
    const next = state.months.map((prev, i) => mapper(rows[i] ?? {}, prev));
    updateMonths(next);
  };

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
            Manage business metrics — spreadsheet-style editing. Source: ishaan_excel.xlsx structure.
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
            className={`rounded-lg px-4 py-2 text-[12px] font-bold transition-colors ${
              tab === t.id
                ? "bg-background text-primary shadow-sm"
                : "text-ink-4 hover:text-ink-2"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mb-3 flex items-center gap-2">
        <span className="text-[12px] text-ink-4">Reporting month</span>
        <select
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-[13px] font-medium"
          value={state.reportingMonth}
          onChange={(e) => {
            setState((s) => ({ ...s, reportingMonth: e.target.value }));
            setSaved(false);
          }}
        >
          {state.months.map((m) => (
            <option key={m.month} value={m.month}>
              {m.month}
            </option>
          ))}
        </select>
      </div>

      {tab === "revenue" && (
        <EditableDataTable
          columns={[
            { key: "month", label: "Month", readOnly: true },
            { key: "mrr", label: "MRR", type: "number" },
            { key: "arr", label: "ARR", type: "number" },
            { key: "netNewMrr", label: "Net New MRR", type: "number" },
            { key: "mrrGrowthMom", label: "MRR Growth %", type: "number" },
            { key: "activeCustomers", label: "Customers", type: "number" },
          ]}
          rows={revenueRows}
          rowKey={(r) => String(r.month)}
          onChange={(rows) =>
            syncFromTable(rows, (row, prev) => ({
              ...prev,
              mrr: Number(row.mrr) || 0,
              arr: Number(row.arr) || prev.mrr * 12,
              netNewMrr: Number(row.netNewMrr) || prev.netNewMrr,
              mrrGrowthMom:
                row.mrrGrowthMom === "" || row.mrrGrowthMom == null
                  ? prev.mrrGrowthMom
                  : Number(row.mrrGrowthMom) / 100,
              activeCustomers: Number(row.activeCustomers) || prev.activeCustomers,
            }))
          }
        />
      )}

      {tab === "customers" && (
        <EditableDataTable
          columns={[
            { key: "month", label: "Month", readOnly: true },
            { key: "activeCustomers", label: "Customers", type: "number" },
            { key: "newCustomers", label: "New", type: "number" },
            { key: "churned", label: "Churned", type: "number" },
            { key: "cac", label: "CAC", type: "number" },
            { key: "ltv", label: "LTV", type: "number" },
            { key: "churnPct", label: "Churn %", type: "number" },
            { key: "nps", label: "NPS", type: "number" },
          ]}
          rows={customerRows}
          rowKey={(r) => String(r.month)}
          onChange={(rows) =>
            syncFromTable(rows, (row, prev) => ({
              ...prev,
              activeCustomers: Number(row.activeCustomers) || prev.activeCustomers,
              newCustomers: Number(row.newCustomers) || 0,
              churnedCustomers: Number(row.churned) || 0,
              cac: Number(row.cac) || prev.cac,
              ltv: row.ltv === "" ? null : Number(row.ltv) || prev.ltv,
              logoChurnRate:
                row.churnPct === "" ? prev.logoChurnRate : Number(row.churnPct) / 100,
              nps: Number(row.nps) || prev.nps,
            }))
          }
        />
      )}

      {tab === "expenses" && (
        <EditableDataTable
          columns={[
            { key: "month", label: "Month", readOnly: true },
            { key: "revenue", label: "Revenue", type: "number" },
            { key: "opex", label: "OpEx", type: "number" },
            { key: "netBurn", label: "Net Burn", type: "number" },
          ]}
          rows={expenseRows}
          rowKey={(r) => String(r.month)}
          onChange={(rows) =>
            syncFromTable(rows, (row, prev) => {
              const revenue = Number(row.revenue) || 0;
              const opex = Number(row.opex) || 0;
              return {
                ...prev,
                revenue,
                opex,
                netBurn: Number(row.netBurn) || opex - revenue,
              };
            })
          }
        />
      )}

      {tab === "cashflow" && (
        <EditableDataTable
          columns={[
            { key: "month", label: "Month", readOnly: true },
            { key: "cashBalance", label: "Cash Balance", type: "number" },
            { key: "runwayMonths", label: "Runway (mo)", type: "number" },
            { key: "burnMultiple", label: "Burn Multiple", type: "number" },
          ]}
          rows={cashflowRows}
          rowKey={(r) => String(r.month)}
          onChange={(rows) =>
            syncFromTable(rows, (row, prev) => ({
              ...prev,
              cashBalance: Number(row.cashBalance) || prev.cashBalance,
              runwayMonths: Number(row.runwayMonths) || prev.runwayMonths,
              burnMultiple:
                row.burnMultiple === "" ? prev.burnMultiple : Number(row.burnMultiple),
            }))
          }
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

      {tab === "team" && (
        <EditableDataTable
          columns={[
            { key: "month", label: "Month", readOnly: true },
            { key: "headcount", label: "Headcount", type: "number" },
            { key: "openRoles", label: "Open Roles", type: "number" },
            { key: "attritionPct", label: "Attrition %", type: "number" },
            { key: "revPerEmployee", label: "Rev / Employee", type: "number" },
            { key: "leads", label: "Leads", type: "number" },
            { key: "qualified", label: "Qualified", type: "number" },
            { key: "demos", label: "Demos", type: "number" },
            { key: "closedWon", label: "Closed Won", type: "number" },
          ]}
          rows={teamRows}
          rowKey={(r) => String(r.month)}
          onChange={(rows) =>
            syncFromTable(rows, (row, prev) => ({
              ...prev,
              headcount: Number(row.headcount) || prev.headcount,
              openRoles: Number(row.openRoles) || 0,
              attritionRate:
                row.attritionPct === "" ? prev.attritionRate : Number(row.attritionPct) / 100,
              revenuePerEmployee: Number(row.revPerEmployee) || prev.revenuePerEmployee,
              leads: Number(row.leads) || 0,
              qualified: Number(row.qualified) || 0,
              demos: Number(row.demos) || 0,
              closedWon: Number(row.closedWon) || 0,
            }))
          }
        />
      )}

      <p className="mt-4 text-[11px] text-ink-4">
        Click any cell to edit. Save Changes updates the dashboard instantly. Import reads{" "}
        <code className="rounded bg-surface-2 px-1">ishaan_excel.xlsx</code> Raw Data Input sheet.
      </p>
    </PortalShell>
  );
}
