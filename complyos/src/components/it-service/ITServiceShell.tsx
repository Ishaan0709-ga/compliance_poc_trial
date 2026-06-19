import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, Search, Bell, Sparkles, LogOut } from "lucide-react";
import { getIndustry } from "@/lib/industries";
import { DOMAINS } from "@/lib/it-service/master-data";
import { useITService } from "@/lib/it-service/context";
import {
  displayPhoneFromUser,
  formatPhoneDisplay,
  signOutITService,
  userInitials,
} from "@/lib/it-service/auth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";import {
  LayoutDashboard,
  Building2,
  Receipt,
  Users,
  Scale,
  Lock,
  ScrollText,
  Wallet,
  Truck,
  Calendar,
  FolderOpen,
  Sparkles as SparklesIcon,
  FileBarChart,
  Settings,
} from "lucide-react";

const DOMAIN_ICONS: Record<string, ReactNode> = {
  GOV: <Building2 className="h-3.5 w-3.5" />,
  TAX: <Receipt className="h-3.5 w-3.5" />,
  HR: <Users className="h-3.5 w-3.5" />,
  LEG: <Scale className="h-3.5 w-3.5" />,
  SEC: <Lock className="h-3.5 w-3.5" />,
  DPP: <ScrollText className="h-3.5 w-3.5" />,
  FIN: <Wallet className="h-3.5 w-3.5" />,
  VEN: <Truck className="h-3.5 w-3.5" />,
};

const DOMAIN_ROUTES: Record<string, string> = {
  GOV: "/it-service/governance",
  TAX: "/it-service/taxation",
  HR: "/it-service/hr",
  LEG: "/it-service/legal",
  SEC: "/it-service/security",
  DPP: "/it-service/privacy",
  FIN: "/it-service/financial",
  VEN: "/it-service/vendor",
};

function scoreTone(score: number): "g" | "a" | "r" {
  if (score >= 85) return "g";
  if (score >= 70) return "a";
  return "r";
}

export function ITServiceShell({ children }: { children: ReactNode }) {
  const industry = getIndustry("it-service");
  const Icon = industry.icon;
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useITService();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOutITService();
    navigate({ to: "/it-service/login", replace: true });
  };

  const displayName =
    (user && displayPhoneFromUser(user)) ||
    formatPhoneDisplay(user?.phone) ||
    user?.email ||
    state.profile?.primaryContact ||
    "Account";
  const initials = user ? userInitials(user) : state.profile?.companyName?.slice(0, 2).toUpperCase() || "IT";

  const domainScoreMap = Object.fromEntries(
    state.domainScores.map((d) => [d.domainId, d.score])
  );

  const overviewItems = [
    {
      label: "Dashboard",
      to: "/it-service/dashboard",
      icon: <LayoutDashboard className="h-3.5 w-3.5" />,
    },
    ...DOMAINS.map((d) => ({
      label: d.name,
      to: DOMAIN_ROUTES[d.id],
      icon: DOMAIN_ICONS[d.id],
      badge: domainScoreMap[d.id]
        ? {
            text: `${domainScoreMap[d.id]}%`,
            tone: scoreTone(domainScoreMap[d.id]) as "g" | "a" | "r",
          }
        : undefined,
    })),
    {
      label: "Calendar",
      to: "/it-service/calendar",
      icon: <Calendar className="h-3.5 w-3.5" />,
      badge: state.kpis.upcomingDue
        ? { text: String(state.kpis.upcomingDue), tone: "a" as const }
        : undefined,
    },
    {
      label: "Evidence Repository",
      to: "/it-service/evidence",
      icon: <FolderOpen className="h-3.5 w-3.5" />,
    },
    {
      label: "AI Insights",
      to: "/it-service/insights",
      icon: <SparklesIcon className="h-3.5 w-3.5" />,
      badge: state.insights.length
        ? { text: String(state.insights.length), tone: "n" as const }
        : undefined,
    },
    {
      label: "Reports",
      to: "/it-service/reports",
      icon: <FileBarChart className="h-3.5 w-3.5" />,
    },
    {
      label: "Settings",
      to: "/it-service/settings",
      icon: <Settings className="h-3.5 w-3.5" />,
    },
  ];

  const sidebarSections = [
    { title: "Compliance", items: overviewItems },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 flex h-[60px] items-center justify-between border-b border-border bg-surface px-6 shadow-card">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-primary text-primary-foreground">
              <ShieldCheck className="h-4 w-4" strokeWidth={2.4} />
            </div>
            <span className="text-[16px] font-extrabold tracking-[-0.03em] text-ink">
              Comply<span className="text-primary">OS</span>
            </span>
          </Link>
          <div className="mx-2 h-6 w-px bg-border" />
          <div className="flex items-center gap-2 rounded-full border border-primary-border bg-primary-muted px-3 py-1 text-xs font-bold text-primary">
            <Icon className="h-3.5 w-3.5" />
            {industry.name}
          </div>
          <div className="hidden items-center gap-1.5 rounded-full border border-purple-border bg-purple-muted px-3 py-1 text-xs font-bold text-purple md:flex">
            <Sparkles className="h-3 w-3" />
            {industry.agents} agents online
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-[9px] border border-border bg-surface-2 px-3 py-1.5 md:flex">
            <Search className="h-3.5 w-3.5 text-ink-4" />
            <input
              placeholder="Search IT service compliance…"
              className="w-[220px] bg-transparent text-[13px] outline-none placeholder:text-ink-4"
            />
          </div>
          <button className="relative flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-border bg-surface-2 hover:bg-surface-3">
            <Bell className="h-4 w-4 text-ink-3" />
            {state.kpis.criticalRisks > 0 && (
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full border border-surface bg-destructive" />
            )}
          </button>
          <button
            onClick={handleSignOut}
            className="hidden h-[34px] items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 text-[12px] font-medium text-ink-3 hover:bg-surface-3 sm:flex"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
          <div
            className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-gradient-brand text-xs font-extrabold text-primary-foreground"
            title={displayName}
          >
            {initials}
          </div>
        </div>
      </header>

      <div className="grid flex-1 md:grid-cols-[228px_1fr]">
        <aside className="sticky top-[60px] hidden h-[calc(100vh-60px)] flex-col overflow-y-auto border-r border-border bg-surface md:flex">
          <div className="flex-1 px-2 py-3">
            {sidebarSections.map((section) => (
              <div key={section.title}>
                <div className="px-3 pb-1.5 pt-3 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">
                  {section.title}
                </div>
                {section.items.map((item) => {
                  const isActive = location.pathname === item.to;
                  const cls = `relative my-0.5 flex cursor-pointer items-center gap-2.5 rounded-[9px] px-3 py-2 text-[13px] font-medium transition-colors ${
                    isActive
                      ? "bg-primary-muted font-bold text-primary"
                      : "text-ink-3 hover:bg-surface-2 hover:text-ink-2"
                  }`;
                  const content = (
                    <>
                      {isActive && (
                        <span className="absolute -left-2 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r bg-primary" />
                      )}
                      <span className="flex w-[18px] justify-center text-[13px]">
                        {item.icon}
                      </span>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`ml-auto rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                            item.badge.tone === "r"
                              ? "bg-destructive-muted text-destructive"
                              : item.badge.tone === "a"
                                ? "bg-warning-muted text-warning"
                                : item.badge.tone === "g"
                                  ? "bg-success-muted text-success"
                                  : "bg-surface-2 text-ink-4"
                          }`}
                        >
                          {item.badge.text}
                        </span>
                      )}
                    </>
                  );
                  return (
                    <Link key={item.label} to={item.to} className={cls}>
                      {content}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="border-t border-border p-3">
            <div className="flex items-center gap-2 rounded-[10px] border border-border bg-surface-2 px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-brand text-[11px] font-extrabold text-white">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12px] font-semibold text-ink-2">
                  {displayName}
                </div>
                <div className="truncate text-[10px] text-ink-4">
                  {state.profile?.companyName || "IT Service"}
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border text-ink-4 hover:bg-surface-3 hover:text-ink-2"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </aside>

        <main className="overflow-x-hidden bg-background p-6">{children}</main>
      </div>
    </div>
  );
}
