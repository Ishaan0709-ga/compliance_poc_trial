import { getCompliance } from "./master-data";
import {
  findFocalCalendarItem,
  hasApprovedEvidence,
  ymd,
} from "./compliance-utils";
import type {
  AIInsight,
  CalendarItem,
  DomainScore,
  EvidenceRecord,
  RiskAlert,
} from "./types";

/** AI insights derived from live compliance data */
export function generateInsights(
  companyId: string,
  calendar: CalendarItem[],
  evidence: EvidenceRecord[],
  domainScores: DomainScore[],
  risks: RiskAlert[],
  from: Date = new Date()
): AIInsight[] {
  const insights: AIInsight[] = [];
  const today = ymd(from);
  const complianceIds = [...new Set(calendar.map((c) => c.complianceId))];

  for (const complianceId of complianceIds) {
    const comp = getCompliance(complianceId);
    const focal = findFocalCalendarItem(calendar, complianceId);
    if (!comp || !focal || focal.status === "completed") continue;
    const days = Math.ceil(
      (new Date(focal.dueDate).getTime() - from.getTime()) / 86400000
    );
    if (days >= 0 && days <= 7) {
      insights.push({
        id: `insight-due-${complianceId}`,
        companyId,
        title: `${comp.name} due in ${days} day${days === 1 ? "" : "s"}`,
        description: `${comp.name} (${focal.period}) is due on ${focal.dueDate}. Owner: ${comp.owner}.`,
        category: "due",
        priority: comp.riskLevel === "Critical" ? "high" : "medium",
        createdAt: from.toISOString(),
      });
    }
  }

  for (const risk of risks.slice(0, 4)) {
    insights.push({
      id: `insight-risk-${risk.id}`,
      companyId,
      title: risk.title,
      description: risk.description,
      category: risk.title.includes("overdue") ? "overdue" : "risk",
      priority: risk.level === "HIGH" ? "high" : risk.level === "MEDIUM" ? "medium" : "low",
      createdAt: from.toISOString(),
    });
  }

  const missingIds = complianceIds.filter((id) => !hasApprovedEvidence(id, evidence));
  if (missingIds.length > 0) {
    insights.push({
      id: `insight-evidence-${companyId}`,
      companyId,
      title: `${missingIds.length} compliance${missingIds.length === 1 ? "" : "s"} missing evidence`,
      description: `Upload evidence for ${missingIds
        .slice(0, 3)
        .map((id) => getCompliance(id)?.name)
        .filter(Boolean)
        .join(", ")}${missingIds.length > 3 ? " and more" : ""}.`,
      category: "evidence",
      priority: "high",
      createdAt: from.toISOString(),
    });
  }

  const overdue = complianceIds.filter((id) => {
    const focal = findFocalCalendarItem(calendar, id);
    return focal && focal.dueDate < today && focal.status !== "completed";
  });
  if (overdue.length > 0) {
    insights.push({
      id: `insight-overdue-${companyId}`,
      companyId,
      title: `${overdue.length} overdue compliance${overdue.length === 1 ? "" : "s"}`,
      description: `Prioritize: ${overdue
        .slice(0, 3)
        .map((id) => getCompliance(id)?.name)
        .filter(Boolean)
        .join(", ")}.`,
      category: "overdue",
      priority: "high",
      createdAt: from.toISOString(),
    });
  }

  const sortedDomains = [...domainScores].sort((a, b) => a.score - b.score);
  if (sortedDomains.length >= 2) {
    const lowest = sortedDomains[0];
    const highest = sortedDomains[sortedDomains.length - 1];
    if (highest.score - lowest.score >= 15) {
      insights.push({
        id: `insight-score-gap-${companyId}`,
        companyId,
        title: `Score gap: ${highest.domainId} vs ${lowest.domainId}`,
        description: `${highest.domainId} at ${highest.score}% while ${lowest.domainId} at ${lowest.score}%. Focus remediation on weaker domain.`,
        category: "score",
        priority: "medium",
        createdAt: from.toISOString(),
      });
    }
  }

  return insights.slice(0, 10);
}
