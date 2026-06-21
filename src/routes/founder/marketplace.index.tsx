import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PortalShell } from "@/components/PortalShell";
import { PageHeader, Pill, Btn } from "@/components/ui-kit";
import { Search, Sparkles, ArrowRight, Clock, CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import {
  MARKETPLACE_CATEGORIES,
  MARKETPLACE_SERVICES,
  tagPillTone,
} from "@/lib/marketplace/catalog";

export const Route = createFileRoute("/founder/marketplace/")({
  head: () => ({ meta: [{ title: "Service Marketplace — ComplyOS" }] }),
  component: Marketplace,
});

function Marketplace() {
  const navigate = useNavigate();
  const [active, setActive] = useState<(typeof MARKETPLACE_CATEGORIES)[number]>("All");
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    let items = MARKETPLACE_SERVICES;
    if (active !== "All") items = items.filter((s) => s.category === active);
    const q = query.trim().toLowerCase();
    if (q) {
      items = items.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.keywords.some((k) => k.includes(q))
      );
    }
    return items;
  }, [active, query]);

  return (
    <PortalShell portalId="founder">
      <PageHeader
        title="Service Marketplace"
        subtitle="Vetted CAs, CSs and lawyers — fixed prices, fixed timelines."
        actions={
          <Btn variant="o">
            <Sparkles className="h-4 w-4" /> Recommend for me
          </Btn>
        }
      />

      <div className="mb-4 flex items-center gap-2 rounded-xl border border-border bg-white px-3.5 py-2.5 shadow-card">
        <Search className="h-4 w-4 shrink-0 text-ink-4" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search 200+ services — try 'GST', 'incorporation', 'trademark'"
          className="w-full bg-transparent text-[13px] outline-none placeholder:text-ink-4"
        />
      </div>

      <div className="mb-5 flex flex-wrap gap-1.5">
        {MARKETPLACE_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setActive(c)}
            className={`rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-all ${
              active === c
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border bg-white text-ink-3 hover:border-primary-border/50 hover:bg-surface-2"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface-2/50 py-16 text-center">
          <p className="text-[14px] font-medium text-ink-3">No services match your search.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setActive("All");
            }}
            className="mt-2 text-[13px] font-bold text-primary hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => (
            <article
              key={s.id}
              role="button"
              tabIndex={0}
              onClick={() =>
                navigate({
                  to: "/founder/marketplace/order/$serviceId",
                  params: { serviceId: s.id },
                })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate({
                    to: "/founder/marketplace/order/$serviceId",
                    params: { serviceId: s.id },
                  });
                }
              }}
              className="group flex cursor-pointer flex-col rounded-xl border border-border bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary-border/60 hover:shadow-card-md"
            >
              <div className="flex items-center justify-between gap-2">
                <Pill tone="n">{s.category}</Pill>
                {s.tag && <Pill tone={tagPillTone(s.tag)}>{s.tag.label}</Pill>}
              </div>

              <h2 className="mt-3 text-[16px] font-bold leading-snug tracking-[-0.02em] text-ink group-hover:text-primary">
                {s.name}
              </h2>

              <p className="mt-2 line-clamp-2 flex-1 text-[12px] leading-relaxed text-ink-3">
                {s.description}
              </p>

              <div className="mt-3 flex items-center gap-1.5 text-[12px] text-ink-4">
                <Clock className="h-3.5 w-3.5" />
                Turnaround · {s.tat}
              </div>

              <ul className="mt-2 space-y-1">
                {s.includes.slice(0, 2).map((item) => (
                  <li key={item} className="flex gap-1.5 text-[11px] text-ink-4">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-success/80" />
                    <span className="line-clamp-1">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <div className="text-[17px] font-extrabold tracking-[-0.02em] text-ink">
                  {s.priceDisplay}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate({
                      to: "/founder/marketplace/order/$serviceId",
                      params: { serviceId: s.id },
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/25 bg-primary-muted/30 px-3.5 py-2 text-[13px] font-bold text-primary transition-colors hover:bg-primary-muted/50"
                >
                  Order
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </PortalShell>
  );
}
