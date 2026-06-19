import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/PortalShell";
import { Card, PageHeader, Pill, Btn, Kpi } from "@/components/ui-kit";

export const Route = createFileRoute("/admin/partners")({
  head: () => ({ meta: [{ title: "Partners — ComplyOS" }] }),
  component: Partners,
});

const ROWS = [
  { name: "CA Neha Iyer", region: "Bengaluru", load: 12, cap: 15, score: 4.9, tier: "Gold", tone: "done" as const },
  { name: "CS Rohit Bansal", region: "Delhi", load: 8, cap: 10, score: 4.7, tier: "Gold", tone: "done" as const },
  { name: "Adv. Meera Subramanian", region: "Chennai", load: 4, cap: 8, score: 4.6, tier: "Silver", tone: "done" as const },
  { name: "CA Vikram Joshi", region: "Mumbai", load: 14, cap: 14, score: 4.4, tier: "Gold", tone: "pend" as const },
  { name: "CS Anita Rao", region: "Hyderabad", load: 6, cap: 12, score: 4.5, tier: "Silver", tone: "done" as const },
];

function Partners() {
  return (
    <PortalShell portalId="admin">
      <PageHeader title="Partner Network" subtitle="64 partners · 5.2 avg load · 4.7★ avg rating" />
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi value="64" label="Active partners" />
        <Kpi value="3" label="Onboarding" />
        <Kpi value="91%" label="Utilisation" tone="up" />
        <Kpi value="4.7★" label="Avg rating" />
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="text-left text-[10px] uppercase tracking-[0.1em] text-ink-4">
              <tr className="border-b border-border">
                <th className="pb-2">Partner</th>
                <th className="pb-2">Region</th>
                <th className="pb-2">Tier</th>
                <th className="pb-2">Load</th>
                <th className="pb-2">Score</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((p) => (
                <tr key={p.name} className="border-b border-border last:border-0">
                  <td className="py-3 font-medium text-ink">{p.name}</td>
                  <td className="text-ink-3">{p.region}</td>
                  <td><Pill tone={p.tier === "Gold" ? "infra" : "n"}>{p.tier}</Pill></td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 rounded-full bg-surface-2">
                        <div className={`h-full rounded-full ${p.tone === "pend" ? "bg-warning" : "bg-success"}`} style={{ width: `${(p.load / p.cap) * 100}%` }} />
                      </div>
                      <span className="font-mono text-[11px] text-ink-3">{p.load}/{p.cap}</span>
                    </div>
                  </td>
                  <td className="font-mono text-[12px]">★ {p.score}</td>
                  <td className="text-right"><Btn variant="o">Profile</Btn></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PortalShell>
  );
}
