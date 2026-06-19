import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useITService } from "@/lib/it-service/context";
import { ITServiceShell } from "@/components/it-service/ITServiceShell";
import { RequireOnboarding } from "@/components/it-service/RequireOnboarding";
import { PageHeader, Card, Pill, Btn } from "@/components/ui-kit";
import { getCompliance, DOMAINS } from "@/lib/it-service/master-data";
import { domainBadge } from "@/lib/it-service/domain-labels";
import type { CalendarItem, CalendarStatus } from "@/lib/it-service/types";
import { ComplianceEvidencePanel } from "@/components/it-service/ComplianceEvidenceActions";
import {
  STATUS_STYLES,
  WEEKDAYS,
  buildMonthGrid,
  chipClass,
} from "@/lib/it-service/calendar-ui";
import { parseYmd } from "@/lib/it-service/date-utils";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/it-service/calendar")({
  component: CalendarPage,
});

type ViewMode = "month" | "quarter" | "year" | "list";

function CalendarPage() {
  return (
    <RequireOnboarding>
      <CalendarContent />
    </RequireOnboarding>
  );
}

function MonthGrid({
  year,
  month,
  items,
  compact = false,
  onSelectItem,
}: {
  year: number;
  month: number;
  items: CalendarItem[];
  compact?: boolean;
  onSelectItem?: (id: string) => void;
}) {
  const cells = buildMonthGrid(year, month, items);
  const label = new Date(year, month, 1).toLocaleString("en-IN", {
    month: compact ? "short" : "long",
    year: "numeric",
  });

  return (
    <div className={compact ? "" : "rounded-xl border border-border bg-gradient-to-b from-surface-1 to-background p-3 shadow-sm"}>
      {compact && (
        <div className="mb-2 text-center text-[12px] font-bold text-ink-2">{label}</div>
      )}
      <div className={`grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-border/80 bg-border/60 ${compact ? "text-[9px]" : "text-[11px]"}`}>
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className={`bg-surface-2/90 text-center font-bold text-ink-4 ${compact ? "px-0.5 py-1" : "px-1 py-2"}`}
          >
            {compact ? d.slice(0, 1) : d}
          </div>
        ))}
        {cells.map((cell, idx) => (
          <div
            key={idx}
            className={`min-h-[${compact ? "52" : "92"}px] bg-background p-1 ${cell.date ? "" : "bg-surface-2/40"}`}
            style={{ minHeight: compact ? 52 : 92 }}
          >
            {cell.date && (
              <>
                <div className={`mb-0.5 font-bold text-ink-3 ${compact ? "text-[10px]" : "text-[11px]"}`}>
                  {cell.date.getDate()}
                </div>
                <div className="space-y-0.5">
                  {cell.items.slice(0, compact ? 2 : 3).map((item) => {
                    const comp = getCompliance(item.complianceId)!;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelectItem?.(item.id)}
                        title={`${comp.name} · ${item.status}`}
                        className={`block w-full text-left ${chipClass(item, comp.frequency)}`}
                      >
                        {domainBadge(comp.domainId)} {comp.name}
                      </button>
                    );
                  })}
                  {cell.items.length > (compact ? 2 : 3) && (
                    <div className="text-[9px] font-bold text-primary">
                      +{cell.items.length - (compact ? 2 : 3)} more
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarContent() {
  const { state, updateDueDate, resetDueDate } = useITService();
  const [view, setView] = useState<ViewMode>("month");
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("");
  const [status, setStatus] = useState("");
  const [owner, setOwner] = useState("");
  const [risk, setRisk] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");

  const filtered = useMemo(() => {
    return state.calendar.filter((item) => {
      const comp = getCompliance(item.complianceId);
      if (!comp) return false;
      if (search && !comp.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (domain && comp.domainId !== domain) return false;
      if (status && item.status !== status) return false;
      if (owner && item.owner !== owner) return false;
      if (risk && comp.riskLevel !== risk) return false;
      return true;
    });
  }, [state.calendar, search, domain, status, owner, risk]);

  const owners = [...new Set(state.calendar.map((c) => c.owner))].sort();
  const monthLabel = cursor.toLocaleString("en-IN", { month: "long", year: "numeric" });
  const quarterIndex = Math.floor(cursor.getMonth() / 3);
  const quarterYear = cursor.getFullYear();

  const itemsInMonth = useMemo(() => {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    return filtered.filter((i) => i.dueDate.startsWith(key));
  }, [filtered, cursor]);

  const quarterMonths = useMemo(() => {
    const start = quarterIndex * 3;
    return [0, 1, 2].map((offset) => {
      const m = start + offset;
      const key = `${quarterYear}-${String(m + 1).padStart(2, "0")}`;
      return {
        year: quarterYear,
        month: m,
        items: filtered.filter((i) => i.dueDate.startsWith(key)),
      };
    });
  }, [filtered, quarterIndex, quarterYear]);

  const yearMonths = useMemo(() => {
    return Array.from({ length: 12 }, (_, m) => {
      const key = `${cursor.getFullYear()}-${String(m + 1).padStart(2, "0")}`;
      return {
        year: cursor.getFullYear(),
        month: m,
        items: filtered.filter((i) => i.dueDate.startsWith(key)),
      };
    });
  }, [filtered, cursor]);

  const shiftCursor = (delta: number) => {
    setCursor((prev) => {
      if (view === "year") return new Date(prev.getFullYear() + delta, prev.getMonth(), 1);
      if (view === "quarter") return new Date(prev.getFullYear(), prev.getMonth() + delta * 3, 1);
      return new Date(prev.getFullYear(), prev.getMonth() + delta, 1);
    });
  };

  const headerTitle =
    view === "year"
      ? String(cursor.getFullYear())
      : view === "quarter"
        ? `Q${quarterIndex + 1} ${quarterYear}`
        : monthLabel;

  const listItems =
    view === "year"
      ? filtered.filter((i) => i.dueDate.startsWith(String(cursor.getFullYear())))
      : view === "quarter"
        ? filtered.filter((i) => {
            const d = parseYmd(i.dueDate);
            return d.getFullYear() === quarterYear && Math.floor(d.getMonth() / 3) === quarterIndex;
          })
        : view === "list"
          ? filtered
          : itemsInMonth;

  const saveDueDate = (itemId: string) => {
    if (!editDate) return;
    updateDueDate(itemId, editDate);
    setEditDate("");
  };

  return (
    <ITServiceShell>
      <Link
        to="/it-service/dashboard"
        className="mb-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-3 transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <PageHeader
        title="Compliance calendar"
        subtitle="Generated from compliance master & rule engine"
      />

      <Card className="mb-4 border-primary/10 bg-gradient-to-br from-surface-1 via-background to-sky-50/30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => shiftCursor(-1)} className="rounded-lg border border-border bg-white p-1.5 shadow-sm hover:bg-surface-2" aria-label="Previous">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[140px] text-center text-[15px] font-extrabold tracking-tight text-ink">{headerTitle}</span>
            <button type="button" onClick={() => shiftCursor(1)} className="rounded-lg border border-border bg-white p-1.5 shadow-sm hover:bg-surface-2" aria-label="Next">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-surface-2/80 p-1">
            {(["month", "quarter", "year", "list"] as ViewMode[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`rounded-md px-3 py-1.5 text-[12px] font-bold capitalize transition-colors ${
                  view === v ? "bg-primary text-primary-foreground shadow-sm" : "text-ink-3 hover:bg-white hover:text-ink"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-4 border-t border-border/60 pt-3">
          {Object.entries(STATUS_STYLES).map(([key, s]) => (
            <span key={key} className="flex items-center gap-1.5 text-[11px] font-medium text-ink-3">
              <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
              {s.label}
            </span>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2 border-t border-border/60 pt-3">
          <input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-lg border border-border bg-white px-3 py-1.5 text-[13px] shadow-sm outline-none focus:border-primary" />
          <select value={domain} onChange={(e) => setDomain(e.target.value)} className="rounded-lg border border-border bg-white px-2 py-1.5 text-[12px]">
            <option value="">All domains</option>
            {DOMAINS.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-border bg-white px-2 py-1.5 text-[12px]">
            <option value="">All statuses</option>
            {(["pending", "overdue", "completed", "in_progress"] as CalendarStatus[]).map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
          <select value={owner} onChange={(e) => setOwner(e.target.value)} className="rounded-lg border border-border bg-white px-2 py-1.5 text-[12px]">
            <option value="">All owners</option>
            {owners.map((o) => (<option key={o} value={o}>{o}</option>))}
          </select>
          <select value={risk} onChange={(e) => setRisk(e.target.value)} className="rounded-lg border border-border bg-white px-2 py-1.5 text-[12px]">
            <option value="">All priorities</option>
            {["Critical", "High", "Medium", "Low"].map((r) => (<option key={r} value={r}>{r}</option>))}
          </select>
        </div>
      </Card>

      {view === "month" && (
        <Card title={monthLabel} className="mb-4 overflow-hidden">
          <MonthGrid
            year={cursor.getFullYear()}
            month={cursor.getMonth()}
            items={itemsInMonth}
            onSelectItem={(id) => setExpandedId(id)}
          />
        </Card>
      )}

      {view === "quarter" && (
        <div className="mb-4 grid gap-4 lg:grid-cols-3">
          {quarterMonths.map(({ year, month, items }) => (
            <Card key={month} title="" className="overflow-hidden p-2">
              <MonthGrid year={year} month={month} items={items} compact onSelectItem={(id) => setExpandedId(id)} />
            </Card>
          ))}
        </div>
      )}

      {view === "year" && (
        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {yearMonths.map(({ year, month, items }) => (
            <Card key={month} className="overflow-hidden p-2">
              <MonthGrid year={year} month={month} items={items} compact onSelectItem={(id) => setExpandedId(id)} />
            </Card>
          ))}
        </div>
      )}

      <Card title={`${listItems.length} items · tap to expand`}>
        <div className="divide-y divide-border">
          {listItems.length === 0 ? (
            <p className="py-4 text-[13px] text-ink-3">No calendar items for this period. Save company profile as Private Limited with GST & employees to generate more.</p>
          ) : (
            listItems.sort((a, b) => a.dueDate.localeCompare(b.dueDate)).map((item) => {
              const comp = getCompliance(item.complianceId)!;
              const due = parseYmd(item.dueDate);
              const isExpanded = expandedId === item.id;

              return (
                <div key={item.id} className="py-3">
                  <div className="flex items-center gap-4">
                    <div className="w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-gradient-to-b from-white to-surface-2 text-center shadow-sm">
                      <div className={`h-1 ${item.status === "overdue" ? "bg-rose-500" : item.status === "completed" ? "bg-emerald-500" : "bg-sky-500"}`} />
                      <div className="text-[20px] font-extrabold leading-tight">{due.getDate()}</div>
                      <div className="pb-1 text-[9px] font-bold uppercase text-ink-4">{due.toLocaleString("en-IN", { month: "short" })}</div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${chipClass(item, comp.frequency)}`}>
                          {domainBadge(comp.domainId)}
                        </span>
                        <span className="text-[13px] font-bold">{comp.name}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2 text-[12px] text-ink-3">
                        <span>Owner: {item.owner}</span>
                        <Pill tone={comp.riskLevel === "Critical" ? "miss" : comp.riskLevel === "High" ? "pend" : "n"}>
                          {comp.riskLevel}
                        </Pill>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <Pill tone={item.status === "completed" ? "done" : item.status === "overdue" ? "miss" : "pend"}>
                        {item.status === "completed" ? "COMPLETED" : item.status === "overdue" ? "OVERDUE" : "PENDING"}
                      </Pill>
                      <button type="button" onClick={() => { setExpandedId(isExpanded ? null : item.id); setEditDate(item.dueDate); }} className="mt-1 block text-[11px] font-bold text-primary hover:underline">
                        {isExpanded ? "Close" : "Details →"}
                      </button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="mt-3 rounded-lg border border-border bg-surface-2/40 p-3 pl-4">
                      <div className="mb-3 flex flex-wrap items-end gap-2">
                        <label className="text-[11px] font-bold text-ink-4">
                          Due date
                          <input
                            type="date"
                            value={editDate || item.dueDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="mt-1 block rounded-lg border border-border bg-white px-2 py-1.5 text-[13px]"
                          />
                        </label>
                        <Btn variant="o" onClick={() => saveDueDate(item.id)}>Save date</Btn>
                        {item.systemDueDate && (
                          <button type="button" className="text-[11px] text-ink-4 underline" onClick={() => { resetDueDate(item.id); setEditDate(item.systemDueDate!); }}>
                            Reset to system date
                          </button>
                        )}
                      </div>
                      {item.status !== "completed" && (
                        <ComplianceEvidencePanel complianceId={item.complianceId} calendarItemId={item.id} onClose={() => setExpandedId(null)} onComplete={() => setExpandedId(null)} />
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Card>
    </ITServiceShell>
  );
}
