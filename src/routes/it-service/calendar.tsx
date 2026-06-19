import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useITService } from "@/lib/it-service/context";
import { ITServiceShell } from "@/components/it-service/ITServiceShell";
import { RequireOnboarding } from "@/components/it-service/RequireOnboarding";
import { PageHeader, Card, Pill } from "@/components/ui-kit";
import { getCompliance, DOMAINS } from "@/lib/it-service/master-data";
import type { CalendarItem, CalendarStatus } from "@/lib/it-service/types";
import {
  ComplianceEvidencePanel,
} from "@/components/it-service/ComplianceEvidenceActions";
import { evidenceForCalendarItem } from "@/lib/it-service/compliance-utils";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/it-service/calendar")({
  component: CalendarPage,
});

type ViewMode = "month" | "quarter" | "year" | "list";

const STATUS_LEGEND: { status: CalendarStatus | "event"; label: string; className: string }[] = [
  { status: "completed", label: "Completed", className: "bg-success/15 text-success border-success/30" },
  { status: "in_progress", label: "In Progress", className: "bg-warning/15 text-warning border-warning/30" },
  { status: "pending", label: "Pending", className: "bg-primary/10 text-primary border-primary/25" },
  { status: "overdue", label: "Overdue", className: "bg-destructive/15 text-destructive border-destructive/30" },
  { status: "event", label: "Event Based", className: "bg-violet-500/15 text-violet-700 border-violet-500/30" },
];

function CalendarPage() {
  return (
    <RequireOnboarding>
      <CalendarContent />
    </RequireOnboarding>
  );
}

function statusChipClass(item: CalendarItem, compFrequency?: string): string {
  if (compFrequency === "Event Based") {
    return "bg-violet-500/15 text-violet-700 border-violet-500/30";
  }
  switch (item.status) {
    case "completed":
      return "bg-success/15 text-success border-success/30";
    case "in_progress":
      return "bg-warning/15 text-warning border-warning/30";
    case "overdue":
      return "bg-destructive/15 text-destructive border-destructive/30";
    default:
      return "bg-primary/10 text-primary border-primary/25";
  }
}

function domainPrefix(domainId: string): string {
  return domainId;
}

function CalendarContent() {
  const { state } = useITService();
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
  const pendingNotifications = state.notifications.filter((n) => n.status === "pending").length;

  const monthLabel = cursor.toLocaleString("en-IN", { month: "long", year: "numeric" });

  const itemsInMonth = useMemo(() => {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    return filtered.filter((i) => i.dueDate.startsWith(key));
  }, [filtered, cursor]);

  const itemsInQuarter = useMemo(() => {
    const y = cursor.getFullYear();
    const q = Math.floor(cursor.getMonth() / 3);
    const start = new Date(y, q * 3, 1);
    const end = new Date(y, q * 3 + 3, 0);
    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);
    return filtered.filter((i) => i.dueDate >= startStr && i.dueDate <= endStr);
  }, [filtered, cursor]);

  const itemsInYear = useMemo(() => {
    const y = String(cursor.getFullYear());
    return filtered.filter((i) => i.dueDate.startsWith(y));
  }, [filtered, cursor]);

  const shiftCursor = (delta: number) => {
    setCursor((prev) => {
      if (view === "year") {
        return new Date(prev.getFullYear() + delta, prev.getMonth(), 1);
      }
      if (view === "quarter") {
        return new Date(prev.getFullYear(), prev.getMonth() + delta * 3, 1);
      }
      return new Date(prev.getFullYear(), prev.getMonth() + delta, 1);
    });
  };

  const calendarDays = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: { date: Date | null; items: CalendarItem[] }[] = [];
    for (let i = 0; i < startPad; i++) cells.push({ date: null, items: [] });
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const key = date.toISOString().slice(0, 10);
      cells.push({
        date,
        items: itemsInMonth.filter((i) => i.dueDate === key),
      });
    }
    return cells;
  }, [cursor, itemsInMonth]);

  const listItems =
    view === "year"
      ? itemsInYear
      : view === "quarter"
        ? itemsInQuarter
        : view === "list"
          ? filtered.slice(0, 80)
          : itemsInMonth;

  const headerTitle =
    view === "year"
      ? String(cursor.getFullYear())
      : view === "quarter"
        ? `Q${Math.floor(cursor.getMonth() / 3) + 1} ${cursor.getFullYear()}`
        : monthLabel;

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
        subtitle={`Generated from compliance master, frequency rules and your profile · ${pendingNotifications} WhatsApp reminder(s) queued`}
      />

      <Card className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => shiftCursor(-1)}
              className="rounded-lg border border-border p-1.5 hover:bg-surface-2"
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[140px] text-center text-[14px] font-bold">{headerTitle}</span>
            <button
              type="button"
              onClick={() => shiftCursor(1)}
              className="rounded-lg border border-border p-1.5 hover:bg-surface-2"
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {(["month", "quarter", "year", "list"] as ViewMode[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`rounded-lg px-3 py-1.5 text-[12px] font-bold capitalize ${
                  view === v
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-surface-2 text-ink-2 hover:bg-surface-3"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-3 border-t border-border pt-3">
          {STATUS_LEGEND.map((s) => (
            <span key={s.label} className="flex items-center gap-1.5 text-[11px] text-ink-3">
              <span className={`h-2 w-2 rounded-full border ${s.className}`} />
              {s.label}
            </span>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
          <input
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-[13px] outline-none"
          />
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-[12px]"
          >
            <option value="">All domains</option>
            {DOMAINS.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-[12px]"
          >
            <option value="">All statuses</option>
            {(["pending", "overdue", "completed", "in_progress"] as CalendarStatus[]).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            className="rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-[12px]"
          >
            <option value="">All owners</option>
            {owners.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          <select
            value={risk}
            onChange={(e) => setRisk(e.target.value)}
            className="rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-[12px]"
          >
            <option value="">All priorities</option>
            {["Critical", "High", "Medium", "Low"].map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </Card>

      {view === "month" && (
        <Card title={monthLabel} className="mb-4">
          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-border bg-border text-[11px]">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="bg-surface-2 px-1 py-2 text-center font-bold text-ink-4">
                {d}
              </div>
            ))}
            {calendarDays.map((cell, idx) => (
              <div
                key={idx}
                className={`min-h-[88px] bg-background p-1 ${cell.date ? "" : "bg-surface-2/50"}`}
              >
                {cell.date && (
                  <>
                    <div className="mb-1 text-[11px] font-bold text-ink-3">{cell.date.getDate()}</div>
                    <div className="space-y-0.5">
                      {cell.items.slice(0, 3).map((item) => {
                        const comp = getCompliance(item.complianceId)!;
                        return (
                          <div
                            key={item.id}
                            title={`${comp.name} · ${item.owner} · ${item.status}`}
                            className={`truncate rounded border px-1 py-0.5 text-[9px] font-semibold ${statusChipClass(item, comp.frequency)}`}
                          >
                            {domainPrefix(comp.domainId)} {comp.name}
                          </div>
                        );
                      })}
                      {cell.items.length > 3 && (
                        <div className="text-[9px] font-bold text-ink-4">
                          +{cell.items.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card title={`${listItems.length} items`}>
        <div className="divide-y divide-border">
          {listItems.length === 0 ? (
            <p className="py-4 text-[13px] text-ink-3">No calendar items for this period.</p>
          ) : (
            listItems
              .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
              .map((item) => {
                const comp = getCompliance(item.complianceId)!;
                const due = new Date(item.dueDate + "T00:00:00");
                const ev = evidenceForCalendarItem(item, state.calendar, state.evidence);
                const isExpanded = expandedId === item.id;
                const needsAction = item.status !== "completed";
                const notif = state.notifications.find(
                  (n) => n.complianceId === item.complianceId && n.dueDate === item.dueDate
                );

                return (
                  <div key={item.id} className="py-3">
                    <div className="flex items-center gap-4">
                      <div className="w-12 text-center">
                        <div className="text-[18px] font-extrabold">{due.getDate()}</div>
                        <div className="text-[9px] font-bold uppercase text-ink-4">
                          {due.toLocaleString("en-IN", { month: "short" })}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-bold">{comp.name}</div>
                        <div className="text-[12px] text-ink-3">
                          {comp.domainId} · {item.period} · Owner: {item.owner} · {comp.riskLevel}
                        </div>
                        {notif && (
                          <div className="mt-1 text-[11px] text-ink-4" title={notif.message}>
                            WhatsApp: {notif.notificationType.replace(/_/g, " ")}
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <Pill
                          tone={
                            item.status === "completed"
                              ? "done"
                              : item.status === "overdue"
                                ? "miss"
                                : "pend"
                          }
                        >
                          {item.status.toUpperCase()}
                        </Pill>
                        {needsAction && (
                          <button
                            type="button"
                            onClick={() => setExpandedId(isExpanded ? null : item.id)}
                            className="mt-1 block text-[11px] font-bold text-primary hover:underline"
                          >
                            {isExpanded ? "Close" : ev ? "Update →" : "Upload →"}
                          </button>
                        )}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="mt-3 pl-16">
                        <ComplianceEvidencePanel
                          complianceId={item.complianceId}
                          calendarItemId={item.id}
                          onClose={() => setExpandedId(null)}
                          onComplete={() => setExpandedId(null)}
                        />
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
