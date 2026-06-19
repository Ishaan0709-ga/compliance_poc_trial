import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Search, Bell, LogOut, PanelLeftClose, PanelLeftOpen, Menu, X } from "lucide-react";
import graeLogo from "@/assets/grae-logo.png";
import { useState, type ReactNode } from "react";
import { PORTALS, type PortalId } from "@/lib/portals";
import { supabase } from "@/integrations/supabase/client";

export function PortalShell({
  portalId,
  children,
}: {
  portalId: PortalId;
  children: ReactNode;
}) {
  const portal = PORTALS[portalId];
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  const NavList = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {portal.nav.map((section) => (
        <div key={section.title}>
          {!collapsed && (
            <div className="px-3 pb-1.5 pt-3 text-[10px] uppercase tracking-[0.1em] text-ink-4">
              {section.title}
            </div>
          )}
          {section.items.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                title={collapsed ? item.label : undefined}
                className={`relative my-0.5 flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors ${
                  collapsed ? "justify-center" : ""
                } ${
                  active
                    ? "bg-primary-muted/70 font-medium text-primary"
                    : "font-normal text-ink-3 hover:bg-surface-2 hover:text-ink-2"
                }`}
              >
                {active && (
                  <span className="absolute -left-2 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r bg-gradient-aurora" />
                )}
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className="ml-auto rounded bg-destructive-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-destructive">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 flex h-[60px] items-center justify-between gap-2 border-b border-border bg-surface px-4 shadow-card md:px-6">
        <div className="flex min-w-0 items-center gap-2 md:gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 text-ink-2 hover:bg-surface-3 md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <img src={graeLogo} alt="Grae" className="h-7 w-auto invert dark:invert-0 opacity-90" />
          </Link>
          <div className="mx-2 hidden h-6 w-px bg-border sm:block" />
          <div className={`hidden rounded-full border border-border bg-surface-2 px-3 py-1 text-[11px] font-medium sm:block ${portal.accent}`}>
            {portal.name}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-[9px] border border-border bg-surface-2 px-3 py-1.5 md:flex">
            <Search className="h-3.5 w-3.5 text-ink-4" />
            <input
              placeholder="Search orders, documents…"
              className="w-[220px] bg-transparent text-[13px] outline-none placeholder:text-ink-4"
            />
          </div>
          <button className="relative flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-border bg-surface-2 hover:bg-surface-3">
            <Bell className="h-4 w-4 text-ink-3" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full border border-surface bg-destructive" />
          </button>
          <button
            onClick={handleSignOut}
            className="hidden h-[34px] items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 text-[12px] font-medium text-ink-3 hover:bg-surface-3 sm:flex"
          >
            <LogOut className="h-3.5 w-3.5" /> Switch
          </button>
          <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-gradient-brand text-[11px] font-semibold text-primary-foreground">
            {portal.user.initials}
          </div>
        </div>
      </header>

      <div className={`grid flex-1 transition-[grid-template-columns] duration-200 ${collapsed ? "md:grid-cols-[64px_1fr]" : "md:grid-cols-[240px_1fr]"}`}>
        <aside className="sticky top-[60px] hidden h-[calc(100vh-60px)] flex-col overflow-y-auto border-r border-border bg-gradient-surface md:flex">
          <div className={`flex items-center justify-between px-3 py-3 ${collapsed ? "flex-col gap-2" : ""}`}>
            {!collapsed && (
              <div className="px-1">
                <div className="text-[10px] uppercase tracking-[0.12em] text-ink-4">{portal.role}</div>
                <div className="mt-0.5 text-[14px] font-semibold tracking-[-0.01em] text-ink">{portal.user.name}</div>
                <div className="text-[11px] text-ink-4">{portal.user.sub}</div>
              </div>
            )}
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface text-ink-3 hover:bg-surface-2 hover:text-ink"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeftOpen className="h-3.5 w-3.5" /> : <PanelLeftClose className="h-3.5 w-3.5" />}
            </button>
          </div>
          <div className="flex-1 px-2 pb-4">
            <NavList />
          </div>
        </aside>

        <main className="overflow-x-hidden bg-background p-4 md:p-6">{children}</main>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[280px] flex-col overflow-y-auto border-r border-border bg-surface shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.12em] text-ink-4">{portal.role}</div>
                <div className="text-[14px] font-semibold text-ink">{portal.user.name}</div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface-2 text-ink-3"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 px-2 py-2">
              <NavList onNavigate={() => setMobileOpen(false)} />
            </div>
            <button
              onClick={handleSignOut}
              className="m-3 flex h-10 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-2 text-[13px] font-medium text-ink-2"
            >
              <LogOut className="h-3.5 w-3.5" /> Switch portal
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
