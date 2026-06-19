import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader, Card, Kpi, Pill, Btn, Banner } from "@/components/ui-kit";
import { AgentOrchestrationPanel } from "@/components/AgentOrchestrationPanel";
import {
  Building2,
  Bot,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Receipt,
  Stamp,
  HandCoins,
  HardHat,
  Users,
  ArrowRight,
  Workflow,
  Gauge,
} from "lucide-react";

export const Route = createFileRoute("/govt")({
  head: () => ({
    meta: [
      { title: "Government Auto-Reporting & Auto-Approval Portal — ComplyOS" },
      {
        name: "description",
        content:
          "Auto-file GST/TDS, auto-renew licenses, auto-process ESI/PF returns, auto-disburse DBT subsidies. Humans handle exceptions only.",
      },
      { property: "og:title", content: "Government Auto-Approval Portal — ComplyOS" },
      {
        property: "og:description",
        content: "AI agents automate the mundane processes of government compliance and disbursement.",
      },
    ],
  }),
  component: GovtPage,
});

const PIPELINES = [
  {
    id: "gst-tds",
    icon: Receipt,
    title: "GST / TDS auto-reconciliation & filing",
    desc: "GSTR-1 / 3B / 9 + Form 26Q / 27Q. Vendor mismatch detection, ITC reconciliation, e-invoice IRN validation.",
    automated: 94,
    queue: 1247,
    exceptions: 76,
    autoApprove: "Returns where 2B-2A delta ≤ ₹500 and DSC available",
  },
  {
    id: "licenses",
    icon: Stamp,
    title: "Trade license & permit auto-renewal",
    desc: "Shops & Establishment, FSSAI, Pollution NOC, Fire NOC, Trade License — fetch, validate, pay, file.",
    automated: 88,
    queue: 312,
    exceptions: 38,
    autoApprove: "Renewals with no change in premise, employees ≤ slab, paid challan",
  },
  {
    id: "labour",
    icon: HardHat,
    title: "Labour: ESI / PF / Profession Tax",
    desc: "Monthly ECR, ESI return, PT payments, bonus calculation, wage register upkeep.",
    automated: 96,
    queue: 4892,
    exceptions: 124,
    autoApprove: "Wage runs within 5% of prior month, headcount delta ≤ 3",
  },
  {
    id: "dbt",
    icon: HandCoins,
    title: "DBT subsidy / scheme disbursement",
    desc: "PM-Kisan, MGNREGA wages, scholarship, LPG subsidy. Pre-verified beneficiaries get instant disbursement.",
    automated: 92,
    queue: 28471,
    exceptions: 1843,
    autoApprove: "Aadhaar-seeded, eKYC fresh, eligibility unchanged from prior cycle",
  },
];

function GovtPage() {
  return (
    <AppShell
      industryId="govt"
      sidebarSections={[
        {
          title: "Pipelines",
          items: [
            { label: "Overview", to: "/govt", icon: <Workflow className="h-3.5 w-3.5" /> },
            { label: "GST / TDS", icon: <Receipt className="h-3.5 w-3.5" />, badge: { text: "76", tone: "a" } },
            { label: "Licenses", icon: <Stamp className="h-3.5 w-3.5" />, badge: { text: "38", tone: "a" } },
            { label: "Labour returns", icon: <HardHat className="h-3.5 w-3.5" />, badge: { text: "124", tone: "a" } },
            { label: "DBT disbursement", icon: <HandCoins className="h-3.5 w-3.5" />, badge: { text: "1.8K", tone: "r" } },
          ],
        },
        {
          title: "Operations",
          items: [
            { label: "Approval queue", icon: <FileCheck2 className="h-3.5 w-3.5" />, badge: { text: "2K", tone: "n" } },
            { label: "Beneficiaries", icon: <Users className="h-3.5 w-3.5" />, badge: { text: "847K", tone: "n" } },
            { label: "Audit trail", icon: <Gauge className="h-3.5 w-3.5" /> },
          ],
        },
      ]}
    >
      <PageHeader
        title="Auto-reporting & auto-approval portal"
        subtitle="Department of Finance — State Treasury · 847K beneficiaries · ₹1,247 Cr disbursed YTD"
        actions={
          <>
            <Btn variant="o"><FileCheck2 className="h-3.5 w-3.5" /> Audit pack</Btn>
            <Btn><Bot className="h-3.5 w-3.5" /> Configure rules</Btn>
          </>
        }
      />

      <Banner
        tone="info"
        icon={<CheckCircle2 className="h-4 w-4" />}
        text="In the last 24h, 38,471 transactions were auto-processed end-to-end. 2,081 exceptions routed to officers. Avg processing time: 4.2 minutes vs 12 days manual."
      />

      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <Kpi value="38,471" label="Auto-processed (24h)" change="+18% vs yesterday" tone="up" />
        <Kpi value="94.6%" label="Straight-through rate" change="Above 90% target" tone="up" />
        <Kpi value="₹1,247 Cr" label="Disbursed YTD" />
        <Kpi value="2,081" label="Exceptions awaiting officer" change="SLA: < 4h" tone="neu" />
      </div>

      {/* Pipelines */}
      <div className="mb-4 grid gap-4">
        {PIPELINES.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.id}
              className="rounded-xl border border-border bg-surface p-5 shadow-card transition-all hover:shadow-card-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-muted text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-[16px] font-extrabold tracking-[-0.02em]">{p.title}</div>
                    <div className="mt-1 max-w-2xl text-[12px] text-ink-3">{p.desc}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Btn variant="o" className="text-[12px]">View queue</Btn>
                  <Btn className="text-[12px]">
                    Run pipeline <ArrowRight className="h-3 w-3" />
                  </Btn>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <div className="rounded-lg bg-surface-2 p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink-4">
                    Automation rate
                  </div>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-[24px] font-extrabold tracking-[-0.03em] text-success">
                      {p.automated}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-3">
                    <div className="h-full bg-success" style={{ width: `${p.automated}%` }} />
                  </div>
                </div>
                <div className="rounded-lg bg-surface-2 p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink-4">
                    Queue (24h)
                  </div>
                  <div className="mt-1 text-[24px] font-extrabold tracking-[-0.03em]">
                    {p.queue.toLocaleString("en-IN")}
                  </div>
                  <div className="mt-1 text-[10px] text-ink-4">items processed</div>
                </div>
                <div className="rounded-lg bg-surface-2 p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink-4">
                    Exceptions
                  </div>
                  <div className="mt-1 text-[24px] font-extrabold tracking-[-0.03em] text-warning">
                    {p.exceptions}
                  </div>
                  <div className="mt-1 text-[10px] text-ink-4">routed to officers</div>
                </div>
                <div className="rounded-lg border border-success-border bg-success-muted p-3">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.1em] text-success">
                    <CheckCircle2 className="h-3 w-3" /> Auto-approve when
                  </div>
                  <div className="mt-1 text-[11px] leading-snug text-ink-2">{p.autoApprove}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Exception queue */}
      <Card title="Officer review queue (top exceptions)" action={<span className="cursor-pointer text-[12px] font-bold text-primary">All exceptions</span>}>
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-border text-left text-[10px] font-bold uppercase tracking-[0.1em] text-ink-3">
              <th className="bg-surface-2 px-3 py-2.5">Case ID</th>
              <th className="bg-surface-2 px-3 py-2.5">Pipeline</th>
              <th className="bg-surface-2 px-3 py-2.5">Why escalated</th>
              <th className="bg-surface-2 px-3 py-2.5">SLA</th>
              <th className="bg-surface-2 px-3 py-2.5">Action</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["DBT-9241834", "DBT — PM-Kisan", "Aadhaar eKYC stale (>180d)", "2h", "miss"],
              ["GST-RT-58821", "GST", "ITC mismatch ₹14,200 vs vendor", "3h", "pend"],
              ["LIC-RNW-3392", "License — FSSAI", "Premise photo unclear, OCR low confidence", "6h", "pend"],
              ["LBR-ECR-7741", "Labour — PF", "New employee, UAN not generated", "1h", "miss"],
              ["DBT-9242019", "DBT — Scholarship", "Marks card not parseable; manual upload required", "8h", "pend"],
            ].map(([id, p, why, sla, tone]) => (
              <tr key={id as string} className="border-b border-border last:border-0">
                <td className="px-3 py-3 font-mono text-[12px] font-bold text-primary">{id}</td>
                <td className="px-3 py-3 text-[12px]">{p}</td>
                <td className="px-3 py-3 text-[12px] text-ink-3">{why}</td>
                <td className="px-3 py-3"><Pill tone={tone as "miss" | "pend"}>{sla} LEFT</Pill></td>
                <td className="px-3 py-3"><Btn variant="o" className="text-[11px]">Review</Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="mt-4">
        <AgentOrchestrationPanel
          industry="Government"
          agents={[
            { name: "Bharat", role: "GST/TDS Filing Bot", status: "busy" },
            { name: "Aadhya", role: "License Renewal Agent", status: "busy" },
            { name: "Vikram", role: "ESI / PF / PT Agent", status: "busy" },
            { name: "Diya", role: "DBT Eligibility Engine", status: "review" },
            { name: "Tejas", role: "Aadhaar / eKYC Validator", status: "busy" },
            { name: "Priya", role: "Document OCR + Extraction", status: "busy" },
            { name: "Arjun", role: "Anti-Fraud Pattern Watch", status: "busy" },
            { name: "Saanvi", role: "Officer-in-Loop Router", status: "idle" },
            { name: "Karna", role: "Audit Trail Sealer", status: "idle" },
          ]}
          initialTasks={[
            { id: "1", agent: "Diya", task: "Auto-disbursing PM-Kisan instalment to 28,471 beneficiaries", status: "running", reasoning: "Eligibility unchanged from cycle 14, Aadhaar seeded, land record digitized. ₹2,000 × 28,471 = ₹56.94 Cr to NPCI." },
            { id: "2", agent: "Arjun", task: "Detected ghost beneficiary cluster — 47 accounts share IFSC + IP", status: "running", reasoning: "Pausing disbursement, opening case file with district collector. Pattern matches 2023 fraud typology #FT-2107." },
            { id: "3", agent: "Aadhya", task: "Bulk-renewing 312 trade licenses with unchanged premises", status: "queued", reasoning: "Auto-debiting renewal fees, pulling FY23-24 returns as supporting docs, generating digitally-signed certificates." },
            { id: "4", agent: "Bharat", task: "Filing March GSTR-3B for 1,247 SME units under treasury PaaS", status: "queued" },
            { id: "5", agent: "Saanvi", task: "Routing 1,843 DBT exceptions to 47 district officers by load", status: "queued", reasoning: "Round-robin balancing pending case count + officer expertise tag (Aadhaar / land / education)." },
          ]}
        />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Card title="Citizen impact (last 30d)">
          <div className="text-[28px] font-extrabold tracking-[-0.04em]">847,210</div>
          <div className="text-[12px] text-ink-3">citizens served end-to-end without visiting an office</div>
        </Card>
        <Card title="Avg processing time">
          <div className="text-[28px] font-extrabold tracking-[-0.04em]">4.2 min</div>
          <div className="text-[12px] text-success">vs 12 days under manual workflow</div>
        </Card>
        <Card title="Fraud prevented">
          <div className="text-[28px] font-extrabold tracking-[-0.04em]">₹14.7 Cr</div>
          <div className="text-[12px] text-ink-3">flagged & paused — Arjun anti-fraud agent</div>
        </Card>
      </div>
    </AppShell>
  );
}
