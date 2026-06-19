import { createFileRoute } from "@tanstack/react-router";
import { useITService } from "@/lib/it-service/context";
import { ITServiceShell } from "@/components/it-service/ITServiceShell";
import { RequireOnboarding } from "@/components/it-service/RequireOnboarding";
import { PageHeader, Card, Kpi, ScoreRing, Pill, Btn, Banner } from "@/components/ui-kit";
import { getUpcomingCalendar } from "@/lib/it-service/calendar-engine";
import { DOMAINS, getCompliance } from "@/lib/it-service/master-data";
import { scoreTone } from "@/lib/it-service/scoring-engine";
import { hasApprovedEvidence } from "@/lib/it-service/compliance-utils";
import { AlertTriangle, FileText, Calendar, Clock } from "lucide-react";
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
  const { state } = useITService();
  const { profile, kpis, domainScores, risks, insights, recentActivity } = state;
  const upcoming = getUpcomingCalendar(state.calendar, 5);

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
                const due = new Date(item.dueDate + "T00:00:00");
                const chip =
                  item.status === "overdue"
                    ? "r"
                    : item.status === "completed"
                      ? "g"
                      : "a";
                const day = due.getDate().toString().padStart(2, "0");
                const mon = due.toLocaleString("en-IN", { month: "short" }).toUpperCase();
                return (
                  <div key={item.id} className="flex items-start gap-3 py-3">
                    <div className="w-11 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-background text-center">
                      <div
                        className={`h-1.5 ${chip === "r" ? "bg-destructive" : chip === "a" ? "bg-warning" : "bg-success"}`}
                      />
                      <div className="text-[18px] font-extrabold leading-tight">{day}</div>
                      <div className="pb-1 text-[9px] font-bold uppercase tracking-[0.07em] text-ink-4">
                        {mon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] font-bold">{comp?.name}</div>
                      <div className="mt-0.5 text-[12px] text-ink-3">
                        {comp?.domainId} · {item.period} · {item.owner}
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
