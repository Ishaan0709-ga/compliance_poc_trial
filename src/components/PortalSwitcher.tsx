import { Link, useLocation } from "@tanstack/react-router";

const AUTHENTICATED_PORTALS = [
  { id: "founder", label: "Founder", to: "/founder" },
  { id: "it-service", label: "IT Service", to: "/it-service/dashboard" },
] as const;

const PUBLIC_PORTALS = [
  { id: "founder", label: "Founder", to: "/login", search: { mode: "signin" as const } },
  { id: "it-service", label: "IT Service", to: "/it-service/login" },
] as const;

type PortalSwitcherProps = {
  variant?: "default" | "onDark";
  mode?: "authenticated" | "public";
};

export function PortalSwitcher({ variant = "default", mode = "authenticated" }: PortalSwitcherProps) {
  const location = useLocation();
  const portals = mode === "public" ? PUBLIC_PORTALS : AUTHENTICATED_PORTALS;

  const activeId = location.pathname.startsWith("/it-service")
    ? "it-service"
    : location.pathname.startsWith("/founder")
      ? "founder"
      : location.pathname === "/login"
        ? "founder"
        : location.pathname === "/it-service/login"
          ? "it-service"
          : null;

  const shell =
    variant === "onDark"
      ? "border-white/10 bg-white/5"
      : "border-border bg-surface-2";
  const active =
    variant === "onDark"
      ? "bg-white/15 font-medium text-white"
      : "bg-surface font-medium text-ink shadow-sm";
  const inactive =
    variant === "onDark"
      ? "text-white/55 hover:text-white/85"
      : "text-ink-4 hover:text-ink-2";

  return (
    <nav
      aria-label="Switch portal"
      className={`flex items-center gap-0.5 rounded-full border p-0.5 text-[11px] ${shell}`}
    >
      {portals.map((portal) => {
        const isActive = portal.id === activeId;
        return (
          <Link
            key={portal.id}
            to={portal.to}
            search={"search" in portal ? portal.search : undefined}
            className={`rounded-full px-2.5 py-1 transition-colors ${
              isActive ? active : inactive
            }`}
          >
            {portal.label}
          </Link>
        );
      })}
    </nav>
  );
}
