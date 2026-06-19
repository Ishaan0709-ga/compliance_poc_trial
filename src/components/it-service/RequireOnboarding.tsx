import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useITService } from "@/lib/it-service/context";

/** Client-side guard — avoids SSR beforeLoad redirect loops */
export function RequireOnboarding({ children }: { children: ReactNode }) {
  const { isOnboarded } = useITService();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOnboarded) {
      navigate({ to: "/it-service/onboarding", replace: true });
    }
  }, [isOnboarded, navigate]);

  if (!isOnboarded) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[13px] text-ink-3">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}
