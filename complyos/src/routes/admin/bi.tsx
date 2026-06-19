import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/PortalShell";
import { Card, PageHeader, Kpi } from "@/components/ui-kit";

export const Route = createFileRoute("/admin/bi")({
  head: () => ({ meta: [{ title: "Business Intelligence — ComplyOS" }] }),
  component: BI,
});

const SERVICES = [
  { n: "GST Return Filing", o: 142, r: 6.2 },
  { n: "ROC Annual Filing", o: 38, r: 3.0 },
  { n: "Trademark Registration", o: 24, r: 1.7 },
  { n: "Pvt Ltd Incorporation", o: 19, r: 1.5 },
  { n: "Payroll & PF/ESI", o: 71, r: 2.4 },
];

function BI() {
  return (
    <PortalShell portalId="admin">
      <PageHeader title="Business intelligence" subtitle="Last 30 days · drill into any metric" />
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi value="₹ 18.4L" label="MRR" tone="up" change="↑ 22% YoY" />
        <Kpi value="₹ 2.18 Cr" label="ARR" tone="up" />
        <Kpi value="284" label="Active orders" tone="up" />
        <Kpi value="₹ 6,420" label="ARPU" tone="up" change="↑ 4%" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Revenue trend (12 mo)">
          <div className="flex h-44 items-end gap-1.5">
            {[14, 13, 15, 14, 16, 17, 16, 18, 19, 20, 21, 22].map((h, i) => (
              <div key={i} className="flex-1 rounded-t bg-primary/85" style={{ height: `${h * 6}px` }} />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-ink-4">
            {["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"].map((m) => <span key={m}>{m}</span>)}
          </div>
        </Card>
        <Card title="Top services by revenue">
          <div className="space-y-2.5">
            {SERVICES.map((s) => (
              <div key={s.n}>
                <div className="flex justify-between text-[12px]">
                  <span className="text-ink-2">{s.n}</span>
                  <span className="font-mono text-ink-3">₹ {s.r.toFixed(1)}L · {s.o} orders</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${(s.r / 6.2) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PortalShell>
  );
}
