import { createFileRoute } from "@tanstack/react-router";
import { useITService } from "@/lib/it-service/context";
import { ITServiceShell } from "@/components/it-service/ITServiceShell";
import { RequireOnboarding } from "@/components/it-service/RequireOnboarding";
import { PageHeader, Card, Pill } from "@/components/ui-kit";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/it-service/insights")({
  component: InsightsPage,
});

function InsightsPage() {
  return (
    <RequireOnboarding>
      <InsightsContent />
    </RequireOnboarding>
  );
}

function InsightsContent() {
  const { state } = useITService();

  return (
    <ITServiceShell>
      <PageHeader
        title="AI insights"
        subtitle="Recommendations derived from your calendar, evidence gaps, scores and risk alerts."
      />

      <div className="grid gap-3">
        {state.insights.length === 0 ? (
          <Card>
            <p className="text-[13px] text-ink-3">No insights at this time. Complete onboarding and upload evidence to generate insights.</p>
          </Card>
        ) : (
          state.insights.map((ins) => (
            <Card key={ins.id}>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-muted text-purple">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold">{ins.title}</span>
                    <Pill tone={ins.priority === "high" ? "miss" : ins.priority === "medium" ? "pend" : "n"}>
                      {ins.priority.toUpperCase()}
                    </Pill>
                    <Pill tone="infra">{ins.category}</Pill>
                  </div>
                  <p className="mt-1 text-[13px] text-ink-3">{ins.description}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </ITServiceShell>
  );
}
