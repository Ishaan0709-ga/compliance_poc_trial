import type { DomainId } from "@/lib/it-service/types";
import { ITServiceShell } from "@/components/it-service/ITServiceShell";
import { PageHeader, Card, Pill, Kpi } from "@/components/ui-kit";
import { useITService } from "@/lib/it-service/context";
import { getCompliance, getDomain } from "@/lib/it-service/master-data";
import { getComplianceScoreMap, scoreTone } from "@/lib/it-service/scoring-engine";
import { hasApprovedEvidence, findFocalCalendarItem } from "@/lib/it-service/compliance-utils";
import {
  ComplianceEvidencePanel,
  getLatestEvidence,
} from "@/components/it-service/ComplianceEvidenceActions";
import { useState } from "react";

export function DomainPage({ domainId }: { domainId: DomainId }) {
  const { state } = useITService();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const domain = getDomain(domainId)!;
  const domainScore = state.domainScores.find((d) => d.domainId === domainId);
  const scoreMap = getComplianceScoreMap(state.scores);

  const applicableIds = state.applicable
    .filter((a) => a.applicable)
    .map((a) => a.complianceId);
  const domainCompliances = applicableIds
    .map((id) => getCompliance(id))
    .filter((c) => c?.domainId === domainId);

  let overdue = 0;
  let pending = 0;
  let completed = 0;
  for (const comp of domainCompliances) {
    if (!comp) continue;
    const entry = scoreMap[comp.id];
    if (entry?.status === "overdue") overdue++;
    else if (entry?.status === "completed" && entry.score > 0) completed++;
    else pending++;
  }

  return (
    <ITServiceShell>
      <PageHeader
        title={domain.name}
        subtitle={`${domainCompliances.length} applicable compliances · Score ${domainScore?.score ?? 0}%`}
      />

      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <Kpi value={`${domainScore?.score ?? 0}%`} label="Domain score" />
        <Kpi value={String(overdue)} label="Overdue" tone={overdue ? "dn" : "up"} />
        <Kpi value={String(pending)} label="Pending / missing" />
        <Kpi value={String(completed)} label="Compliant" tone="up" />
      </div>

      <Card title="Applicable compliances">
        <div className="divide-y divide-border">
          {domainCompliances.length === 0 ? (
            <p className="py-4 text-[13px] text-ink-3">
              No compliances apply based on your company profile.
            </p>
          ) : (
            domainCompliances.map((comp) => {
              if (!comp) return null;
              const entry = scoreMap[comp.id];
              const compScore = entry?.score ?? 0;
              const focal = findFocalCalendarItem(state.calendar, comp.id);
              const hasEvidence = hasApprovedEvidence(comp.id, state.evidence);
              const latestEvidence = getLatestEvidence(comp.id, state.evidence);
              const tone = scoreTone(compScore);
              const isExpanded = expandedId === comp.id;

              return (
                <div key={comp.id} className="py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold">{comp.name}</span>
                        <span
                          className={`font-mono text-[11px] font-bold ${
                            tone === "g"
                              ? "text-success"
                              : tone === "a"
                                ? "text-warning"
                                : "text-destructive"
                          }`}
                        >
                          {compScore}%
                        </span>
                      </div>
                      <div className="mt-0.5 text-[12px] text-ink-3">{comp.description}</div>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <Pill tone="n">{comp.frequency}</Pill>
                        <Pill tone={comp.riskLevel === "Critical" ? "miss" : "pend"}>
                          {comp.riskLevel}
                        </Pill>
                        <Pill tone="n">Weight {comp.weight}</Pill>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      {focal && (
                        <div className="text-[12px] text-ink-3">
                          {focal.status === "completed" ? "Last period" : "Due"} {focal.dueDate}
                        </div>
                      )}
                      <Pill tone={hasEvidence ? "done" : "miss"}>
                        {hasEvidence
                          ? latestEvidence?.source === "attestation"
                            ? "Marked complete"
                            : "Evidence on file"
                          : "Evidence missing"}
                      </Pill>
                      {hasEvidence && latestEvidence && (
                        <div
                          className="mt-0.5 max-w-[150px] truncate text-[10px] text-ink-4"
                          title={latestEvidence.filename}
                        >
                          {latestEvidence.source === "attestation"
                            ? "Self-attested"
                            : latestEvidence.filename}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : comp.id)}
                        className="mt-1 block w-full text-[11px] font-bold text-primary hover:underline"
                      >
                        {isExpanded ? "Close" : hasEvidence ? "Update →" : "Upload →"}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3">
                      <ComplianceEvidencePanel
                        complianceId={comp.id}
                        onClose={() => setExpandedId(null)}
                        onComplete={() => setExpandedId(null)}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Card>
    </ITServiceShell>
  );
}
