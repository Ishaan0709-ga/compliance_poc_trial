import { Link, useLocation } from "@tanstack/react-router";
import { ShieldCheck, Search, Bell, Sparkles } from "lucide-react";
import { INDUSTRIES, type IndustryId } from "@/lib/industries";
import type { ReactNode } from "react";

interface AppShellProps {
  industryId: IndustryId;
  children: ReactNode;
  sidebarSections?: SidebarSection[];
}

export interface SidebarItem {
  label: string;
  to?: string;
  badge?: { text: string; tone: "r" | "a" | "g" | "n" };
  icon?: ReactNode;
  active?: boolean;
}
export interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

export function AppShell({ industryId, children, sidebarSections = [] }: AppShellProps) {
  const industry = INDUSTRIES.find((i) => i.id === industryId)!;
  const Icon = industry.icon;
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Topbar */}
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
              placeholder={`Search ${industry.name.toLowerCase()} compliance…`}
              className="w-[220px] bg-transparent text-[13px] outline-none placeholder:text-ink-4"
            />
          </div>
          <button className="relative flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-border bg-surface-2 hover:bg-surface-3">
            <Bell className="h-4 w-4 text-ink-3" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full border border-surface bg-destructive" />
          </button>
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-gradient-brand text-xs font-extrabold text-primary-foreground">
            AK
          </div>
        </div>
      </header>

      <div className="grid flex-1 md:grid-cols-[228px_1fr]">
        {/* Sidebar */}
        <aside className="sticky top-[60px] hidden h-[calc(100vh-60px)] flex-col overflow-y-auto border-r border-border bg-surface md:flex">
          <div className="flex-1 px-2 py-3">
            {sidebarSections.map((section) => (
              <div key={section.title}>
                <div className="px-3 pb-1.5 pt-3 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">
                  {section.title}
                </div>
                {section.items.map((item) => {
                  const isActive =
                    item.active ?? (item.to ? location.pathname === item.to : false);
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
                  return item.to ? (
                    <Link key={item.label} to={item.to} className={cls}>
                      {content}
                    </Link>
                  ) : (
                    <div key={item.label} className={cls}>
                      {content}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="border-t border-border p-3">
            <div className="flex items-center gap-2 rounded-[10px] border border-border bg-surface-2 px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-brand text-[11px] font-extrabold text-white">
                AK
              </div>
              <div>
                <div className="text-[12px] font-semibold text-ink-2">Aarav Kapoor</div>
                <div className="text-[10px] text-ink-4">Chief Compliance Officer</div>
              </div>
            </div>
          </div>
        </aside>

        <main className="overflow-x-hidden bg-background p-6">{children}</main>
      </div>
    </div>
  );
}
