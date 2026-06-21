export type ServiceCategory =
  | "GST & Tax"
  | "ROC / MCA"
  | "Labour & Payroll"
  | "IP & Legal"
  | "Funding";

export type ServiceTag = {
  label: string;
  tone: "popular" | "due" | "grant";
};

export type MarketplaceService = {
  id: string;
  category: ServiceCategory;
  name: string;
  description: string;
  priceAmount: number;
  priceDisplay: string;
  billingType: "monthly" | "one_time" | "per_employee";
  tat: string;
  tatDays: number | null;
  tag?: ServiceTag;
  includes: string[];
  documentsNeeded: string[];
  partners: string[];
  keywords: string[];
};

export const MARKETPLACE_CATEGORIES: ("All" | ServiceCategory)[] = [
  "All",
  "GST & Tax",
  "ROC / MCA",
  "Labour & Payroll",
  "IP & Legal",
  "Funding",
];

export const MARKETPLACE_SERVICES: MarketplaceService[] = [
  {
    id: "gstr-1-3b",
    category: "GST & Tax",
    name: "GSTR-1 & GSTR-3B Filing",
    description:
      "Monthly outward supply return (GSTR-1) and summary return (GSTR-3B) filed by a vetted CA with reconciliation against your books.",
    priceAmount: 1499,
    priceDisplay: "₹ 1,499/mo",
    billingType: "monthly",
    tat: "5 days",
    tatDays: 5,
    tag: { label: "Popular", tone: "popular" },
    includes: [
      "GSTR-1 & GSTR-3B preparation and filing",
      "Reconciliation with sales register",
      "Filing confirmation & ARN",
      "One revision if dept. raises query",
    ],
    documentsNeeded: ["Sales register / invoice export", "Purchase register", "Bank statement (month)"],
    partners: ["CA Neha Iyer", "CA Arjun Mehta"],
    keywords: ["gst", "gstr", "gstr-1", "gstr-3b", "tax", "filing", "monthly"],
  },
  {
    id: "gstr-9",
    category: "GST & Tax",
    name: "GST Annual Return (GSTR-9)",
    description: "Annual consolidated GST return with reconciliation of all monthly returns for the financial year.",
    priceAmount: 4999,
    priceDisplay: "₹ 4,999",
    billingType: "one_time",
    tat: "10 days",
    tatDays: 10,
    includes: ["GSTR-9 preparation", "Reconciliation with GSTR-1/3B", "Filing & acknowledgment"],
    documentsNeeded: ["All monthly GSTR summaries", "Annual trial balance", "ITC reconciliation sheet"],
    partners: ["CA Neha Iyer", "CA Priya Nair"],
    keywords: ["gst", "gstr-9", "annual", "tax"],
  },
  {
    id: "roc-annual",
    category: "ROC / MCA",
    name: "Annual ROC Filing (AOC-4 + MGT-7)",
    description: "Mandatory annual filing of financial statements and annual return with the Registrar of Companies.",
    priceAmount: 7999,
    priceDisplay: "₹ 7,999",
    billingType: "one_time",
    tat: "12 days",
    tatDays: 12,
    tag: { label: "Due May", tone: "due" },
    includes: ["AOC-4 (financials)", "MGT-7 (annual return)", "Board resolution drafting", "MCA filing & SRN"],
    documentsNeeded: ["Audited financials", "Board report", "Shareholder details", "Director DIN list"],
    partners: ["CS Rohit Bansal", "CS Ananya Krishnan"],
    keywords: ["roc", "mca", "aoc-4", "mgt-7", "annual", "compliance"],
  },
  {
    id: "dir-3-kyc",
    category: "ROC / MCA",
    name: "DIR-3 KYC",
    description: "Annual KYC verification for directors with MCA — mandatory for all active DIN holders.",
    priceAmount: 999,
    priceDisplay: "₹ 999",
    billingType: "one_time",
    tat: "2 days",
    tatDays: 2,
    includes: ["DIR-3 KYC form filing", "Per director", "Acknowledgment"],
    documentsNeeded: ["Director PAN & Aadhaar", "Personal email & mobile", "Digital signature (if available)"],
    partners: ["CS Rohit Bansal", "CS Ananya Krishnan"],
    keywords: ["dir-3", "kyc", "director", "mca", "din"],
  },
  {
    id: "payroll-pf-esi",
    category: "Labour & Payroll",
    name: "Monthly Payroll + PF/ESI/PT",
    description: "End-to-end payroll processing with statutory compliance — PF, ESI, and professional tax filings.",
    priceAmount: 99,
    priceDisplay: "₹ 99/employee",
    billingType: "per_employee",
    tat: "Ongoing",
    tatDays: 3,
    includes: ["Salary processing", "PF & ESI challans", "PT filing (state-specific)", "Payslips for all employees"],
    documentsNeeded: ["Employee master", "Attendance sheet", "Salary revisions / joining-exits"],
    partners: ["CA Neha Iyer", "HR Partners India"],
    keywords: ["payroll", "pf", "esi", "pt", "labour", "salary"],
  },
  {
    id: "trademark",
    category: "IP & Legal",
    name: "Trademark Registration",
    description: "Trademark search, application filing, and tracking through IPO examination.",
    priceAmount: 6999,
    priceDisplay: "₹ 6,999",
    billingType: "one_time",
    tat: "Filing in 3 days",
    tatDays: 3,
    includes: ["TM search report", "Application drafting & filing", "IPO tracking", "Reply to basic objections (1 round)"],
    documentsNeeded: ["Logo / wordmark", "Applicant entity docs", "Power of attorney", "Class selection"],
    partners: ["Adv. Meera S.", "Adv. Karan Joshi"],
    keywords: ["trademark", "ip", "brand", "logo", "ipo"],
  },
  {
    id: "founders-agreement",
    category: "IP & Legal",
    name: "Founders' Agreement Drafting",
    description: "Custom founders' agreement covering equity split, vesting, IP assignment, and exit clauses.",
    priceAmount: 9999,
    priceDisplay: "₹ 9,999",
    billingType: "one_time",
    tat: "5 days",
    tatDays: 5,
    includes: ["Discovery call", "Custom draft", "Two revision rounds", "Execution-ready final copy"],
    documentsNeeded: ["Cap table summary", "Founder details", "Existing SHA (if any)"],
    partners: ["Adv. Meera S.", "Adv. Karan Joshi"],
    keywords: ["founders", "agreement", "legal", "equity", "vesting"],
  },
  {
    id: "dpiit",
    category: "Funding",
    name: "Startup India / DPIIT Recognition",
    description: "DPIIT recognition application for tax benefits, self-certification, and fast-track patent support.",
    priceAmount: 4999,
    priceDisplay: "₹ 4,999",
    billingType: "one_time",
    tat: "10 days",
    tatDays: 10,
    tag: { label: "Grant unlock", tone: "grant" },
    includes: ["Eligibility review", "DPIIT application", "Certificate retrieval", "Benefits guide"],
    documentsNeeded: ["Incorporation certificate", "Brief about innovation", "Director details", "Pitch deck (optional)"],
    partners: ["CS Rohit Bansal", "Startup Desk ComplyOS"],
    keywords: ["dpiit", "startup india", "recognition", "funding", "grant"],
  },
  {
    id: "pitch-cap-table",
    category: "Funding",
    name: "Pitch Deck & Cap Table Review",
    description: "Investor-ready review of your pitch deck and cap table by experienced startup advisors.",
    priceAmount: 14999,
    priceDisplay: "₹ 14,999",
    billingType: "one_time",
    tat: "7 days",
    tatDays: 7,
    includes: ["Deck review (structure + narrative)", "Cap table sanity check", "Written feedback report", "30-min debrief call"],
    documentsNeeded: ["Latest pitch deck", "Cap table (fully diluted)", "Term sheet (if any)"],
    partners: ["Startup Desk ComplyOS", "CA Arjun Mehta"],
    keywords: ["pitch", "cap table", "fundraising", "investor", "deck"],
  },
];

export function getServiceById(id: string): MarketplaceService | undefined {
  return MARKETPLACE_SERVICES.find((s) => s.id === id);
}

export function tagPillTone(tag: ServiceTag): "infra" | "miss" | "done" {
  if (tag.tone === "due") return "miss";
  if (tag.tone === "grant") return "infra";
  return "infra";
}
