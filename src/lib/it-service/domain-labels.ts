import type { DomainId } from "./types";

/** Short domain badge labels for calendar cards */
export const DOMAIN_BADGE: Record<DomainId, string> = {
  GOV: "GOV",
  TAX: "TAX",
  HR: "HR",
  LEG: "LEG",
  SEC: "INFOSEC",
  DPP: "DPP",
  FIN: "FIN",
  VEN: "VEN",
};

export function domainBadge(domainId: DomainId): string {
  return DOMAIN_BADGE[domainId] ?? domainId;
}
