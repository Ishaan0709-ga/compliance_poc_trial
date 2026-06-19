import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useITService } from "@/lib/it-service/context";
import { ITServiceShell } from "@/components/it-service/ITServiceShell";
import { RequireOnboarding } from "@/components/it-service/RequireOnboarding";
import { PageHeader, Card, Pill } from "@/components/ui-kit";
import { getCompliance, DOMAINS } from "@/lib/it-service/master-data";
import type { CalendarStatus } from "@/lib/it-service/types";
import {
  ComplianceEvidencePanel,
} from "@/components/it-service/ComplianceEvidenceActions";
import { evidenceForCalendarItem } from "@/lib/it-service/compliance-utils";

export const Route = createFileRoute("/it-service/calendar")({
  component: CalendarPage,
});

function CalendarPage() {
  return (
    <RequireOnboarding>
      <CalendarContent />
    </RequireOnboarding>
  );
}

function CalendarContent() {
  const { state } = useITService();
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("");
  const [domain, setDomain] = useState("");
  const [status, setStatus] = useState("");
  const [owner, setOwner] = useState("");
  const [risk, setRisk] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return state.calendar
      .filter((item) => {
        const comp = getCompliance(item.complianceId);
        if (!comp) return false;
        if (search && !comp.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (month && !item.dueDate.startsWith(month)) return false;
        if (domain && comp.domainId !== domain) return false;
        if (status && item.status !== status) return false;
        if (owner && item.owner !== owner) return false;
        if (risk && comp.riskLevel !== risk) return false;
        return item.dueDate >= today || item.status === "overdue";
      })
      .slice(0, 50);
  }, [state.calendar, search, month, domain, status, owner, risk]);

  const owners = [...new Set(state.calendar.map((c) => c.owner))];
  const months = [...new Set(state.calendar.map((c) => c.dueDate.slice(0, 7)))].sort();

  return (
    <ITServiceShell>
      <PageHeader
        title="Compliance calendar"
        subtitle="Upcoming and overdue items — generated from your profile and master frequency rules."
      />

      <Card className="mb-4">
        <div className="flex flex-wrap gap-2">
          <input
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-[13px] outline-none"
          />
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-[12px]"
          >
            <option value="">All months</option>
            {months.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
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
            <option value="">All risks</option>
            {["Critical", "High", "Medium", "Low"].map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </Card>

      <Card title={`${filtered.length} upcoming items`}>
        <div className="divide-y divide-border">
          {filtered.map((item) => {
            const comp = getCompliance(item.complianceId)!;
            const due = new Date(item.dueDate);
            const ev = evidenceForCalendarItem(item, state.calendar, state.evidence);
            const isExpanded = expandedId === item.id;
            const needsAction = item.status !== "completed";

            return (
              <div key={item.id} className="py-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 text-center">
                    <div className="text-[18px] font-extrabold">{due.getDate()}</div>
                    <div className="text-[9px] font-bold uppercase text-ink-4">
                      {due.toLocaleString("en-IN", { month: "short" })}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold">{comp.name}</div>
                    <div className="text-[12px] text-ink-3">
                      {item.period} · {comp.domainId} · {item.owner}
                    </div>
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
          })}
        </div>
      </Card>
    </ITServiceShell>
  );
}
