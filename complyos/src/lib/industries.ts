import type { LucideIcon } from "lucide-react";
import {
  HeartPulse,
  Landmark,
  ShieldCheck,
  Factory,
  Building2,
  Server,
} from "lucide-react";

export type IndustryId =
  | "healthcare"
  | "fintech"
  | "it"
  | "msme"
  | "govt"
  | "it-service";

export interface Industry {
  id: IndustryId;
  name: string;
  tagline: string;
  description: string;
  route: string;
  icon: LucideIcon;
  accent: string; // tailwind class for accent text
  ringFrom: string; // gradient
  regulators: string[];
  agents: number;
  score: number;
}

export const INDUSTRIES: Industry[] = [
  {
    id: "healthcare",
    name: "Healthcare",
    tagline: "Patient data, clinical trials, hospital ops",
    description:
      "HIPAA, NDHM/ABDM, NABH, Drug & Cosmetics Act, MD Rules, biomedical waste — orchestrated by clinical compliance agents.",
    route: "/healthcare",
    icon: HeartPulse,
    accent: "text-[oklch(0.6_0.18_25)]",
    ringFrom: "from-rose-500/20 to-pink-500/10",
    regulators: ["HIPAA", "NDHM", "NABH", "CDSCO"],
    agents: 6,
    score: 87,
  },
  {
    id: "fintech",
    name: "Fintech",
    tagline: "Payments, lending, KYC, capital markets",
    description:
      "RBI, SEBI, PMLA, DPDP — agents monitor KYC, AML, capital adequacy, customer grievance SLAs in real time.",
    route: "/fintech",
    icon: Landmark,
    accent: "text-primary",
    ringFrom: "from-primary/25 to-purple/15",
    regulators: ["RBI", "SEBI", "PMLA", "DPDP"],
    agents: 8,
    score: 92,
  },
  {
    id: "it",
    name: "IT & SaaS",
    tagline: "Certifications, audits, data governance",
    description:
      "ISO 27001, SOC 2, PCI-DSS, GDPR, DPDP — continuous control monitoring with evidence collection agents.",
    route: "/it",
    icon: ShieldCheck,
    accent: "text-[oklch(0.55_0.22_295)]",
    ringFrom: "from-purple/25 to-primary/10",
    regulators: ["ISO 27001", "SOC 2", "PCI-DSS", "GDPR"],
    agents: 7,
    score: 89,
  },
  {
    id: "msme",
    name: "MSMEs",
    tagline: "Udyam, GST, labour, factory licenses",
    description:
      "End-to-end compliance for small businesses — Udyam updates, GST returns, Shops & Establishment, FSSAI, Pollution NOC.",
    route: "/msme",
    icon: Factory,
    accent: "text-[oklch(0.65_0.16_60)]",
    ringFrom: "from-amber-500/20 to-orange-500/10",
    regulators: ["Udyam", "GST", "FSSAI", "Labour"],
    agents: 5,
    score: 78,
  },
  {
    id: "govt",
    name: "Government",
    tagline: "Auto-reporting, auto-approval portal",
    description:
      "Automate the mundane: GST/TDS reconciliation, license renewals, ESI/PF returns, DBT subsidy disbursement with human-in-loop exceptions.",
    route: "/govt",
    icon: Building2,
    accent: "text-[oklch(0.55_0.16_200)]",
    ringFrom: "from-cyan-500/20 to-sky-500/10",
    regulators: ["GSTN", "MCA", "EPFO", "DBT"],
    agents: 9,
    score: 94,
  },
  {
    id: "it-service",
    name: "IT Service",
    tagline: "ISO 27001, SOC 2, DPDP, GST & governance",
    description:
      "Profile-driven compliance for IT services — corporate governance, taxation, HR, security, privacy and vendor risk with live scoring.",
    route: "/it-service/login",
    icon: Server,
    accent: "text-primary",
    ringFrom: "from-primary/25 to-purple/15",
    regulators: ["ISO 27001", "SOC 2", "DPDP", "GST", "MCA"],
    agents: 8,
    score: 0,
  },
];

export const getIndustry = (id: IndustryId) =>
  INDUSTRIES.find((i) => i.id === id)!;
