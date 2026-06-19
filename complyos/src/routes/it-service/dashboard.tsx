import { createFileRoute } from "@tanstack/react-router";
import { useITService } from "@/lib/it-service/context";
import { ITServiceShell } from "@/components/it-service/ITServiceShell";
import { RequireOnboarding } from "@/components/it-service/RequireOnboarding";
import { PageHeader, Card, Kpi, ScoreRing, Pill, Btn, Banner } from "@/components/ui-kit";
import { AgentOrchestrationPanel } from "@/components/AgentOrchestrationPanel";
import { getUpcomingCalendar } from "@/lib/it-service/calendar-engine";
import { DOMAINS, getCompliance } from "@/lib/it-service/master-data";
import { scoreTone } from "@/lib/it-service/scoring-engine";
import {
  AlertTriangle,
  FileText,
  Calendar,
} from "lucide-react";
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
  const { profile, kpis, domainScores, risks, insights } = state;
  const upcoming = getUpcomingCalendar(state.calendar, 6);

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

  return (
    <ITServiceShell>
      <PageHeader
        title="IT Service compliance"
        subtitle={
          profile
            ? `${profile.companyName} · ${profile.employeeCount} employees · ${profile.countriesServed.join(" + ")}`
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
                const due = new Date(item.dueDate);
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
                        {item.period} · Owner: {item.owner}
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

        <Card title="Compliance risk alerts">
          <div className="space-y-2">
            {risks.length === 0 ? (
              <p className="text-[13px] text-ink-3">No active risk alerts.</p>
            ) : (
              risks.slice(0, 5).map((a) => (
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
                        {a.level}
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

      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <Kpi value={String(kpis.overdueCount)} label="Overdue compliances" tone={kpis.overdueCount ? "dn" : "up"} />
        <Kpi value={String(kpis.criticalRisks)} label="Critical risks" />
        <Kpi value={String(kpis.evidenceMissing)} label="Evidence missing" />
        <Kpi value={String(kpis.dueThisWeek)} label="Due this week" />
      </div>

      <AgentOrchestrationPanel
        industry="IT Service"
        agents={[
          { name: "Veer", role: "GST & Tax Filing", status: "busy" },
          { name: "Tara", role: "Corporate Governance", status: "idle" },
          { name: "Vyom", role: "DPDP & Privacy", status: "review" },
          { name: "Anvi", role: "ISO 27001 Controls", status: "busy" },
          { name: "Kabir", role: "HR & Labour Compliance", status: "idle" },
          { name: "Saira", role: "Vendor Risk Monitor", status: "idle" },
          { name: "Ravi", role: "Evidence Validator", status: "busy" },
          { name: "Mira", role: "Score & Risk Engine", status: "idle" },
        ]}
        initialTasks={insights.slice(0, 4).map((ins, i) => ({
          id: String(i + 1),
          agent: ["Veer", "Vyom", "Anvi", "Ravi"][i % 4],
          task: ins.title,
          status: i === 0 ? "running" : "queued",
          reasoning: ins.description,
        }))}
      />
    </ITServiceShell>
  );
}
