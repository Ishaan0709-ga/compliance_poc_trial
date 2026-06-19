import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/PortalShell";
import { Card, Kpi, Pill, Btn, PageHeader } from "@/components/ui-kit";
import { ArrowRight, AlertTriangle, TrendingUp, Users, Briefcase } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin Console — ComplyOS" }] }),
  component: AdminHome,
});

const INTAKE = [
  { id: "FMB-2502", customer: "Lumen Labs Pvt Ltd", svc: "GSTR-9 Annual Return", priority: "high", waited: "12m" },
  { id: "FMB-2501", customer: "Hiveloop Tech", svc: "Trademark Registration — Class 9", priority: "med", waited: "1h" },
  { id: "FMB-2500", customer: "Kala & Sons", svc: "Pvt Ltd Incorporation", priority: "high", waited: "2h" },
  { id: "FMB-2498", customer: "Indus Bakeries", svc: "FSSAI Renewal", priority: "low", waited: "5h" },
];

const SLA = [
  { id: "FMB-2419", svc: "GSTR-3B — Lumen Labs", partner: "CA Neha Iyer", risk: "red", left: "2d" },
  { id: "FMB-2391", svc: "DIR-3 KYC — 4 directors", partner: "CS Rohit Bansal", risk: "amber", left: "5d" },
  { id: "FMB-2380", svc: "Shop & Estab — Indore", partner: "Adv. Meera S.", risk: "amber", left: "6d" },
];

const PARTNERS = [
  { name: "CA Neha Iyer", load: 12, cap: 15, score: 4.9, badge: "g" as const },
  { name: "CS Rohit Bansal", load: 8, cap: 10, score: 4.7, badge: "g" as const },
  { name: "Adv. Meera Subramanian", load: 4, cap: 8, score: 4.6, badge: "g" as const },
  { name: "CA Vikram Joshi", load: 14, cap: 14, score: 4.4, badge: "a" as const },
];

function AdminHome() {
  return (
    <PortalShell portalId="admin">
      <PageHeader
        title="Operations overview"
        subtitle="Mon, 4 May 2026 · 12 orders in intake · 4 SLA at risk"
        actions={
          <>
            <Btn variant="o">Export today</Btn>
            <Btn>Bulk assign</Btn>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi value="₹ 18.4L" label="MRR · April" change="▲ 22% YoY" tone="up" />
        <Kpi value="284" label="Active orders" change="▲ 18 this week" tone="up" />
        <Kpi value="92%" label="On-time SLA" change="Target 95%" tone="dn" />
        <Kpi value="64" label="Active partners" change="3 onboarding" tone="neu" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Order Intake Queue */}
        <Card title="Order Intake Queue" className="lg:col-span-2">
          <div className="divide-y divide-border">
            {INTAKE.map((o) => (
              <div key={o.id} className="flex items-center gap-3 py-3">
                <Pill tone={o.priority === "high" ? "miss" : o.priority === "med" ? "pend" : "n"}>
                  {o.priority}
                </Pill>
                <div className="flex-1">
                  <div className="text-[13px] font-medium text-ink">{o.svc}</div>
                  <div className="text-[11px] text-ink-4">
                    {o.customer} · {o.id} · waited {o.waited}
                  </div>
                </div>
                <Btn variant="o">Assign</Btn>
              </div>
            ))}
          </div>
        </Card>

        {/* SLA Monitor */}
        <Card title="SLA Monitor">
          <div className="space-y-2.5">
            {SLA.map((s) => (
              <div
                key={s.id}
                className="rounded-lg border border-border bg-surface-2 p-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-medium text-ink-4">{s.id}</span>
                  <Pill tone={s.risk === "red" ? "miss" : "pend"}>
                    {s.risk === "red" ? "BREACH RISK" : "AMBER"}
                  </Pill>
                </div>
                <div className="mt-1 text-[12px] font-medium text-ink">{s.svc}</div>
                <div className="text-[11px] text-ink-4">
                  {s.partner} · {s.left} left
                </div>
              </div>
            ))}
            <Btn variant="o" className="w-full justify-center">
              Open SLA board <ArrowRight className="h-3.5 w-3.5" />
            </Btn>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Partners */}
        <Card title="Partner workload" className="lg:col-span-2">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border text-left text-[10px] font-medium uppercase tracking-[0.1em] text-ink-4">
                <th className="pb-2">Partner</th>
                <th className="pb-2">Load</th>
                <th className="pb-2">Score</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {PARTNERS.map((p) => (
                <tr key={p.name} className="border-b border-border last:border-0">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-muted text-[10px] font-medium text-primary">
                        {p.name
                          .split(" ")
                          .slice(-2)
                          .map((s) => s[0])
                          .join("")}
                      </div>
                      <div className="font-medium text-ink">{p.name}</div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 rounded-full bg-surface-2">
                        <div
                          className={`h-full rounded-full ${
                            p.load / p.cap > 0.9 ? "bg-warning" : "bg-success"
                          }`}
                          style={{ width: `${(p.load / p.cap) * 100}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] text-ink-3">
                        {p.load}/{p.cap}
                      </span>
                    </div>
                  </td>
                  <td className="font-mono text-[12px] font-medium">★ {p.score}</td>
                  <td className="text-right">
                    <button className="text-[12px] font-medium text-primary hover:underline">
                      Assign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* BI snapshot */}
        <Card title="Business intelligence">
          <div className="space-y-3">
            <div className="rounded-lg bg-primary-muted p-3">
              <div className="flex items-center gap-2 text-primary">
                <TrendingUp className="h-4 w-4" />
                <span className="text-[11px] font-medium uppercase tracking-[0.1em]">Top service</span>
              </div>
              <div className="mt-1 text-[14px] font-semibold text-ink">
                GST Return Filing
              </div>
              <div className="text-[11px] text-ink-3">142 orders · ₹ 6.2L revenue</div>
            </div>
            <div className="rounded-lg bg-warning-muted p-3">
              <div className="flex items-center gap-2 text-warning">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-[11px] font-medium uppercase tracking-[0.1em]">
                  Low velocity
                </span>
              </div>
              <div className="mt-1 text-[14px] font-semibold text-ink">
                Trademark Renewals
              </div>
              <div className="text-[11px] text-ink-3">avg TAT 18d (target 10d)</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg border border-border p-2">
                <Users className="mx-auto h-4 w-4 text-ink-3" />
                <div className="mt-1 text-[16px] font-semibold">1,284</div>
                <div className="text-[10px] text-ink-4">Customers</div>
              </div>
              <div className="rounded-lg border border-border p-2">
                <Briefcase className="mx-auto h-4 w-4 text-ink-3" />
                <div className="mt-1 text-[16px] font-semibold">64</div>
                <div className="text-[10px] text-ink-4">Partners</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </PortalShell>
  );
}
