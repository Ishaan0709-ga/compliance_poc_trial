import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/PortalShell";
import { Card, Kpi, Pill, Btn, PageHeader } from "@/components/ui-kit";
import { Bell, FileSignature, MessageSquare, Wallet, BookOpen, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/partner/")({
  head: () => ({ meta: [{ title: "Partner Workspace — ComplyOS" }] }),
  component: PartnerHome,
});

const ASSIGNMENTS = [
  { id: "FMB-2419", svc: "GSTR-3B — Lumen Labs Pvt Ltd", due: "May 18", stage: "Awaiting docs", tone: "pend" as const },
  { id: "FMB-2402", svc: "AOC-4 Annual ROC — Lumen Labs", due: "May 28", stage: "Drafting", tone: "pend" as const },
  { id: "FMB-2410", svc: "ITR-6 — Hiveloop Tech", due: "May 22", stage: "Review", tone: "pend" as const },
  { id: "FMB-2388", svc: "TDS Q4 — Lumen Labs", due: "Apr 30", stage: "Filed", tone: "done" as const },
];

const FEED = [
  { src: "CBIC", t: "Notification 12/2026 — GSTR-1 due date extended for taxpayers in TN/KL", time: "3h ago" },
  { src: "MCA", t: "Form CSR-2 to be filed separately for FY 25-26 by 31 May 2026", time: "1d ago" },
  { src: "CBDT", t: "Circular 4/2026: clarification on Sec 194R applicability for SaaS credits", time: "2d ago" },
];

function PartnerHome() {
  return (
    <PortalShell portalId="partner">
      <PageHeader
        title="Welcome, CA Neha"
        subtitle="5 active assignments · ₹ 84,500 pending payout · 2 client messages"
        actions={
          <>
            <Btn variant="o">
              <BookOpen className="h-4 w-4" /> Templates
            </Btn>
            <Btn>
              <FileSignature className="h-4 w-4" /> Submit deliverable
            </Btn>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi value="5" label="Active assignments" change="2 due this week" tone="neu" />
        <Kpi value="98%" label="On-time delivery" change="last 30 days" tone="up" />
        <Kpi value="₹ 84,500" label="Pending payout" change="paid 12 May" tone="neu" />
        <Kpi value="4.9★" label="Client rating" change="from 23 reviews" tone="up" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="My assignments" className="lg:col-span-2">
          <div className="divide-y divide-border">
            {ASSIGNMENTS.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-medium text-ink-4">{a.id}</span>
                    <Pill tone={a.tone}>{a.stage}</Pill>
                  </div>
                  <div className="mt-1 text-[13px] font-medium text-ink">{a.svc}</div>
                  <div className="text-[11px] text-ink-4">Due {a.due}</div>
                </div>
                <button className="text-[12px] font-medium text-primary hover:underline">
                  Open <ArrowRight className="inline h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Earnings */}
        <Card title="Earnings & payouts">
          <div className="rounded-lg bg-gradient-brand p-4 text-white">
            <div className="text-[11px] font-medium uppercase tracking-widest opacity-80">
              Pending payout
            </div>
            <div className="mt-1 text-[26px] font-semibold tracking-[-0.02em]">₹ 84,500</div>
            <div className="text-[11px] opacity-80">Will be settled on 12 May 2026</div>
          </div>
          <div className="mt-3 space-y-2 text-[12px]">
            <div className="flex justify-between">
              <span className="text-ink-3">This month</span>
              <span className="font-medium">₹ 1,42,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-3">YTD earnings</span>
              <span className="font-medium">₹ 6,84,200</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-3">TDS deducted</span>
              <span className="font-medium">₹ 68,420</span>
            </div>
          </div>
          <Btn variant="o" className="mt-3 w-full justify-center">
            <Wallet className="h-3.5 w-3.5" /> Download Form 16A
          </Btn>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Regulatory feed */}
        <Card title="Regulatory updates" className="lg:col-span-2">
          <div className="space-y-2">
            {FEED.map((f) => (
              <div
                key={f.t}
                className="flex items-start gap-3 rounded-lg border border-border bg-surface-2 p-3"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-primary-muted">
                  <Bell className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Pill tone="infra">{f.src}</Pill>
                    <span className="text-[10px] text-ink-4">{f.time}</span>
                  </div>
                  <div className="mt-1 text-[13px] text-ink-2">{f.t}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Client messages">
          <div className="space-y-2">
            {[
              { c: "Riya Mehta · Lumen Labs", m: "Sharing the Apr bank statement now…", time: "10m" },
              { c: "Suresh K · Hiveloop", m: "Need clarification on 80JJAA deduction.", time: "2h" },
            ].map((m) => (
              <div key={m.c} className="rounded-lg border border-border bg-surface-2 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-[12px] font-medium text-ink">{m.c}</div>
                  <span className="text-[10px] text-ink-4">{m.time}</span>
                </div>
                <div className="mt-1 text-[12px] text-ink-3">{m.m}</div>
              </div>
            ))}
            <Btn variant="o" className="w-full justify-center">
              <MessageSquare className="h-3.5 w-3.5" /> Open all chats
            </Btn>
          </div>
        </Card>
      </div>
    </PortalShell>
  );
}
