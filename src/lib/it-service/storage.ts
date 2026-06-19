import { applyEvidenceValidation } from "./validation-engine";
import { generateCalendar } from "./calendar-engine";
import { runRuleEngine, getApplicableComplianceIds } from "./rule-engine";
import { computeScores } from "./scoring-engine";
import { computeRisks } from "./risk-engine";
import { generateInsights } from "./ai-insights";
import { generateNotifications } from "./notification-service";
import {
  buildRecentActivity,
  mergeActivity,
  pickPreviousScores,
} from "./activity";
import {
  DEFAULT_COUNTRY,
  normalizeEntityType,
} from "./profile-options";import {
  findFocalCalendarItem,
  hasApprovedEvidence,
  ymd,
} from "./compliance-utils";
import { getITServiceStorageKey } from "./auth";
import type {
  CompanyProfile,
  ComplianceScore,
  DashboardKpis,
  EvidenceRecord,
  ITServiceState,
} from "./types";

const LEGACY_STORAGE_KEY = "complyos-it-service";

function storageKey() {
  return getITServiceStorageKey();
}

function countCompliancesMissingEvidence(
  applicableIds: string[],
  evidence: EvidenceRecord[]
): number {
  return applicableIds.filter((id) => !hasApprovedEvidence(id, evidence)).length;
}

function countCompliancesByStatus(
  applicableIds: string[],
  scores: { complianceId: string; status: string }[]
): { overdue: number; pending: number; completed: number } {
  const scoreMap = Object.fromEntries(scores.map((s) => [s.complianceId, s]));
  let overdue = 0;
  let pending = 0;
  let completed = 0;
  for (const id of applicableIds) {
    const s = scoreMap[id];
    if (!s) {
      pending++;
      continue;
    }
    if (s.status === "overdue") overdue++;
    else if (s.status === "completed") completed++;
    else pending++;
  }
  return { overdue, pending, completed };
}

function emptyKpis(): DashboardKpis {
  return {
    overallScore: 0,
    openActions: 0,
    upcomingDue: 0,
    criticalRisks: 0,
    overdueCount: 0,
    evidenceMissing: 0,
    dueThisWeek: 0,
  };
}

export function createCompanyId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `COMP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  }
  return `COMP-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

export function normalizeProfile(profile: CompanyProfile): CompanyProfile {
  return {
    ...profile,
    entityType: normalizeEntityType(profile.entityType),
    countriesServed: [DEFAULT_COUNTRY],
    industry:
      profile.industry === "IT Service"
        ? "Information Technology"
        : profile.industry,
  };
}

export function recomputeState(
  profile: CompanyProfile,
  evidence: EvidenceRecord[] = [],
  previousScores: ComplianceScore[] = []
): ITServiceState {
  const normalized = normalizeProfile(profile);
  const applicable = runRuleEngine(normalized);
  const applicableIds = getApplicableComplianceIds(applicable);
  let calendar = generateCalendar(normalized, applicableIds);
  calendar = applyEvidenceValidation(calendar, evidence);
  const { scores, domainScores, overall } = computeScores(
    normalized.companyId,
    calendar,
    evidence,
    applicableIds
  );
  const risks = computeRisks(normalized.companyId, calendar, evidence);
  const insights = generateInsights(
    normalized.companyId,
    calendar,
    evidence,
    domainScores,
    risks
  );
  const notifications = generateNotifications(normalized, calendar);
  const recentActivity = buildRecentActivity(evidence, scores, previousScores);

  const today = new Date();
  const todayStr = ymd(today);
  const weekEnd = new Date(today.getTime() + 7 * 86400000);
  const weekStr = ymd(weekEnd);

  const openActions = calendar.filter(
    (c) => c.status === "pending" || c.status === "overdue" || c.status === "in_progress"
  ).length;
  const upcomingDue = calendar.filter(
    (c) => c.dueDate >= todayStr && c.status !== "completed"
  ).length;
  const criticalRisks = risks.filter((r) => r.level === "HIGH").length;
  const { overdue: overdueCompliances } = countCompliancesByStatus(applicableIds, scores);
  const evidenceMissing = countCompliancesMissingEvidence(applicableIds, evidence);
  const dueThisWeek = calendar.filter(
    (c) => c.dueDate >= todayStr && c.dueDate <= weekStr && c.status !== "completed"
  ).length;

  return {
    profile: normalized,
    applicable,
    calendar,
    evidence,
    scores,
    risks,
    insights,
    domainScores,
    notifications,
    recentActivity,
    kpis: {
      overallScore: overall,
      openActions,
      upcomingDue,
      criticalRisks,
      overdueCount: overdueCompliances,
      evidenceMissing,
      dueThisWeek,
    },
  };
}

export function loadState(): ITServiceState | null {
  if (typeof window === "undefined") return null;
  try {
    const key = storageKey();
    let raw = localStorage.getItem(key);
    // Migrate legacy guest blob once into user-scoped key
    if (!raw && key !== LEGACY_STORAGE_KEY) {
      raw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (raw) {
        localStorage.setItem(key, raw);
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      }
    }
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ITServiceState;
    if (!parsed.profile) return null;
    const previousScores = parsed.scores ?? [];
    const state = recomputeState(parsed.profile, parsed.evidence || [], previousScores);
    return {
      ...state,
      recentActivity: mergeActivity(parsed.recentActivity ?? [], state.recentActivity),
    };
  } catch {
    return null;
  }
}

export function saveState(state: ITServiceState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(), JSON.stringify(state));
  window.dispatchEvent(new CustomEvent("it-service-update"));
}

export function clearState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKey());
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("it-service-update"));
}

export function saveProfile(profile: CompanyProfile): ITServiceState {
  const existing = loadState();
  const evidence = existing?.evidence || [];
  const previousScores = pickPreviousScores(existing);
  const state = recomputeState(profile, evidence, previousScores);
  const merged = {
    ...state,
    recentActivity: mergeActivity(existing?.recentActivity ?? [], state.recentActivity),
  };
  saveState(merged);
  return merged;
}

export function addEvidence(
  record: Omit<EvidenceRecord, "id" | "uploadedAt" | "validationStatus"> & {
    validationStatus?: EvidenceRecord["validationStatus"];
    source?: EvidenceRecord["source"];
  }
): ITServiceState | null {
  const current = loadState();
  if (!current?.profile) return null;

  const focal = findFocalCalendarItem(current.calendar, record.complianceId);
  const targetCalendarId = record.calendarItemId ?? focal?.id;

  const withoutDuplicate = current.evidence.filter(
    (e) =>
      !(
        e.complianceId === record.complianceId &&
        (e.calendarItemId === targetCalendarId ||
          (!e.calendarItemId && !targetCalendarId))
      )
  );

  const evidence: EvidenceRecord = {
    ...record,
    calendarItemId: targetCalendarId,
    id: `EV-${typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10)}`,
    uploadedAt: new Date().toISOString(),
    validationStatus: record.validationStatus || "approved",
    source: record.source ?? "upload",
  };
  const state = recomputeState(current.profile, [...withoutDuplicate, evidence], current.scores);
  const merged = {
    ...state,
    recentActivity: mergeActivity(current.recentActivity ?? [], state.recentActivity),
  };
  saveState(merged);
  return merged;
}

/** Mark compliance complete without uploading a file (self-attestation). */
export function markEvidenceComplete(record: {
  companyId: string;
  complianceId: string;
  calendarItemId?: string;
}): ITServiceState | null {
  const current = loadState();
  if (!current?.profile) return null;

  const focal = findFocalCalendarItem(current.calendar, record.complianceId);
  const withoutFocal = current.evidence.filter(
    (e) =>
      !(
        e.complianceId === record.complianceId &&
        (e.calendarItemId === (record.calendarItemId ?? focal?.id) ||
          (!e.calendarItemId && !record.calendarItemId))
      )
  );

  const evidence: EvidenceRecord = {
    companyId: record.companyId,
    complianceId: record.complianceId,
    calendarItemId: record.calendarItemId ?? focal?.id,
    id: `EV-${typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10)}`,
    filename: "Already completed (self-attested)",
    mimeType: "application/x-attestation",
    sizeBytes: 0,
    uploadedAt: new Date().toISOString(),
    validationStatus: "approved",
    source: "attestation",
  };

  const state = recomputeState(current.profile, [...withoutFocal, evidence], current.scores);
  const merged = {
    ...state,
    recentActivity: mergeActivity(current.recentActivity ?? [], state.recentActivity),
  };
  saveState(merged);
  return merged;
}

export function getDefaultState(): ITServiceState {
  return {
    profile: null,
    applicable: [],
    calendar: [],
    evidence: [],
    scores: [],
    risks: [],
    insights: [],
    domainScores: [],
    notifications: [],
    recentActivity: [],
    kpis: emptyKpis(),
  };
}
