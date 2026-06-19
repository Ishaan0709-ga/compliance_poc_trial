import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useITService } from "@/lib/it-service/context";
import { ITServiceShell } from "@/components/it-service/ITServiceShell";
import { RequireOnboarding } from "@/components/it-service/RequireOnboarding";
import { ExecutiveSummaryModal } from "@/components/it-service/ExecutiveSummaryModal";
import { PageHeader, Card, Kpi, ScoreRing, Pill, Btn, Banner } from "@/components/ui-kit";
import { getUpcomingCalendar } from "@/lib/it-service/calendar-engine";
import { buildExecutiveSummary } from "@/lib/it-service/executive-summary";
import { domainBadge } from "@/lib/it-service/domain-labels";
import { parseYmd } from "@/lib/it-service/date-utils";
import { appendNotificationHistory } from "@/lib/it-service/storage";
import { sendExecutiveSummaryWhatsApp } from "@/lib/it-service/whatsapp.functions";
import { DOMAINS, getCompliance } from "@/lib/it-service/master-data";
import { scoreTone } from "@/lib/it-service/scoring-engine";
import { hasApprovedEvidence } from "@/lib/it-service/compliance-utils";
import { AlertTriangle, FileText, Calendar, Clock, Send, ClipboardList, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/it-service/dashboard")({
  head: () => ({
    meta: [{ title: "IT Service Dashboard — ComplyOS" }],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <RequireOnboarding>
      <DashboardContent />
    </RequireOnboarding>
  );
}

function DashboardContent() {
  const { state, user, userMobile } = useITService();
  const { profile, kpis, domainScores, risks, insights, recentActivity } = state;
  const upcoming = getUpcomingCalendar(state.calendar, 5);
  const summary = useMemo(() => buildExecutiveSummary(state), [state]);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [sendingSummary, setSendingSummary] = useState(false);
  const [summarySent, setSummarySent] = useState(false);

  const handleSendSummary = async () => {
    if (!userMobile || !user?.id) return;
    setSendingSummary(true);
    try {
      const result = await sendExecutiveSummaryWhatsApp({
        data: { recipient: userMobile, message: summary.whatsappText },
      });
      appendNotificationHistory({
        notificationId: `ES-${Date.now()}`,
        userId: user.id,
        complianceId: null,
        recipientNumber: userMobile,
        messageType: "executive_summary",
        messageBody: summary.whatsappText,
        sentAt: new Date().toISOString(),
        deliveryStatus: result.ok ? (result.demo ? "queued" : "delivered") : "failed",
        twilioMessageSid: result.sid ?? null,
      });
      setSummarySent(true);
      setTimeout(() => setSummarySent(false), 4000);
    } finally {
      setSendingSummary(false);
    }
  };

  const topInsight = insights.find((i) => i.priority === "high");

  const domainRouteMap: Record<string, string> = {
    GOV: "/it-service/governance",
    TAX: "/it-service/taxation",
    HR: "/it-service/hr",
    LEG: "/it-service/legal",
    SEC: "/it-service/security",
    DPP: "/it-service/privacy",
    FIN: "/it-service/financial",
    VEN: "/it-service/vendor",
  };

  const domainShort: Record<string, string> = {
    GOV: "GOV",
    TAX: "TAX",
    HR: "HR",
    LEG: "LEG",
    SEC: "SEC",
    DPP: "DPP",
    FIN: "FIN",
    VEN: "VEN",
  };

  const alertItems = [
    ...risks.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      level: r.level,
      kind: "risk" as const,
    })),
    ...state.applicable
      .filter((a) => a.applicable)
      .map((a) => a.complianceId)
      .filter((id) => !hasApprovedEvidence(id, state.evidence))
      .slice(0, 3)
      .map((id) => {
        const comp = getCompliance(id);
        return {
          id: `ev-miss-${id}`,
          title: comp?.name ?? id,
          description: "Evidence missing for applicable compliance",
          level: "MEDIUM" as const,
          kind: "evidence" as const,
        };
      }),
  ].slice(0, 6);

  return (
    <ITServiceShell>
      <PageHeader
        title="IT Service compliance"
        subtitle={
          profile
            ? `${profile.companyName} · ${profile.employeeCount} employees · India`
            : ""
        }
        actions={
          <>
            <Link to="/it-service/reports">
              <Btn variant="o">
                <FileText className="h-3.5 w-3.5" /> Generate report
              </Btn>
            </Link>
            <Link to="/it-service/evidence">
              <Btn>
                <Calendar className="h-3.5 w-3.5" /> Upload evidence
              </Btn>
            </Link>
          </>
        }
      />

      {topInsight && (
        <Banner
          tone="warn"
          icon={<AlertTriangle className="h-4 w-4" />}
          text={topInsight.description}
          cta="View insights"
        />
      )}

      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <Kpi
          value={`${kpis.overallScore}%`}
          label="Overall compliance score"
          tone={kpis.overallScore >= 80 ? "up" : "dn"}
        />
        <Kpi value={String(kpis.openActions)} label="Open actions" />
        <Kpi value={String(kpis.upcomingDue)} label="Upcoming due" />
        <Kpi
          value={String(kpis.criticalRisks)}
          label="Critical risks"
          tone={kpis.criticalRisks > 0 ? "dn" : "up"}
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Btn variant="o" onClick={handleSendSummary} disabled={sendingSummary || !userMobile}>
          {sendingSummary ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          Send Compliance Summary
        </Btn>
        <Btn variant="o" onClick={() => setSummaryOpen(true)}>
          <ClipboardList className="h-3.5 w-3.5" />
          View Executive Summary
        </Btn>
        {summarySent && (
          <span className="self-center text-[12px] font-medium text-success">
            Summary sent to your WhatsApp
          </span>
        )}
      </div>

      <ExecutiveSummaryModal
        open={summaryOpen}
        onOpenChange={setSummaryOpen}
        summary={summary}
      />

      <div className="mb-4 grid gap-3 md:grid-cols-4 lg:grid-cols-4">
        {domainScores.map((d) => {
          const domain = DOMAINS.find((x) => x.id === d.domainId);
          const tone = scoreTone(d.score);
          return (
            <Link key={d.domainId} to={domainRouteMap[d.domainId]}>
              <ScoreRing
                score={d.score}
                reg={domainShort[d.domainId]}
                tone={tone}
                label={domain?.name}
              />
            </Link>
          );
        })}
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card
          title="Compliance calendar — upcoming"
          action={
            <Link to="/it-service/calendar" className="cursor-pointer text-[12px] font-bold text-primary">
              Open calendar
            </Link>
          }
        >
          <div className="divide-y divide-border">
            {upcoming.length === 0 ? (
              <p className="py-4 text-[13px] text-ink-3">No upcoming items.</p>
            ) : (
              upcoming.map((item) => {
                const comp = getCompliance(item.complianceId);
                const due = parseYmd(item.dueDate);
                const day = due.getDate().toString().padStart(2, "0");
                const mon = due.toLocaleString("en-IN", { month: "short" });
                return (
                  <div key={item.id} className="flex items-start gap-3 py-3">
                    <div className="w-11 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-background text-center">
                      <div
                        className={`h-1.5 ${item.status === "overdue" ? "bg-destructive" : item.status === "completed" ? "bg-success" : "bg-warning"}`}
                      />
                      <div className="text-[18px] font-extrabold leading-tight">{day}</div>
                      <div className="pb-1 text-[9px] font-bold uppercase tracking-[0.07em] text-ink-4">
                        {mon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Pill tone="n">{comp ? domainBadge(comp.domainId) : "—"}</Pill>
                        <span className="text-[13px] font-bold">{comp?.name}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2 text-[12px] text-ink-3">
                        <span>Owner: {item.owner}</span>
                        {comp && (
                          <Pill tone={comp.riskLevel === "Critical" ? "miss" : "pend"}>
                            {comp.riskLevel}
                          </Pill>
                        )}
                      </div>
                      <Pill
                        tone={
                          item.status === "overdue"
                            ? "miss"
                            : item.status === "completed"
                              ? "done"
                              : "pend"
                        }
                      >
                        {item.status === "overdue"
                          ? "OVERDUE"
                          : item.status === "completed"
                            ? "COMPLETED"
                            : "PENDING"}
                      </Pill>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <Card title="Alerts">
          <div className="space-y-2">
            {alertItems.length === 0 ? (
              <p className="text-[13px] text-ink-3">No active alerts.</p>
            ) : (
              alertItems.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start gap-2 rounded-lg border border-border bg-surface-2/50 p-2.5"
                >
                  <div
                    className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${
                      a.level === "HIGH"
                        ? "bg-destructive"
                        : a.level === "MEDIUM"
                          ? "bg-warning"
                          : "bg-ink-4"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-bold">{a.title}</span>
                      <Pill
                        tone={
                          a.level === "HIGH" ? "miss" : a.level === "MEDIUM" ? "pend" : "n"
                        }
                      >
                        {a.kind === "evidence" ? "EVIDENCE" : a.level}
                      </Pill>
                    </div>
                    <div className="mt-0.5 text-[12px] text-ink-2">{a.description}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card title="Recent activity" className="mb-4">
        <div className="divide-y divide-border">
          {recentActivity.length === 0 ? (
            <p className="py-3 text-[13px] text-ink-3">No recent activity yet.</p>
          ) : (
            recentActivity.slice(0, 6).map((act) => (
              <div key={act.id} className="flex items-start gap-3 py-2.5">
                <Clock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-ink-4" />
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-bold">{act.title}</div>
                  <div className="text-[11px] text-ink-3">{act.description}</div>
                </div>
                <div className="shrink-0 text-[10px] text-ink-4">
                  {new Date(act.at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </ITServiceShell>
  );
}
