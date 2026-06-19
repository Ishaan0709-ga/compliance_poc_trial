import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ShoppingBag,
  ListChecks,
  FolderLock,
  CalendarClock,
  Receipt,
  Inbox,
  Users,
  Briefcase,
  BarChart3,
  Package,
  ClipboardList,
  FileSignature,
  Wallet,
  BookOpen,
  Bell,
  Sparkles,
  Rocket,
  BookOpenCheck,
  FileText,
  CreditCard,
  Landmark,
  PieChart,
  Plug,
  Radar,
  Users2,
} from "lucide-react";

export type PortalId = "founder" | "admin" | "partner";

export interface PortalNavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  badge?: string;
}
export interface PortalNavSection {
  title: string;
  items: PortalNavItem[];
}

export interface PortalConfig {
  id: PortalId;
  name: string;
  role: string;
  tagline: string;
  accent: string;
  home: string;
  user: { name: string; sub: string; initials: string };
  nav: PortalNavSection[];
}

export const PORTALS: Record<PortalId, PortalConfig> = {
  founder: {
    id: "founder",
    name: "Founder Portal",
    role: "Founder · Startup",
    tagline: "Your AI-powered startup co-pilot",
    accent: "text-primary",
    home: "/founder",
    user: { name: "Vanshika Sharma", sub: "Grae Intelligence Technologies Pvt. Ltd.", initials: "VS" },
    nav: [
      {
        title: "Workspace",
        items: [
          { label: "Dashboard", to: "/founder", icon: LayoutDashboard },
          { label: "Growth KPIs", to: "/founder/kpis", icon: BarChart3 },
          { label: "Service Marketplace", to: "/founder/marketplace", icon: ShoppingBag },
          { label: "My Orders", to: "/founder/orders", icon: ListChecks, badge: "3" },
          { label: "Document Vault", to: "/founder/vault", icon: FolderLock },
          { label: "Compliance Calendar", to: "/founder/calendar", icon: CalendarClock },
          { label: "Regulatory Updates", to: "/founder/regulatory", icon: Radar, badge: "live" },
        ],
      },
      {
        title: "Bookkeeping",
        items: [
          { label: "Books Overview", to: "/founder/books", icon: BookOpenCheck },
          { label: "Sales & Invoices", to: "/founder/books/invoices", icon: FileText },
          { label: "Expenses & Bills", to: "/founder/books/expenses", icon: CreditCard },
          { label: "Banking", to: "/founder/books/banking", icon: Landmark },
          { label: "Reports", to: "/founder/books/reports", icon: PieChart },
          { label: "Connectors", to: "/founder/books/connectors", icon: Plug, badge: "new" },
          { label: "Payroll", to: "/founder/payroll", icon: Users2 },
        ],
      },
      {
        title: "AI Co-Pilot",
        items: [
          { label: "Compliance Co-Pilot", to: "/founder/ai/compliance", icon: Sparkles },
          { label: "Financial Advisor", to: "/founder/ai/finance", icon: BarChart3 },
          { label: "Growth Advisor", to: "/founder/ai/growth", icon: Rocket },
        ],
      },
    ],
  },
  admin: {
    id: "admin",
    name: "Admin Console",
    role: "ComplyOS · Operations",
    tagline: "Operational command centre",
    accent: "text-purple",
    home: "/admin",
    user: { name: "Aarav Kapoor", sub: "Operations Lead", initials: "AK" },
    nav: [
      {
        title: "Operations",
        items: [
          { label: "Overview", to: "/admin", icon: LayoutDashboard },
          { label: "Order Intake", to: "/admin/intake", icon: Inbox, badge: "12" },
          { label: "All Orders", to: "/admin/orders", icon: ClipboardList },
          { label: "SLA Monitor", to: "/admin/sla", icon: Bell, badge: "4" },
        ],
      },
      {
        title: "Network",
        items: [
          { label: "Customers (CRM)", to: "/admin/customers", icon: Users },
          { label: "Partners", to: "/admin/partners", icon: Briefcase },
          { label: "Catalogue", to: "/admin/catalogue", icon: Package },
        ],
      },
      {
        title: "Insights",
        items: [{ label: "Business Intelligence", to: "/admin/bi", icon: BarChart3 }],
      },
    ],
  },
  partner: {
    id: "partner",
    name: "Partner Workspace",
    role: "CA · CS · Legal",
    tagline: "Structured workflow for every professional",
    accent: "text-success",
    home: "/partner",
    user: { name: "CA Neha Iyer", sub: "Membership No. 412998", initials: "NI" },
    nav: [
      {
        title: "Work",
        items: [
          { label: "My Dashboard", to: "/partner", icon: LayoutDashboard },
          { label: "Assignments", to: "/partner/assignments", icon: ClipboardList, badge: "5" },
          { label: "Deliverables", to: "/partner/deliverables", icon: FileSignature },
          { label: "Client Chat", to: "/partner/chat", icon: Inbox },
        ],
      },
      {
        title: "Knowledge & Money",
        items: [
          { label: "Regulatory Feed", to: "/partner/feed", icon: Bell },
          { label: "Template Library", to: "/partner/templates", icon: BookOpen },
          { label: "Earnings & Payouts", to: "/partner/earnings", icon: Wallet },
        ],
      },
    ],
  },
};
