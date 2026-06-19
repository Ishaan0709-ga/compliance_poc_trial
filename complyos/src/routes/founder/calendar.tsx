import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PortalShell } from "@/components/PortalShell";
import { Card, PageHeader, Pill, Btn } from "@/components/ui-kit";
import { EmptyState } from "@/components/EmptyState";
import { CalendarDays, RefreshCw } from "lucide-react";
import { listComplianceTasks, regenerateComplianceTasks, getCompanyProfile } from "@/lib/profile.functions";
import { dateShort } from "@/lib/format";

export const Route = createFileRoute("/founder/calendar")({
  head: () => ({ meta: [{ title: "Compliance Calendar — ComplyOS" }] }),
  component: Calendar,
});

function Calendar() {
  const qc = useQueryClient();
  const listFn = useServerFn(listComplianceTasks);
  const regenFn = useServerFn(regenerateComplianceTasks);
  const profFn = useServerFn(getCompanyProfile);
  const list = useQuery({ queryKey: ["compliance-tasks"], queryFn: () => listFn() });
  const prof = useQuery({ queryKey: ["company-profile"], queryFn: () => profFn() });
  const regen = useMutation({
    mutationFn: async () => regenFn(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["compliance-tasks"] }),
  });

  const tasks = list.data?.tasks || [];
  const today = new Date().toISOString().slice(0, 10);

  return (
    <PortalShell portalId="founder">
      <PageHeader
        title="Compliance calendar"
        subtitle="GST, TDS, PF, PT, ROC, ITR and advance tax — computed from your company profile."
        actions={
          <Btn onClick={() => regen.mutate()} disabled={!prof.data?.profile || regen.isPending}>
            <RefreshCw className={`h-4 w-4 ${regen.isPending ? "animate-spin" : ""}`} /> Regenerate
          </Btn>
        }
      />

      {!prof.data?.profile ? (
        <EmptyState
          icon={<CalendarDays className="h-5 w-5" />}
          title="Set up your company profile first"
          description="Entity type, GSTIN, headcount and registrations determine which filings apply to you."
          primary={{ label: "Open profile", href: "/founder/profile" }}
        />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-5 w-5" />}
          title="No tasks generated yet"
          description="Click Regenerate to build your filing calendar for the next 6 months."
          primary={{ label: "Regenerate now", onClick: () => regen.mutate() }}
        />
      ) : (
        <Card>
          <div className="divide-y divide-border">
            {tasks.map((t: any) => {
              const overdue = t.due_date < today && t.status !== "filed";
              return (
                <div key={t.id} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill tone="infra">{t.category}</Pill>
                      <Pill tone="n">{t.authority || "—"}</Pill>
                      <span className="text-[10.5px] text-ink-4">{t.period}</span>
                    </div>
                    <div className="mt-1 text-[13px] font-medium text-ink">{t.title}</div>
                    {t.description && <div className="text-[11.5px] text-ink-3">{t.description}</div>}
                    {t.penalty_info && <div className="mt-0.5 text-[10.5px] text-ink-4">Penalty · {t.penalty_info}</div>}
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-end gap-1">
                    <div className="text-[12px] font-semibold text-ink">{dateShort(t.due_date)}</div>
                    <Pill tone={overdue ? "miss" : t.status === "filed" ? "done" : "pend"}>
                      {overdue ? "overdue" : t.status}
                    </Pill>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </PortalShell>
  );
}
