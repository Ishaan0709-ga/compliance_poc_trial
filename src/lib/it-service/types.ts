export type DomainId = "GOV" | "TAX" | "HR" | "LEG" | "SEC" | "DPP" | "FIN" | "VEN";

export type EntityType =
  | "sole_proprietorship"
  | "partnership_firm"
  | "llp"
  | "opc"
  | "private_limited"
  | "public_limited"
  | "section_8";

export type Frequency =
  | "Monthly"
  | "Quarterly"
  | "Half-Yearly"
  | "Annual"
  | "Event Based";

export type RiskLevel = "Critical" | "High" | "Medium" | "Low";

export type CalendarStatus = "completed" | "pending" | "overdue" | "in_progress";

export type EvidenceStatus = "approved" | "pending" | "rejected" | "missing";

export interface DomainMaster {
  id: DomainId;
  name: string;
  route: string;
}

export interface ComplianceMaster {
  id: string;
  domainId: DomainId;
  subDomainId: string;
  name: string;
  applicableLaw?: string;
  frequency: Frequency;
  riskLevel: RiskLevel;
  weight: number;
  owner: string;
  dueLogic: string;
  description: string;
  evidenceTypes: string[];
}

export type RuleOperator = "=" | ">" | ">=" | "includes" | "it_sector";

export interface RuleMaster {
  id: string;
  complianceId: string;
  field: keyof CompanyProfile | "countries_served";
  operator: RuleOperator;
  value: string | number | boolean;
  /** When set, these rules apply only for Private Limited entities (alternate path). */
  privateLimitedPath?: boolean;
}

export interface CompanyProfile {
  companyId: string;
  companyName: string;
  entityType: EntityType;
  industry: string;
  revenueBand: string;
  employeeCount: number;
  womenEmployees: number;
  gstRegistered: boolean;
  countriesServed: string[];
  handlesPersonalData: boolean;
  financialYearStart: number;
  primaryContact: string;
  onboardingComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicableCompliance {
  companyId: string;
  complianceId: string;
  applicable: boolean;
  generatedAt: string;
}

export interface CalendarItem {
  id: string;
  companyId: string;
  complianceId: string;
  dueDate: string;
  period: string;
  status: CalendarStatus;
  owner: string;
  riskLevel: RiskLevel;
}

export interface EvidenceRecord {
  id: string;
  companyId: string;
  complianceId: string;
  calendarItemId?: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  validationStatus: EvidenceStatus;
  /** upload = file attached; attestation = marked complete without file */
  source?: "upload" | "attestation";
}

export interface ComplianceScore {
  companyId: string;
  complianceId: string;
  score: number;
  status: CalendarStatus;
  computedAt: string;
}

export interface DomainScore {
  domainId: DomainId;
  score: number;
  complianceCount: number;
}

export interface RiskAlert {
  id: string;
  companyId: string;
  complianceId: string;
  title: string;
  description: string;
  level: "HIGH" | "MEDIUM" | "LOW";
  createdAt: string;
}

export interface AIInsight {
  id: string;
  companyId: string;
  title: string;
  description: string;
  category: "due" | "overdue" | "evidence" | "score" | "risk";
  priority: "high" | "medium" | "low";
  createdAt: string;
}

export interface DashboardKpis {
  overallScore: number;
  openActions: number;
  upcomingDue: number;
  criticalRisks: number;
  overdueCount: number;
  evidenceMissing: number;
  dueThisWeek: number;
}

export type NotificationType =
  | "reminder_7d"
  | "reminder_3d"
  | "due_today"
  | "overdue";

export type NotificationStatus = "pending" | "sent" | "skipped";

export interface NotificationRecord {
  notificationId: string;
  complianceId: string;
  dueDate: string;
  recipient: string;
  notificationType: NotificationType;
  message: string;
  sentAt: string | null;
  status: NotificationStatus;
  channel: "whatsapp";
}

export interface ActivityRecord {
  id: string;
  type: "evidence_uploaded" | "compliance_completed" | "score_updated";
  title: string;
  description: string;
  at: string;
}

export interface ITServiceState {
  profile: CompanyProfile | null;
  applicable: ApplicableCompliance[];
  calendar: CalendarItem[];
  evidence: EvidenceRecord[];
  scores: ComplianceScore[];
  risks: RiskAlert[];
  insights: AIInsight[];
  kpis: DashboardKpis;
  domainScores: DomainScore[];
  notifications: NotificationRecord[];
  recentActivity: ActivityRecord[];
}
