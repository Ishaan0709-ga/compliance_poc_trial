import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/PortalShell";
import { Card, PageHeader, Pill, Btn } from "@/components/ui-kit";
import { Rocket } from "lucide-react";

export const Route = createFileRoute("/founder/ai/growth")({
  head: () => ({ meta: [{ title: "AI Growth Advisor — ComplyOS" }] }),
  component: AIGrowth,
});

const SCHEMES = [
  { name: "Startup India Seed Fund", amt: "₹ 20L grant", elig: "Eligible — DPIIT recognised", tone: "done" as const },
  { name: "SIDBI Fund of Funds", amt: "Equity via VC", elig: "Eligible after Series A", tone: "n" as const },
  { name: "SISFS — Karnataka K-Tech", amt: "₹ 50L grant", elig: "Karnataka entity ✓", tone: "done" as const },
  { name: "PLI — Electronics Hardware", amt: "4–6% incentive", elig: "Not applicable", tone: "miss" as const },
  { name: "MSME Champions Scheme", amt: "Subsidy on R&D", elig: "Need MSME Udyam ID", tone: "pend" as const },
];

function AIGrowth() {
  return (
    <PortalShell portalId="founder">
      <PageHeader
        title="Growth Advisor"
        subtitle="Government schemes, grants, and tax incentives — matched to you."
        actions={<Btn><Rocket className="h-4 w-4" /> Apply with one click</Btn>}
      />
      <Card title="Matching schemes">
        <div className="divide-y divide-border">
          {SCHEMES.map((s) => (
            <div key={s.name} className="flex items-center justify-between gap-3 py-3">
              <div>
                <div className="text-[13px] font-medium text-ink">{s.name}</div>
                <div className="text-[11px] text-ink-4">{s.amt}</div>
              </div>
              <div className="flex items-center gap-3">
                <Pill tone={s.tone}>{s.elig}</Pill>
                <Btn variant="o">Details</Btn>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </PortalShell>
  );
}
