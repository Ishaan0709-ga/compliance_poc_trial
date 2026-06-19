import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/PortalShell";
import { Card, PageHeader, Pill, Btn } from "@/components/ui-kit";
import { Sparkles, Send } from "lucide-react";

export const Route = createFileRoute("/founder/ai/compliance")({
  head: () => ({ meta: [{ title: "AI Compliance Co-Pilot — ComplyOS" }] }),
  component: AICompliance,
});

const SUGGESTIONS = [
  "Reconcile GSTR-2B for April",
  "Draft GSTR-3B from Tally",
  "Check ITC eligibility for Vendor Solutions LLP",
  "Am I liable for TDS on Notion subscription?",
];

const THREAD = [
  { who: "ai", t: "I noticed that 4 invoices from Vendor Solutions LLP (₹48,200 of ITC) didn't reconcile against GSTR-2B in March. Cause: vendor filed GSTR-1 on 13 Apr, after your 3B cutoff. Suggested action: claim the ITC in April's 3B." },
  { who: "you", t: "Apply that as a journal entry and prepare the corrected return." },
  { who: "ai", t: "Done. Draft GSTR-3B for April now reflects ₹48,200 additional ITC under Table 4(A)(5). Net liability reduced to ₹1,12,840. Sending to CA Neha Iyer for review." },
];

function AICompliance() {
  return (
    <PortalShell portalId="founder">
      <PageHeader
        title="Compliance Co-Pilot"
        subtitle="Connected to: Tally · GST portal · MCA · Bank statements"
        actions={<Pill tone="infra"><Sparkles className="h-3 w-3" /> agent online</Pill>}
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <Card>
          <div className="space-y-3">
            {THREAD.map((m, i) => (
              <div key={i} className={`flex ${m.who === "you" ? "justify-end" : ""}`}>
                <div className={`max-w-[75%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                  m.who === "you"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-surface-2 text-ink-2"
                }`}>
                  {m.t}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <input placeholder="Ask anything about your compliance…" className="flex-1 bg-transparent text-[13px] outline-none" />
            <Btn><Send className="h-3.5 w-3.5" /></Btn>
          </div>
        </Card>
        <Card title="Try asking">
          <div className="space-y-2">
            {SUGGESTIONS.map((s) => (
              <div key={s} className="cursor-pointer rounded-lg border border-border bg-surface-2 p-2.5 text-[12.5px] text-ink-2 hover:bg-surface-3">
                {s}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PortalShell>
  );
}
