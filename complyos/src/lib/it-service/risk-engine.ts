import { getCompliance } from "./master-data";
import {
  findFocalCalendarItem,
  hasApprovedEvidence,
  ymd,
} from "./compliance-utils";
import type { CalendarItem, EvidenceRecord, RiskAlert } from "./types";

/** Risk engine — one alert per compliance where possible */
export function computeRisks(
  companyId: string,
  calendar: CalendarItem[],
  evidence: EvidenceRecord[],
  from: Date = new Date()
): RiskAlert[] {
  const today = ymd(from);
  const risks: RiskAlert[] = [];
  const complianceIds = [...new Set(calendar.map((c) => c.complianceId))];

  for (const complianceId of complianceIds) {
    const comp = getCompliance(complianceId);
    if (!comp) continue;

    const focal = findFocalCalendarItem(calendar, complianceId);
    const hasEvidence = hasApprovedEvidence(complianceId, evidence);

    if (focal && (focal.status === "overdue" || focal.dueDate < today) && !hasEvidence) {
      risks.push({
        id: `risk-overdue-${complianceId}`,
        companyId,
        complianceId,
        title: `${comp.name} overdue`,
        description: `${comp.name} was due on ${focal.dueDate}. Immediate action required.`,
        level: comp.riskLevel === "Critical" ? "HIGH" : comp.riskLevel === "High" ? "HIGH" : "MEDIUM",
        createdAt: from.toISOString(),
      });
      continue;
    }

    if (!hasEvidence && focal && focal.dueDate <= ymd(new Date(from.getTime() + 14 * 86400000))) {
      risks.push({
        id: `risk-evidence-${complianceId}`,
        companyId,
        complianceId,
        title: `Evidence missing — ${comp.name}`,
        description: `No approved evidence on file for ${comp.name} (${focal.period}).`,
        level: comp.riskLevel === "Critical" ? "HIGH" : "MEDIUM",
        createdAt: from.toISOString(),
      });
      continue;
    }

    if (focal && focal.status === "pending" && comp.riskLevel === "Critical") {
      const daysUntil = Math.ceil(
        (new Date(focal.dueDate).getTime() - from.getTime()) / 86400000
      );
      if (daysUntil <= 7 && daysUntil >= 0) {
        risks.push({
          id: `risk-due-${complianceId}`,
          companyId,
          complianceId,
          title: `${comp.name} due in ${daysUntil} day${daysUntil === 1 ? "" : "s"}`,
          description: `Critical compliance ${comp.name} due on ${focal.dueDate}.`,
          level: "MEDIUM",
          createdAt: from.toISOString(),
        });
      }
    }
  }

  return risks
    .sort((a, b) => {
      const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      return order[a.level] - order[b.level];
    })
    .slice(0, 12);
}
