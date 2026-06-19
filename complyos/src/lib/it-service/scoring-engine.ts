import { DOMAINS, getCompliance } from "./master-data";
import { scoreCompliance } from "./compliance-utils";
import type {
  CalendarItem,
  ComplianceScore,
  DomainScore,
  EvidenceRecord,
} from "./types";

/** Scoring engine: one score per applicable compliance → domain → organization */
export function computeScores(
  companyId: string,
  calendar: CalendarItem[],
  evidence: EvidenceRecord[],
  applicableIds: string[]
): { scores: ComplianceScore[]; domainScores: DomainScore[]; overall: number } {
  const now = new Date().toISOString();

  const scores: ComplianceScore[] = applicableIds.map((complianceId) => {
    const { score, status } = scoreCompliance(complianceId, calendar, evidence);
    return {
      companyId,
      complianceId,
      score,
      status,
      computedAt: now,
    };
  });

  const domainScores: DomainScore[] = DOMAINS.map((d) => {
    const domainComplianceIds = applicableIds.filter((id) => {
      const comp = getCompliance(id);
      return comp?.domainId === d.id;
    });

    if (domainComplianceIds.length === 0) {
      return { domainId: d.id, score: 0, complianceCount: 0 };
    }

    let weightedSum = 0;
    let weightTotal = 0;
    for (const id of domainComplianceIds) {
      const comp = getCompliance(id)!;
      const { score } = scoreCompliance(id, calendar, evidence);
      weightedSum += score * comp.weight;
      weightTotal += comp.weight;
    }

    return {
      domainId: d.id,
      score: weightTotal > 0 ? Math.round(weightedSum / weightTotal) : 0,
      complianceCount: domainComplianceIds.length,
    };
  }).filter((d) => d.complianceCount > 0);

  let orgWeighted = 0;
  let orgWeight = 0;
  for (const id of applicableIds) {
    const comp = getCompliance(id)!;
    const { score } = scoreCompliance(id, calendar, evidence);
    orgWeighted += score * comp.weight;
    orgWeight += comp.weight;
  }
  const overall = orgWeight > 0 ? Math.round(orgWeighted / orgWeight) : 0;

  return { scores, domainScores, overall };
}

export function getComplianceScoreMap(
  scores: ComplianceScore[]
): Record<string, ComplianceScore> {
  return Object.fromEntries(scores.map((s) => [s.complianceId, s]));
}

export function scoreTone(score: number): "g" | "a" | "r" {
  if (score >= 85) return "g";
  if (score >= 70) return "a";
  return "r";
}
