import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/PortalShell";
import { Card, Pill, Btn, PageHeader } from "@/components/ui-kit";
import { Search, Sparkles, ArrowRight } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/founder/marketplace")({
  head: () => ({ meta: [{ title: "Service Marketplace — ComplyOS" }] }),
  component: Marketplace,
});

const CATS = ["All", "GST & Tax", "ROC / MCA", "Labour & Payroll", "IP & Legal", "Funding"];

const SERVICES = [
  { cat: "GST & Tax", name: "GSTR-1 & GSTR-3B Filing", price: "₹ 1,499/mo", tat: "5 days", tag: "Popular" },
  { cat: "GST & Tax", name: "GST Annual Return (GSTR-9)", price: "₹ 4,999", tat: "10 days" },
  { cat: "ROC / MCA", name: "Annual ROC Filing (AOC-4 + MGT-7)", price: "₹ 7,999", tat: "12 days", tag: "Due May" },
  { cat: "ROC / MCA", name: "DIR-3 KYC", price: "₹ 999", tat: "2 days" },
  { cat: "Labour & Payroll", name: "Monthly Payroll + PF/ESI/PT", price: "₹ 99/employee", tat: "Ongoing" },
  { cat: "IP & Legal", name: "Trademark Registration", price: "₹ 6,999", tat: "Filing in 3 days" },
  { cat: "IP & Legal", name: "Founders' Agreement Drafting", price: "₹ 9,999", tat: "5 days" },
  { cat: "Funding", name: "Startup India / DPIIT Recognition", price: "₹ 4,999", tat: "10 days", tag: "Grant unlock" },
  { cat: "Funding", name: "Pitch Deck & Cap Table Review", price: "₹ 14,999", tat: "7 days" },
];

function Marketplace() {
  const [active, setActive] = useState("All");
  const list = active === "All" ? SERVICES : SERVICES.filter((s) => s.cat === active);
  return (
    <PortalShell portalId="founder">
      <PageHeader
        title="Service Marketplace"
        subtitle="Vetted CAs, CSs and lawyers — fixed prices, fixed timelines."
        actions={<Btn variant="o"><Sparkles className="h-4 w-4" /> Recommend for me</Btn>}
      />
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 shadow-card">
        <Search className="h-4 w-4 text-ink-4" />
        <input
          placeholder="Search 200+ services — try ‘GST’, ‘incorporation’, ‘trademark’"
          className="w-full bg-transparent text-[13px] outline-none placeholder:text-ink-4"
        />
      </div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {CATS.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`rounded-full px-3 py-1 text-[12px] transition ${
              active === c
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-surface text-ink-3 hover:bg-surface-2"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => (
          <Card key={s.name}>
            <div className="flex items-center justify-between">
              <Pill tone="n">{s.cat}</Pill>
              {s.tag && <Pill tone={s.tag === "Due May" ? "miss" : "infra"}>{s.tag}</Pill>}
            </div>
            <div className="mt-3 text-[15px] font-semibold tracking-[-0.01em] text-ink">{s.name}</div>
            <div className="mt-1 text-[12px] text-ink-3">Turnaround · {s.tat}</div>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-[16px] font-semibold text-ink">{s.price}</div>
              <Btn variant="o">Order <ArrowRight className="h-3.5 w-3.5" /></Btn>
            </div>
          </Card>
        ))}
      </div>
    </PortalShell>
  );
}
