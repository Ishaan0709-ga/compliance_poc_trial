import { COMPLIANCES, getCompliancesForEntity } from "./master-data";
import type { ApplicableCompliance, CompanyProfile } from "./types";

/**
 * Applicability engine — master sheet + entity domain matrix only.
 * Private Limited → all 62 rows across GOV, TAX, HR, LEG, SEC.
 */
export function runRuleEngine(profile: CompanyProfile): ApplicableCompliance[] {
  const now = new Date().toISOString();
  const applicableIds = new Set(
    getCompliancesForEntity(profile.entityType).map((c) => c.id)
  );

  return COMPLIANCES.map((c) => ({
    companyId: profile.companyId,
    complianceId: c.id,
    applicable: applicableIds.has(c.id),
    generatedAt: now,
  }));
}

export function getApplicableComplianceIds(applicable: ApplicableCompliance[]): string[] {
  return applicable.filter((a) => a.applicable).map((a) => a.complianceId);
}
