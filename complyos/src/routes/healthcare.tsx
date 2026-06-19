import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader, Card, Kpi, ScoreRing, Pill, Btn, Banner } from "@/components/ui-kit";
import { AgentOrchestrationPanel } from "@/components/AgentOrchestrationPanel";
import {
  HeartPulse,
  AlertTriangle,
  Activity,
  Users,
  FileText,
  Database,
  Stethoscope,
  Pill as PillIcon,
  ShieldAlert,
  TestTube,
  Trash2,
  ClipboardList,
} from "lucide-react";

export const Route = createFileRoute("/healthcare")({
  head: () => ({
    meta: [
      { title: "Healthcare Compliance — ComplyOS" },
      {
        name: "description",
        content:
          "HIPAA, NDHM/ABDM, NABH, CDSCO, biomedical waste — clinical compliance agents for hospitals and digital health.",
      },
      { property: "og:title", content: "Healthcare Compliance Dashboard — ComplyOS" },
      {
        property: "og:description",
        content: "Patient data protection, clinical trial governance, hospital accreditation — orchestrated.",
      },
    ],
  }),
  component: HealthcarePage,
});

function HealthcarePage() {
  return (
    <AppShell
      industryId="healthcare"
      sidebarSections={[
        {
          title: "Overview",
          items: [
            { label: "Dashboard", to: "/healthcare", icon: <HeartPulse className="h-3.5 w-3.5" /> },
            { label: "Patient data (PHI)", icon: <Database className="h-3.5 w-3.5" />, badge: { text: "12K", tone: "n" } },
            { label: "Clinical trials", icon: <TestTube className="h-3.5 w-3.5" /> },
            { label: "Incidents", icon: <ShieldAlert className="h-3.5 w-3.5" />, badge: { text: "3", tone: "r" } },
          ],
        },
        {
          title: "Regulators",
          items: [
            { label: "HIPAA controls", icon: <FileText className="h-3.5 w-3.5" />, badge: { text: "94%", tone: "g" } },
            { label: "NDHM / ABDM", icon: <FileText className="h-3.5 w-3.5" />, badge: { text: "88%", tone: "g" } },
            { label: "NABH accreditation", icon: <ClipboardList className="h-3.5 w-3.5" />, badge: { text: "76%", tone: "a" } },
            { label: "CDSCO (drugs)", icon: <PillIcon className="h-3.5 w-3.5" />, badge: { text: "82%", tone: "g" } },
            { label: "Biomedical waste", icon: <Trash2 className="h-3.5 w-3.5" />, badge: { text: "91%", tone: "g" } },
          ],
        },
      ]}
    >
      <PageHeader
        title="Healthcare compliance"
        subtitle="Apollo Healthcare Group · 14 facilities · 12,478 active patient records"
        actions={
          <>
            <Btn variant="o">
              <FileText className="h-3.5 w-3.5" /> Audit pack
            </Btn>
            <Btn>
              <Stethoscope className="h-3.5 w-3.5" /> Run clinical audit
            </Btn>
          </>
        }
      />

      <Banner
        tone="danger"
        icon={<AlertTriangle className="h-4 w-4" />}
        text="3 PHI access anomalies detected by Bhavna agent in Cardiology ward — review within 24h (HIPAA §164.312)."
        cta="Investigate"
      />

      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <Kpi value="87" label="Overall score" change="+4 this week" tone="up" />
        <Kpi value="3" label="Open incidents" change="-2 vs last week" tone="up" />
        <Kpi value="14" label="Facilities monitored" />
        <Kpi value="98.2%" label="PHI encryption coverage" change="Target 100%" tone="dn" />
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-5">
        <ScoreRing score={94} reg="HIPAA" tone="g" label="Privacy & security" />
        <ScoreRing score={88} reg="NDHM" tone="g" label="ABDM consent" />
        <ScoreRing score={76} reg="NABH" tone="a" label="Re-audit due" />
        <ScoreRing score={82} reg="CDSCO" tone="g" label="Drug licensing" />
        <ScoreRing score={91} reg="BMW" tone="g" label="Waste mgmt" />
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card title="Active obligations" action={<span className="cursor-pointer text-[12px] font-bold text-primary">View all</span>}>
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-border text-left text-[10px] font-bold uppercase tracking-[0.1em] text-ink-3">
                <th className="bg-surface-2 px-3 py-2.5">Obligation</th>
                <th className="bg-surface-2 px-3 py-2.5">Regulator</th>
                <th className="bg-surface-2 px-3 py-2.5">Due</th>
                <th className="bg-surface-2 px-3 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["NABH 5th edition re-survey", "Quality Council of India", "Apr 28", "pend"],
                ["Biomedical waste annual return Form-IV", "CPCB / SPCB", "Jun 30", "pend"],
                ["DPDP consent migration for legacy EHR", "MeitY", "May 15", "pend"],
                ["HIPAA risk assessment refresh", "OCR (referenced)", "Done", "done"],
                ["ABDM HIE-CM audit logs export", "NHA", "Weekly", "done"],
              ].map(([o, r, d, s]) => (
                <tr key={o as string} className="border-b border-border last:border-0">
                  <td className="px-3 py-3 text-[13px] font-bold">{o}</td>
                  <td className="px-3 py-3 text-[12px] text-ink-3">{r}</td>
                  <td className="px-3 py-3 text-[12px] font-mono text-ink-3">{d}</td>
                  <td className="px-3 py-3"><Pill tone={s as "pend" | "done"}>{s === "done" ? "FILED" : "DUE"}</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Recent agent activity">
          <div className="space-y-3">
            {[
              { who: "Bhavna (PHI Audit)", what: "Flagged unusual access pattern in Cardiology — 47 records viewed by 1 user in 2 min.", time: "12 min ago", icon: <ShieldAlert className="h-3.5 w-3.5 text-destructive" /> },
              { who: "Veda (NABH Reviewer)", what: "Generated gap analysis for chapter 4 — 9 sub-criteria need evidence uploads.", time: "2h ago", icon: <ClipboardList className="h-3.5 w-3.5 text-warning" /> },
              { who: "Aditi (BMW Tracker)", what: "Submitted Form-II for March to Karnataka SPCB. Acknowledgment received.", time: "5h ago", icon: <Trash2 className="h-3.5 w-3.5 text-success" /> },
              { who: "Maya (Consent Engine)", what: "Re-confirmed ABDM consent for 1,204 patients during routine OPD visits.", time: "Yesterday", icon: <Users className="h-3.5 w-3.5 text-primary" /> },
            ].map((a) => (
              <div key={a.who} className="flex gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-surface-2">
                  {a.icon}
                </div>
                <div className="flex-1">
                  <div className="text-[12px]"><span className="font-bold">{a.who}</span> <span className="text-ink-3">{a.what}</span></div>
                  <div className="mt-1 font-mono text-[10px] text-ink-4">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <AgentOrchestrationPanel
        industry="Healthcare"
        agents={[
          { name: "Bhavna", role: "PHI Access Auditor", status: "busy" },
          { name: "Veda", role: "NABH Reviewer", status: "review" },
          { name: "Aditi", role: "BMW Filing Agent", status: "idle" },
          { name: "Maya", role: "ABDM Consent Engine", status: "busy" },
          { name: "Rohan", role: "CDSCO Drug Licensing", status: "idle" },
          { name: "Ira", role: "Clinical Trial Compliance", status: "busy" },
        ]}
        initialTasks={[
          { id: "1", agent: "Bhavna", task: "Investigating Cardiology ward PHI access spike", status: "running", reasoning: "Cross-referencing user role (Junior Resident) against patient list — 39 patients not in their assigned ward. Escalating to DPO." },
          { id: "2", agent: "Veda", task: "Generating NABH chapter 4 evidence gap report", status: "queued", reasoning: "Will scan SOP repo for IPSG, PRE, and HIC chapter mappings." },
          { id: "3", agent: "Aditi", task: "Pre-filling Form-IV biomedical waste annual return", status: "queued" },
          { id: "4", agent: "Maya", task: "Re-issuing ABDM consent artifacts post DPDP update", status: "queued", reasoning: "Old consent text references IT Act. Migrating to DPDP Act 2023 schema with explicit purpose strings." },
        ]}
      />

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Card title="Active patient records">
          <div className="text-[36px] font-extrabold tracking-[-0.04em]">12,478</div>
          <div className="mt-1 flex items-center gap-1.5 text-[12px] text-ink-3">
            <Activity className="h-3.5 w-3.5 text-success" /> All under DPDP-compliant consent
          </div>
        </Card>
        <Card title="Clinical trials in progress">
          <div className="text-[36px] font-extrabold tracking-[-0.04em]">7</div>
          <div className="mt-1 text-[12px] text-ink-3">2 phase-III · 3 phase-II · 2 BA/BE — all CDSCO approved</div>
        </Card>
        <Card title="Avg breach response time">
          <div className="text-[36px] font-extrabold tracking-[-0.04em]">4.2h</div>
          <div className="mt-1 text-[12px] text-success">Under 72h DPDP/HIPAA target</div>
        </Card>
      </div>
    </AppShell>
  );
}
