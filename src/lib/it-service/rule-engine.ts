import { COMPLIANCES, RULES } from "./master-data";
import { IT_SECTOR_INDUSTRIES } from "./profile-options";
import type { ApplicableCompliance, CompanyProfile } from "./types";
function evalRule(
  profile: CompanyProfile,
  field: string,
  operator: string,
  value: string | number | boolean
): boolean {
  let actual: unknown;
  if (field === "countries_served") {
    actual = profile.countriesServed;
  } else if (field === "gstRegistered") {
    actual = profile.gstRegistered;
  } else if (field === "womenEmployees") {
    actual = profile.womenEmployees;
  } else if (field === "employeeCount") {
    actual = profile.employeeCount;
  } else if (field === "handlesPersonalData") {
    actual = profile.handlesPersonalData;
  } else if (field === "entityType") {
    actual = profile.entityType;
  } else if (field === "industry") {
    actual = profile.industry;
  } else {
    actual = (profile as Record<string, unknown>)[field];
  }

  switch (operator) {
    case "=":
      return actual === value;
    case ">":
      return typeof actual === "number" && actual > (value as number);
    case ">=":
      return typeof actual === "number" && actual >= (value as number);
    case "includes":
      return Array.isArray(actual) && actual.some((c) =>
        c.toUpperCase().includes(String(value).toUpperCase())
      );
    case "it_sector":
      return typeof actual === "string" && IT_SECTOR_INDUSTRIES.has(actual);
    default:
      return false;
  }
}

/** Rule engine: company profile → applicable compliances */
export function runRuleEngine(profile: CompanyProfile): ApplicableCompliance[] {
  const now = new Date().toISOString();
  const isPvtLtd = profile.entityType === "private_limited";

  return COMPLIANCES.map((c) => {
    const rules = RULES.filter((r) => r.complianceId === c.id);
    if (rules.length === 0) {
      return {
        companyId: profile.companyId,
        complianceId: c.id,
        applicable: true,
        generatedAt: now,
      };
    }

    const baselineRules = rules.filter((r) => !r.privateLimitedPath);
    const pvtRules = rules.filter((r) => r.privateLimitedPath);

    const baselinePass =
      baselineRules.length > 0 &&
      baselineRules.every((r) => evalRule(profile, r.field, r.operator, r.value));

    const pvtPass =
      isPvtLtd &&
      pvtRules.length > 0 &&
      pvtRules.every((r) => evalRule(profile, r.field, r.operator, r.value));

    let applicable: boolean;
    if (pvtRules.length > 0 && baselineRules.length > 0) {
      applicable = pvtPass || baselinePass;
    } else if (pvtRules.length > 0) {
      applicable = pvtPass;
    } else {
      applicable = baselinePass;
    }

    return {
      companyId: profile.companyId,
      complianceId: c.id,
      applicable,
      generatedAt: now,
    };
  });
}

export function getApplicableComplianceIds(applicable: ApplicableCompliance[]): string[] {
  return applicable.filter((a) => a.applicable).map((a) => a.complianceId);
}
