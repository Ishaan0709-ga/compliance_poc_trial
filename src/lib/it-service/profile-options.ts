import type { EntityType } from "./types";

/** Entity types — from Excel / company master */
export const ENTITY_TYPE_OPTIONS: { value: EntityType; label: string }[] = [
  { value: "sole_proprietorship", label: "Sole Proprietorship" },
  { value: "partnership_firm", label: "Partnership Firm" },
  { value: "llp", label: "Limited Liability Partnership (LLP)" },
  { value: "opc", label: "One Person Company (OPC)" },
  { value: "private_limited", label: "Private Limited Company (Pvt Ltd)" },
  { value: "public_limited", label: "Public Limited Company" },
  { value: "section_8", label: "Section 8 Company" },
];

/** Industry types — from Excel industry master */
export const INDUSTRY_OPTIONS: { value: string; label: string }[] = [
  { value: "Information Technology", label: "Information Technology" },
  { value: "Manufacturing", label: "Manufacturing" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Financial Services", label: "Financial Services" },
  { value: "Retail & E-commerce", label: "Retail & E-commerce" },
  { value: "Education", label: "Education" },
  { value: "Professional Services", label: "Professional Services" },
  { value: "Human Resources", label: "Human Resources" },
  { value: "Real Estate", label: "Real Estate" },
  { value: "Logistics & Supply Chain", label: "Logistics & Supply Chain" },
  { value: "Hospitality", label: "Hospitality" },
  { value: "Media & Entertainment", label: "Media & Entertainment" },
  { value: "Telecommunications", label: "Telecommunications" },
  { value: "Agriculture", label: "Agriculture" },
  { value: "Food & Beverage", label: "Food & Beverage" },
  { value: "Energy & Utilities", label: "Energy & Utilities" },
  { value: "Engineering Services", label: "Engineering Services" },
  { value: "Automotive", label: "Automotive" },
  { value: "Aerospace & Defense", label: "Aerospace & Defense" },
  { value: "Mining & Metals", label: "Mining & Metals" },
  { value: "Consumer Goods", label: "Consumer Goods" },
  { value: "Biotechnology", label: "Biotechnology" },
  { value: "Environmental Services", label: "Environmental Services" },
  { value: "Security Services", label: "Security Services" },
  { value: "Research & Development", label: "Research & Development" },
  { value: "Non-Profit", label: "Non-Profit" },
  { value: "Import & Export", label: "Import & Export" },
  { value: "Infrastructure", label: "Infrastructure" },
  { value: "Media Technology", label: "Media Technology" },
  { value: "Healthcare Technology", label: "Healthcare Technology" },
];

export const DEFAULT_COUNTRY = "India";

/** Industries that trigger IT-sector security controls in the rule engine */
export const IT_SECTOR_INDUSTRIES = new Set([
  "Information Technology",
  "Media Technology",
  "Healthcare Technology",
  "Telecommunications",
  "IT Service", // legacy profile value
]);

export function getEntityTypeLabel(value: EntityType | string): string {
  return ENTITY_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? String(value).replace(/_/g, " ");
}

export function getIndustryLabel(value: string): string {
  return INDUSTRY_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

/** Map legacy stored entity slugs to current master values */
export function normalizeEntityType(raw: string): EntityType {
  const map: Record<string, EntityType> = {
    proprietorship: "sole_proprietorship",
    partnership: "partnership_firm",
  };
  const normalized = map[raw] ?? raw;
  if (ENTITY_TYPE_OPTIONS.some((o) => o.value === normalized)) {
    return normalized as EntityType;
  }
  return "private_limited";
}
