import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PageHeader, Card, Kpi, ScoreRing, Pill, Btn, Banner } from "@/components/ui-kit";
import { AgentOrchestrationPanel } from "@/components/AgentOrchestrationPanel";
import {
  Factory,
  AlertTriangle,
  FileText,
  Receipt,
  Building,
  HardHat,
  Sprout,
  Calendar,
  IndianRupee,
  Store,
} from "lucide-react";

export const Route = createFileRoute("/msme")({
  head: () => ({
    meta: [
      { title: "MSME Compliance — ComplyOS" },
      {
        name: "description",
        content:
          "Udyam, GST, FSSAI, Shops & Establishment, Pollution NOC, labour returns — automated for small businesses.",
      },
      { property: "og:title", content: "MSME Compliance Dashboard — ComplyOS" },
      {
        property: "og:description",
        content: "Run your business; we'll keep you compliant. Built for India's 6.3 Cr MSMEs.",
      },
    ],
  }),
  component: MSMEPage,
});

function MSMEPage() {
  return (
    <AppShell
      industryId="msme"
      sidebarSections={[
        {
          title: "Overview",
          items: [
            { label: "Dashboard", to: "/msme", icon: <Factory className="h-3.5 w-3.5" /> },
            { label: "Returns calendar", icon: <Calendar className="h-3.5 w-3.5" />, badge: { text: "4", tone: "a" } },
            { label: "Documents", icon: <FileText className="h-3.5 w-3.5" /> },
            { label: "Notices & replies", icon: <AlertTriangle className="h-3.5 w-3.5" />, badge: { text: "1", tone: "r" } },
          ],
        },
        {
          title: "Registrations",
          items: [
            { label: "Udyam", icon: <Building className="h-3.5 w-3.5" />, badge: { text: "OK", tone: "g" } },
            { label: "GST", icon: <Receipt className="h-3.5 w-3.5" />, badge: { text: "OK", tone: "g" } },
            { label: "Shops & Estab.", icon: <Store className="h-3.5 w-3.5" />, badge: { text: "OK", tone: "g" } },
            { label: "FSSAI", icon: <Sprout className="h-3.5 w-3.5" />, badge: { text: "30d", tone: "a" } },
            { label: "Factory License", icon: <HardHat className="h-3.5 w-3.5" />, badge: { text: "OK", tone: "g" } },
          ],
        },
      ]}
    >
      <PageHeader
        title="MSME compliance"
        subtitle="Saraswati Foods Pvt Ltd · Udyam: KA-09-0123456 · 47 employees · ₹4.2 Cr turnover"
        actions={
          <>
            <Btn variant="o"><FileText className="h-3.5 w-3.5" /> Compliance certificate</Btn>
            <Btn><Receipt className="h-3.5 w-3.5" /> Auto-file GSTR-3B</Btn>
          </>
        }
      />

      <Banner
        tone="danger"
        icon={<AlertTriangle className="h-4 w-4" />}
        text="GST notice ASMT-10 received from Karnataka commercial taxes — Lakshmi agent has drafted a reply with reconciliation, awaiting your e-sign."
        cta="Review reply"
      />

      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <Kpi value="78" label="Compliance score" change="+5 this month" tone="up" />
        <Kpi value="4" label="Returns due in 30d" />
        <Kpi value="₹0" label="Penalties YTD" change="Saved ₹1.4L" tone="up" />
        <Kpi value="47" label="Employees on PF/ESI" />
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-5">
        <ScoreRing score={92} reg="GST" tone="g" label="Returns timely" />
        <ScoreRing score={88} reg="TDS" tone="g" label="Q4 filed" />
        <ScoreRing score={70} reg="FSSAI" tone="a" label="Renew 30d" />
        <ScoreRing score={84} reg="Labour" tone="g" label="PF / ESI / S&E" />
        <ScoreRing score={66} reg="PCB NOC" tone="a" label="Renew 60d" />
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card title="Filings calendar — next 60 days">
          <div className="divide-y divide-border">
            {[
              { day: "20", mon: "APR", title: "GSTR-3B (March)", desc: "Auto-prepared from Tally · ₹4.7L tax payable · 1-tap submit", chip: "a" },
              { day: "30", mon: "APR", title: "ESI / PF challan (March wages)", desc: "47 employees · ₹2.84L · auto-debit set", chip: "a" },
              { day: "07", mon: "MAY", title: "TDS Form 26Q (Q4)", desc: "Vendor payments TDS · 14 deductees", chip: "g" },
              { day: "15", mon: "MAY", title: "FSSAI license renewal", desc: "Expires Jun 14 · upload water test + medical fitness", chip: "r" },
              { day: "30", mon: "MAY", title: "Professional Tax (KTL)", desc: "47 employees · auto-filed via Karnataka portal", chip: "g" },
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
                </div>
                <Btn variant="o" className="text-[11px]">Auto-file</Btn>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Money saved by automation">
          <div className="text-[36px] font-extrabold tracking-[-0.04em]">₹1,42,800</div>
          <div className="text-[12px] text-ink-3">FY24-25 · late fees + interest avoided</div>
          <div className="mt-4 space-y-2 border-t border-border pt-4">
            {[
              ["GST late fees avoided", "₹62,400", IndianRupee],
              ["TDS interest waived", "₹38,200", IndianRupee],
              ["FSSAI re-application avoided", "₹25,000", IndianRupee],
              ["EPF damages prevented", "₹17,200", IndianRupee],
            ].map(([k, v]) => (
              <div key={k as string} className="flex items-center justify-between text-[12px]">
                <span className="text-ink-3">{k as string}</span>
                <span className="font-mono font-bold text-success">{v as string}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <AgentOrchestrationPanel
        industry="MSME"
        agents={[
          { name: "Lakshmi", role: "GST Returns Agent", status: "busy" },
          { name: "Krish", role: "TDS / Income Tax", status: "idle" },
          { name: "Asha", role: "Labour & Wages", status: "busy" },
          { name: "Pari", role: "Licenses & Renewals", status: "review" },
          { name: "Devi", role: "Notices & Replies", status: "busy" },
        ]}
        initialTasks={[
          { id: "1", agent: "Lakshmi", task: "Reconciling GSTR-2B with purchase register", status: "running", reasoning: "Found ₹84,200 ITC mismatch with vendor M/s Sharma Packaging — auto-emailing them to file their GSTR-1 amendment." },
          { id: "2", agent: "Devi", task: "Drafting reply to ASMT-10 notice", status: "queued", reasoning: "Notice cites discrepancy in turnover declaration. Pulling 3B vs 1 reconciliation for FY23-24, attaching CA's bank statement summary." },
          { id: "3", agent: "Pari", task: "Initiating FSSAI renewal application", status: "queued" },
          { id: "4", agent: "Asha", task: "Computing April wages with new minimum wage notification", status: "queued", reasoning: "Karnataka labour dept revised semi-skilled wage to ₹532/day. 19 employees impacted — generating revised salary slips." },
        ]}
      />
    </AppShell>
  );
}
