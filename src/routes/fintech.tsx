import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader, Card, Kpi, ScoreRing, Pill, Btn, Banner } from "@/components/ui-kit";
import { AgentOrchestrationPanel } from "@/components/AgentOrchestrationPanel";
import {
  Landmark,
  AlertTriangle,
  CreditCard,
  TrendingUp,
  Users,
  FileText,
  Lock,
  ScrollText,
  Wallet,
  ShieldAlert,
  Banknote,
} from "lucide-react";

export const Route = createFileRoute("/fintech")({
  head: () => ({
    meta: [
      { title: "Fintech Compliance — ComplyOS" },
      {
        name: "description",
        content:
          "RBI, SEBI, PMLA, DPDP — KYC, AML, capital adequacy and grievance SLAs monitored by AI agents.",
      },
      { property: "og:title", content: "Fintech Compliance Dashboard — ComplyOS" },
      {
        property: "og:description",
        content: "Realtime supervision for payments, lending and capital markets entities in India.",
      },
    ],
  }),
  component: FintechPage,
});

function FintechPage() {
  return (
    <AppShell
      industryId="fintech"
      sidebarSections={[
        {
          title: "Overview",
          items: [
            { label: "Dashboard", to: "/fintech", icon: <Landmark className="h-3.5 w-3.5" /> },
            { label: "Customers (KYC)", icon: <Users className="h-3.5 w-3.5" />, badge: { text: "1.2M", tone: "n" } },
            { label: "AML alerts", icon: <ShieldAlert className="h-3.5 w-3.5" />, badge: { text: "47", tone: "a" } },
            { label: "Grievances", icon: <FileText className="h-3.5 w-3.5" />, badge: { text: "8", tone: "r" } },
          ],
        },
        {
          title: "Regulators",
          items: [
            { label: "RBI master directions", icon: <Banknote className="h-3.5 w-3.5" />, badge: { text: "96%", tone: "g" } },
            { label: "SEBI — IA, RA, PMS", icon: <TrendingUp className="h-3.5 w-3.5" />, badge: { text: "91%", tone: "g" } },
            { label: "PMLA / FIU-IND", icon: <Lock className="h-3.5 w-3.5" />, badge: { text: "94%", tone: "g" } },
            { label: "DPDP Act 2023", icon: <ScrollText className="h-3.5 w-3.5" />, badge: { text: "82%", tone: "a" } },
            { label: "PCI-DSS v4", icon: <CreditCard className="h-3.5 w-3.5" />, badge: { text: "97%", tone: "g" } },
          ],
        },
      ]}
    >
      <PageHeader
        title="Fintech compliance"
        subtitle="Indus Pay (PA-PG) · 1.2M active customers · ₹847 Cr daily TPV"
        actions={
          <>
            <Btn variant="o"><FileText className="h-3.5 w-3.5" /> Quarterly RBI return</Btn>
            <Btn><Wallet className="h-3.5 w-3.5" /> Run AML sweep</Btn>
          </>
        }
      />

      <Banner
        tone="warn"
        icon={<AlertTriangle className="h-4 w-4" />}
        text="DPDP consent re-collection pending for 18,420 customers onboarded before Oct 2023 — Vyom agent ready to dispatch in-app prompts."
        cta="Approve campaign"
      />

      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <Kpi value="92" label="Overall RBI score" change="+2 vs last month" tone="up" />
        <Kpi value="47" label="Open AML alerts" change="-12 vs last week" tone="up" />
        <Kpi value="₹847 Cr" label="Daily TPV monitored" />
        <Kpi value="99.94%" label="System uptime (RBI mandate)" change="Above 99.9%" tone="up" />
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-5">
        <ScoreRing score={96} reg="RBI" tone="g" label="Master directions" />
        <ScoreRing score={91} reg="SEBI" tone="g" label="IA / RA / PMS" />
        <ScoreRing score={94} reg="PMLA" tone="g" label="FIU reporting" />
        <ScoreRing score={82} reg="DPDP" tone="a" label="Consent debt" />
        <ScoreRing score={97} reg="PCI" tone="g" label="DSS v4" />
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card title="Regulatory calendar — next 30 days" action={<span className="cursor-pointer text-[12px] font-bold text-primary">Open calendar</span>}>
          <div className="divide-y divide-border">
            {[
              { day: "28", mon: "APR", title: "RBI System Audit Report (PA-PG)", desc: "Annual SAR by CERT-In empanelled auditor due to DPSS Department.", chip: "r" },
              { day: "07", mon: "MAY", title: "FIU-IND CTR & STR submissions", desc: "Cash transactions ≥₹10L and suspicious transactions for April.", chip: "a" },
              { day: "15", mon: "MAY", title: "Capital adequacy (NetWorth) cert.", desc: "₹15 Cr minimum NW for PA license. Auditor cert + bank balance proof.", chip: "a" },
              { day: "30", mon: "MAY", title: "Customer grievance redressal report", desc: "Quarterly report on Internal Ombudsman cases — RBI mandate.", chip: "g" },
            ].map((d) => (
              <div key={d.day + d.title} className="flex items-start gap-3 py-3">
                <div className="w-11 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-background text-center">
                  <div className={`h-1.5 ${d.chip === "r" ? "bg-destructive" : d.chip === "a" ? "bg-warning" : "bg-success"}`} />
                  <div className="text-[18px] font-extrabold leading-tight">{d.day}</div>
                  <div className="pb-1 text-[9px] font-bold uppercase tracking-[0.07em] text-ink-4">{d.mon}</div>
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-bold">{d.title}</div>
                  <div className="mt-0.5 text-[12px] text-ink-3">{d.desc}</div>
                  <Pill tone={d.chip === "r" ? "miss" : d.chip === "a" ? "pend" : "done"}>
                    {d.chip === "r" ? "URGENT" : d.chip === "a" ? "UPCOMING" : "ON TRACK"}
                  </Pill>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Top AML alerts (last 24h)">
          <div className="space-y-2">
            {[
              { id: "STR-7821", risk: "HIGH", who: "Merchant ID 4490 · sudden 18× volume spike", agent: "Veer" },
              { id: "STR-7815", risk: "MED", who: "5 customers · same device · diff PAN", agent: "Veer" },
              { id: "STR-7803", risk: "HIGH", who: "Cross-border outflow ≥ $250K, no FIRC", agent: "Tara" },
              { id: "STR-7790", risk: "LOW", who: "Pattern: ₹49,999 × 12 in 90 mins", agent: "Veer" },
            ].map((a) => (
              <div key={a.id} className="flex items-start gap-2 rounded-lg border border-border bg-surface-2/50 p-2.5">
                <div className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${a.risk === "HIGH" ? "bg-destructive" : a.risk === "MED" ? "bg-warning" : "bg-ink-4"}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold">{a.id}</span>
                    <Pill tone={a.risk === "HIGH" ? "miss" : a.risk === "MED" ? "pend" : "n"}>{a.risk}</Pill>
                  </div>
                  <div className="mt-0.5 text-[12px] text-ink-2">{a.who}</div>
                  <div className="mt-0.5 text-[10px] text-ink-4">Detected by agent <span className="font-bold text-primary">{a.agent}</span></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <AgentOrchestrationPanel
        industry="Fintech"
        agents={[
          { name: "Veer", role: "AML Transaction Monitor", status: "busy" },
          { name: "Tara", role: "Cross-border / FEMA", status: "busy" },
          { name: "Vyom", role: "DPDP Consent Manager", status: "review" },
          { name: "Anvi", role: "RBI Returns Filer", status: "idle" },
          { name: "Kabir", role: "SEBI IA/RA Compliance", status: "idle" },
          { name: "Saira", role: "Customer Grievance SLA", status: "busy" },
          { name: "Ravi", role: "PCI-DSS Continuous Audit", status: "idle" },
          { name: "Mira", role: "Capital Adequacy Watch", status: "idle" },
        ]}
        initialTasks={[
          { id: "1", agent: "Veer", task: "Scoring 47 STR candidates against FATF typologies", status: "running", reasoning: "12 match smurfing pattern (₹49,999 × N within 24h). Auto-creating STR drafts for FIU-IND review." },
          { id: "2", agent: "Vyom", task: "Drafting in-app DPDP consent re-collection flow", status: "queued", reasoning: "Targeting 18,420 pre-Oct-2023 customers. Phased rollout: 5% → 25% → 100% with grievance fallback." },
          { id: "3", agent: "Anvi", task: "Pre-filling DPSS-CO quarterly return", status: "queued" },
          { id: "4", agent: "Saira", task: "Escalating 3 grievances breaching 30-day SLA", status: "queued", reasoning: "Routing to Internal Ombudsman with case bundle, root-cause tag, and proposed redress." },
        ]}
      />
    </AppShell>
  );
}
