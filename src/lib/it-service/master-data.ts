import { COMPLIANCE_SHEET } from "./compliance-sheet";
import type {
  ComplianceMaster,
  DomainId,
  DomainMaster,
  EntityType,
  RiskLevel,
} from "./types";

/** Entity → applicable domain ids (extend for OPC, LLP, etc.) */
export const ENTITY_DOMAIN_MATRIX: Partial<Record<EntityType, DomainId[]>> = {
  private_limited: ["GOV", "TAX", "HR", "LEG", "SEC"],
};

const DOMAIN_NAME_TO_ID: Record<string, DomainId> = {
  "Corporate Governance": "GOV",
  Taxation: "TAX",
  "Human Resource Compliance": "HR",
  "Legal Compliance": "LEG",
  "Information Security": "SEC",
};

const DOMAIN_ROUTES: Record<DomainId, string> = {
  GOV: "/it-service/governance",
  TAX: "/it-service/taxation",
  HR: "/it-service/hr",
  LEG: "/it-service/legal",
  SEC: "/it-service/security",
  DPP: "/it-service/privacy",
  FIN: "/it-service/financial",
  VEN: "/it-service/vendor",
};

const OWNER_BY_DOMAIN: Record<DomainId, string> = {
  GOV: "Compliance",
  TAX: "Finance",
  HR: "HR",
  LEG: "Legal",
  SEC: "Security",
  DPP: "Compliance",
  FIN: "Finance",
  VEN: "Compliance",
};

function riskFromWeightage(weightage: number): RiskLevel {
  if (weightage >= 100) return "Critical";
  if (weightage >= 75) return "High";
  return "Medium";
}

function buildAllCompliances(): ComplianceMaster[] {
  const counters: Partial<Record<DomainId, number>> = {};

  return COMPLIANCE_SHEET.map((row) => {
  const domainId = DOMAIN_NAME_TO_ID[row.domain];
  if (!domainId) {
    throw new Error(`Unknown domain in master sheet: ${row.domain}`);
  }

  counters[domainId] = (counters[domainId] ?? 0) + 1;
  const id = `${domainId}${String(counters[domainId]).padStart(3, "0")}`;

  return {
    id,
    index: row.index,
    domainId,
    domain: row.domain,
    description: row.description,
    complianceCategory: row.complianceCategory,
    name: row.compliance,
    frequency: row.frequency,
    weight: row.weightage,
    evidence: row.evidence,
    riskLevel: riskFromWeightage(row.weightage),
    owner: OWNER_BY_DOMAIN[domainId],
    dueLogic: row.dueLogic,
    entityTypes: row.entityTypes,
    evidenceTypes: [row.evidence],
  };
  });
}

/** Built from master sheet — do not edit manually */
export const COMPLIANCES: ComplianceMaster[] = buildAllCompliances();

/** Domains derived from sheet rows (order preserved) */
export const DOMAINS: DomainMaster[] = Array.from(
  new Map(
    COMPLIANCE_SHEET.map((row) => {
      const id = DOMAIN_NAME_TO_ID[row.domain];
      return [id, { id, name: row.domain, route: DOMAIN_ROUTES[id] }] as const;
    })
  ).values()
);

export function getDomainsForEntity(entityType: EntityType): DomainId[] {
  return ENTITY_DOMAIN_MATRIX[entityType] ?? [];
}

export function getCompliance(id: string) {
  return COMPLIANCES.find((c) => c.id === id);
}

export function getDomain(id: string) {
  return DOMAINS.find((d) => d.id === id);
}

export function getCompliancesByDomain(domainId: DomainId) {
  return COMPLIANCES.filter((c) => c.domainId === domainId);
}

export function getCompliancesForEntity(entityType: EntityType) {
  const domains = new Set(getDomainsForEntity(entityType));
  return COMPLIANCES.filter(
    (c) =>
      domains.has(c.domainId) &&
      (!c.entityTypes?.length || c.entityTypes.includes(entityType))
  );
}
