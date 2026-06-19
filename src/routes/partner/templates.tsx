import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/PortalShell";
import { Card, PageHeader, Pill, Btn } from "@/components/ui-kit";
import { BookOpen, Download } from "lucide-react";

export const Route = createFileRoute("/partner/templates")({
  head: () => ({ meta: [{ title: "Template Library — ComplyOS" }] }),
  component: Templates,
});

const T = [
  { n: "Engagement Letter — Annual Compliance", cat: "Engagement", uses: 142 },
  { n: "Form ADT-1 — Auditor Appointment", cat: "MCA", uses: 88 },
  { n: "Notice of Board Meeting", cat: "Secretarial", uses: 76 },
  { n: "Founders' Agreement (5-shareholder)", cat: "Legal", uses: 41 },
  { n: "ESOP Grant Letter — vesting 4y/1c", cat: "Legal", uses: 33 },
  { n: "Reply to GST SCN — Sec 73", cat: "GST", uses: 28 },
  { n: "Tax Audit Report u/s 44AB checklist", cat: "Audit", uses: 64 },
];

function Templates() {
  return (
    <PortalShell portalId="partner">
      <PageHeader title="Template library" subtitle="Reusable letters, returns, drafts and checklists." />
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {T.map((t) => (
          <Card key={t.n}>
            <div className="flex items-center justify-between">
              <Pill tone="n">{t.cat}</Pill>
              <span className="text-[10px] text-ink-4">{t.uses} uses</span>
            </div>
            <div className="mt-3 flex items-start gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <div className="text-[13.5px] font-medium leading-snug text-ink">{t.n}</div>
            </div>
            <div className="mt-3 flex justify-end gap-1">
              <Btn variant="g">Preview</Btn>
              <Btn variant="o"><Download className="h-3.5 w-3.5" /> Use</Btn>
            </div>
          </Card>
        ))}
      </div>
    </PortalShell>
  );
}
