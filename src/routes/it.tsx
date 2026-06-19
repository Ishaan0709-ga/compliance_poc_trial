import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader, Card, Kpi, ScoreRing, Pill, Btn, Banner } from "@/components/ui-kit";
import { AgentOrchestrationPanel } from "@/components/AgentOrchestrationPanel";
import {
  ShieldCheck,
  AlertTriangle,
  Server,
  Lock,
  FileText,
  Cloud,
  Cpu,
  KeyRound,
  Eye,
  GitPullRequest,
} from "lucide-react";

export const Route = createFileRoute("/it")({
  head: () => ({
    meta: [
      { title: "IT & SaaS Compliance / Certifications — ComplyOS" },
      {
        name: "description",
        content:
          "ISO 27001, SOC 2, PCI-DSS, GDPR, DPDP — continuous control monitoring with evidence collection agents.",
      },
      { property: "og:title", content: "IT Compliance & Certifications — ComplyOS" },
      {
        property: "og:description",
        content: "Audit-ready every day. Evidence agents run 24/7 across cloud, code, and identity.",
      },
    ],
  }),
  component: ITPage,
});

function ITPage() {
  return (
    <AppShell
      industryId="it"
      sidebarSections={[
        {
          title: "Overview",
          items: [
            { label: "Dashboard", to: "/it", icon: <ShieldCheck className="h-3.5 w-3.5" /> },
            { label: "Controls library", icon: <FileText className="h-3.5 w-3.5" />, badge: { text: "248", tone: "n" } },
            { label: "Evidence vault", icon: <Lock className="h-3.5 w-3.5" />, badge: { text: "1.4K", tone: "n" } },
            { label: "Findings", icon: <AlertTriangle className="h-3.5 w-3.5" />, badge: { text: "5", tone: "a" } },
          ],
        },
        {
          title: "Frameworks",
          items: [
            { label: "ISO 27001:2022", icon: <ShieldCheck className="h-3.5 w-3.5" />, badge: { text: "92%", tone: "g" } },
            { label: "SOC 2 Type II", icon: <FileText className="h-3.5 w-3.5" />, badge: { text: "89%", tone: "g" } },
            { label: "PCI-DSS v4", icon: <Lock className="h-3.5 w-3.5" />, badge: { text: "94%", tone: "g" } },
            { label: "GDPR / DPDP", icon: <Eye className="h-3.5 w-3.5" />, badge: { text: "85%", tone: "a" } },
            { label: "HIPAA (BAA)", icon: <FileText className="h-3.5 w-3.5" />, badge: { text: "78%", tone: "a" } },
          ],
        },
        {
          title: "Connectors",
          items: [
            { label: "AWS / GCP / Azure", icon: <Cloud className="h-3.5 w-3.5" /> },
            { label: "GitHub · CI/CD", icon: <GitPullRequest className="h-3.5 w-3.5" /> },
            { label: "Okta · Google IdP", icon: <KeyRound className="h-3.5 w-3.5" /> },
          ],
        },
      ]}
    >
      <PageHeader
        title="IT compliance & certifications"
        subtitle="Helix Cloud Inc. · 248 controls · evidence collected continuously across 6 systems"
        actions={
          <>
            <Btn variant="o"><FileText className="h-3.5 w-3.5" /> Auditor portal</Btn>
            <Btn><Server className="h-3.5 w-3.5" /> Run control test</Btn>
          </>
        }
      />

      <Banner
        tone="info"
        icon={<Cpu className="h-4 w-4" />}
        text="Halo agent collected 1,427 fresh evidence artifacts in the last 24h. ISO 27001 surveillance audit on May 12 — you're 92% ready."
        cta="View readiness"
      />

      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <Kpi value="89" label="Avg framework score" change="+3 this quarter" tone="up" />
        <Kpi value="248" label="Controls under monitoring" />
        <Kpi value="5" label="Open findings" change="2 critical" tone="dn" />
        <Kpi value="100%" label="Evidence freshness" change="No stale items" tone="up" />
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-5">
        <ScoreRing score={92} reg="ISO 27001" tone="g" label="Annex A 2022" />
        <ScoreRing score={89} reg="SOC 2" tone="g" label="Type II window" />
        <ScoreRing score={94} reg="PCI-DSS" tone="g" label="v4 self-assess" />
        <ScoreRing score={85} reg="GDPR" tone="a" label="DPA gaps" />
        <ScoreRing score={78} reg="HIPAA" tone="a" label="BAA coverage" />
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card title="Top open findings" action={<span className="cursor-pointer text-[12px] font-bold text-primary">All findings</span>}>
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-border text-left text-[10px] font-bold uppercase tracking-[0.1em] text-ink-3">
                <th className="bg-surface-2 px-3 py-2.5">Finding</th>
                <th className="bg-surface-2 px-3 py-2.5">Framework</th>
                <th className="bg-surface-2 px-3 py-2.5">Owner</th>
                <th className="bg-surface-2 px-3 py-2.5">Severity</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["3 prod IAM users without MFA", "ISO A.5.17 / SOC2 CC6.6", "Halo agent", "miss"],
                ["Backup restore test overdue (90d)", "ISO A.8.13", "Aether agent", "pend"],
                ["DPA missing for 2 sub-processors", "GDPR Art.28", "Vela agent", "miss"],
                ["Log retention < 365d on EU region", "PCI 10.5.1", "Halo agent", "pend"],
                ["BAA not signed with one vendor", "HIPAA §164.308", "Vela agent", "pend"],
              ].map(([f, fr, o, s]) => (
                <tr key={f as string} className="border-b border-border last:border-0">
                  <td className="px-3 py-3 text-[13px] font-bold">{f}</td>
                  <td className="px-3 py-3 font-mono text-[11px] text-ink-3">{fr}</td>
                  <td className="px-3 py-3 text-[12px] text-primary">{o}</td>
                  <td className="px-3 py-3"><Pill tone={s as "miss" | "pend"}>{s === "miss" ? "CRITICAL" : "MEDIUM"}</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Continuous evidence">
          <div className="space-y-3">
            {[
              { src: "AWS CloudTrail", count: "412 events", state: "fresh" },
              { src: "GitHub PR reviews", count: "87 PRs", state: "fresh" },
              { src: "Okta access reviews", count: "23 reviews", state: "fresh" },
              { src: "Vanta-style daily snapshots", count: "248 controls", state: "fresh" },
              { src: "Pen test report (2024-Q4)", count: "1 doc", state: "stale" },
            ].map((e) => (
              <div key={e.src} className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0">
                <div>
                  <div className="text-[12px] font-bold">{e.src}</div>
                  <div className="font-mono text-[10px] text-ink-4">{e.count}</div>
                </div>
                <Pill tone={e.state === "fresh" ? "done" : "pend"}>{e.state.toUpperCase()}</Pill>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <AgentOrchestrationPanel
        industry="IT & SaaS"
        agents={[
          { name: "Halo", role: "Cloud Posture Agent", status: "busy" },
          { name: "Aether", role: "Backup & DR Tester", status: "idle" },
          { name: "Vela", role: "Vendor / DPA Manager", status: "review" },
          { name: "Nova", role: "Access Review Bot", status: "busy" },
          { name: "Echo", role: "Pen-test Triage", status: "idle" },
          { name: "Pulse", role: "SLA / SLO Watcher", status: "busy" },
          { name: "Atlas", role: "Auditor Q&A Agent", status: "idle" },
        ]}
        initialTasks={[
          { id: "1", agent: "Halo", task: "Scanning AWS prod for non-MFA IAM users", status: "running", reasoning: "Found 3. Auto-opening Jira tickets to security-eng with 7-day SLA, blocking new access keys via SCP." },
          { id: "2", agent: "Vela", task: "Generating DPA chase emails for 2 sub-processors", status: "queued", reasoning: "Templates with GDPR Art.28 + DPDP Act schedule, e-sign via DocuSign." },
          { id: "3", agent: "Atlas", task: "Drafting answers to 14 SOC 2 auditor questions", status: "queued", reasoning: "Pulling control evidence by CC reference; flagging 2 questions as needing CISO review." },
          { id: "4", agent: "Aether", task: "Scheduling quarterly DR drill", status: "queued" },
        ]}
      />
    </AppShell>
  );
}
