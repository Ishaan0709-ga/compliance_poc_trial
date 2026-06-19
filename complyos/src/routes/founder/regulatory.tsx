import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PortalShell } from "@/components/PortalShell";
import { Card, PageHeader, Pill, Btn } from "@/components/ui-kit";
import { Bell, ExternalLink, RefreshCw, Sparkles, Filter } from "lucide-react";
import { fetchComplianceUpdates, type ComplianceUpdate } from "@/lib/compliance.functions";

export const Route = createFileRoute("/founder/regulatory")({
  head: () => ({
    meta: [
      { title: "Regulatory Updates — ComplyOS" },
      { name: "description", content: "Live compliance changes for GST, Income Tax, MCA, startup schemes and more." },
    ],
  }),
  component: RegulatoryUpdates,
});

const CATEGORIES = ["All", "GST", "Income Tax", "Startup Schemes", "MCA / ROC", "Labour", "RBI / FEMA"] as const;
type Category = typeof CATEGORIES[number];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function RegulatoryUpdates() {
  const [updates, setUpdates] = useState<ComplianceUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<string>("");
  const [filter, setFilter] = useState<Category>("All");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchComplianceUpdates();
      setUpdates(res.updates);
      setLive(res.live);
      setGeneratedAt(res.generatedAt);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === "All" ? updates : updates.filter((u) => u.category === filter);

  return (
    <PortalShell portalId="founder">
      <PageHeader
        title="Regulatory Updates"
        subtitle="AI scrapers monitoring CBIC · CBDT · MCA · DPIIT · EPFO · RBI for changes that affect your business."
        actions={
          <>
            <Pill tone={live ? "infra" : "pend"}>
              <Sparkles className="h-3 w-3" /> {live ? "live AI feed" : "cached feed"}
            </Pill>
            <Btn onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Btn>
          </>
        }
      />

      <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="h-3.5 w-3.5 text-ink-4 flex-shrink-0" />
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`flex-shrink-0 rounded-full border px-3 py-1 text-[11.5px] font-medium transition-colors ${
              filter === c
                ? "border-primary-border bg-primary-muted text-primary"
                : "border-border bg-surface-2 text-ink-3 hover:bg-surface-3"
            }`}
          >
            {c}
          </button>
        ))}
        {generatedAt && (
          <span className="ml-auto flex-shrink-0 text-[10.5px] text-ink-4">
            updated {timeAgo(generatedAt)}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {loading && updates.length === 0 ? (
          <Card>
            <div className="py-8 text-center text-[13px] text-ink-4">
              <RefreshCw className="mx-auto mb-2 h-5 w-5 animate-spin" />
              Scanning regulators…
            </div>
          </Card>
        ) : filtered.length === 0 ? (
          <Card>
            <div className="py-8 text-center text-[13px] text-ink-4">No updates in this category.</div>
          </Card>
        ) : (
          filtered.map((f) => (
            <Card key={f.id}>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary-muted/60">
                  <Bell className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone="infra">{f.source}</Pill>
                    <Pill tone="pend">{f.category}</Pill>
                    <span className="text-[10px] text-ink-4">{timeAgo(f.publishedAt)}</span>
                  </div>
                  <div className="mt-1.5 text-[13px] font-medium text-ink">{f.title}</div>
                  <div className="mt-1 text-[12px] text-ink-3">{f.summary}</div>
                  <div className="mt-1.5 text-[11px] text-ink-4">Impact · {f.impact}</div>
                </div>
                {f.url && (
                  <a href={f.url} target="_blank" rel="noreferrer" className="flex-shrink-0">
                    <Btn variant="o"><ExternalLink className="h-3.5 w-3.5" /> Source</Btn>
                  </a>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </PortalShell>
  );
}
