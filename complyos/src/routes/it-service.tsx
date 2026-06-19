import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useLocation } from "@tanstack/react-router";
import { ITServiceProvider } from "@/lib/it-service/context";
import { RequireAuth } from "@/components/it-service/RequireAuth";
import { loadState } from "@/lib/it-service/storage";

export const Route = createFileRoute("/it-service")({
  head: () => ({
    meta: [{ title: "IT Service Compliance — ComplyOS" }],
  }),
  beforeLoad: ({ location }) => {
    const path = location.pathname.replace(/\/$/, "");
    if (path !== "/it-service") return;
    if (typeof window === "undefined") return;

    const state = loadState();
    if (!state?.profile?.onboardingComplete) {
      throw redirect({ to: "/it-service/login" });
    }
    throw redirect({ to: "/it-service/dashboard" });
  },
  component: ITServiceLayout,
});

function ITServiceLayout() {
  const location = useLocation();
  const isPublic =
    location.pathname === "/it-service/login" ||
    location.pathname === "/it-service/login/";

  return (
    <ITServiceProvider>
      {isPublic ? (
        <Outlet />
      ) : (
        <RequireAuth>
          <Outlet />
        </RequireAuth>
      )}
    </ITServiceProvider>
  );
}
