import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/PortalShell";
import { Card, PageHeader, Pill, Btn } from "@/components/ui-kit";
import { Bell, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/partner/feed")({
  head: () => ({ meta: [{ title: "Regulatory Feed — ComplyOS" }] }),
  component: Feed,
});

const FEED = [
  { src: "CBIC", t: "Notification 12/2026 — GSTR-1 due date extended for taxpayers in TN/KL", time: "3h ago", impact: "23 clients affected" },
  { src: "MCA", t: "Form CSR-2 to be filed separately for FY 25-26 by 31 May 2026", time: "1d ago", impact: "8 clients > ₹5cr turnover" },
  { src: "CBDT", t: "Circular 4/2026: clarification on Sec 194R applicability for SaaS credits", time: "2d ago", impact: "All SaaS clients" },
  { src: "EPFO", t: "Wage ceiling under EPF revised to ₹21,000 effective 1 Jul 2026", time: "4d ago", impact: "All payroll clients" },
  { src: "RBI", t: "FEMA — Online filing of FC-GPR within 30 days mandated", time: "5d ago", impact: "3 clients with FDI" },
];

function Feed() {
  return (
    <PortalShell portalId="partner">
      <PageHeader title="Regulatory feed" subtitle="Curated updates from CBIC · MCA · CBDT · RBI · EPFO" />
      <div className="space-y-2">
        {FEED.map((f) => (
          <Card key={f.t}>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary-muted/60">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Pill tone="infra">{f.src}</Pill>
                  <span className="text-[10px] text-ink-4">{f.time}</span>
                </div>
                <div className="mt-1.5 text-[13px] text-ink">{f.t}</div>
                <div className="mt-1 text-[11px] text-ink-4">Client impact · {f.impact}</div>
              </div>
              <Btn variant="o"><ExternalLink className="h-3.5 w-3.5" /> Read</Btn>
            </div>
          </Card>
        ))}
      </div>
    </PortalShell>
  );
}
