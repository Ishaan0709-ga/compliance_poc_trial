import type {
  ActivityRecord,
  ComplianceScore,
  EvidenceRecord,
  ITServiceState,
} from "./types";
import { getCompliance } from "./master-data";

export function buildRecentActivity(
  evidence: EvidenceRecord[],
  scores: ComplianceScore[],
  previousScores: ComplianceScore[] = []
): ActivityRecord[] {
  const items: ActivityRecord[] = [];

  for (const ev of [...evidence].sort(
    (a, b) => b.uploadedAt.localeCompare(a.uploadedAt)
  )) {
    const comp = getCompliance(ev.complianceId);
    items.push({
      id: `act-ev-${ev.id}`,
      type: "evidence_uploaded",
      title: comp?.name ?? ev.complianceId,
      description:
        ev.source === "attestation"
          ? "Marked complete (self-attested)"
          : `Evidence uploaded: ${ev.filename}`,
      at: ev.uploadedAt,
    });
  }

  const prevMap = Object.fromEntries(
    previousScores.map((s) => [s.complianceId, s.score])
  );
  for (const s of scores) {
    if (s.status === "completed" && s.score > 0) {
      const comp = getCompliance(s.complianceId);
      items.push({
        id: `act-done-${s.complianceId}-${s.computedAt}`,
        type: "compliance_completed",
        title: comp?.name ?? s.complianceId,
        description: `Compliance completed · Score ${s.score}%`,
        at: s.computedAt,
      });
    } else if (prevMap[s.complianceId] !== undefined && prevMap[s.complianceId] !== s.score) {
      const comp = getCompliance(s.complianceId);
      items.push({
        id: `act-score-${s.complianceId}-${s.computedAt}`,
        type: "score_updated",
        title: comp?.name ?? s.complianceId,
        description: `Score updated to ${s.score}%`,
        at: s.computedAt,
      });
    }
  }

  return items
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 12);
}

export function mergeActivity(
  existing: ActivityRecord[],
  fresh: ActivityRecord[]
): ActivityRecord[] {
  const seen = new Set<string>();
  const merged = [...fresh, ...existing].filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });
  return merged.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 20);
}

export function pickPreviousScores(state: ITServiceState | null): ComplianceScore[] {
  return state?.scores ?? [];
}
