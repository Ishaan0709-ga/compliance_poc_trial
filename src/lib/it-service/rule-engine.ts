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

function passesEntityGate(
  profile: CompanyProfile,
  entityTypes?: CompanyProfile["entityType"][]
): boolean {
  if (!entityTypes?.length) return true;
  return entityTypes.includes(profile.entityType);
}

/** Rule engine: company profile → applicable compliances (Excel Table 4 + entityTypes) */
export function runRuleEngine(profile: CompanyProfile): ApplicableCompliance[] {
  const now = new Date().toISOString();

  return COMPLIANCES.map((c) => {
    if (!passesEntityGate(profile, c.entityTypes)) {
      return {
        companyId: profile.companyId,
        complianceId: c.id,
        applicable: false,
        generatedAt: now,
      };
    }

    const rules = RULES.filter((r) => r.complianceId === c.id);
    if (rules.length === 0) {
      return {
        companyId: profile.companyId,
        complianceId: c.id,
        applicable: true,
        generatedAt: now,
      };
    }

    const applicable = rules.every((r) =>
      evalRule(profile, r.field, r.operator, r.value)
    );

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
