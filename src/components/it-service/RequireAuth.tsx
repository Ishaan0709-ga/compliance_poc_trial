import { useEffect, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { setITServiceUserId } from "@/lib/it-service/auth";
import type { User } from "@supabase/supabase-js";

export function RequireAuth({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user ?? null;
      setITServiceUserId(u?.id ?? null);
      setUser(u);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setITServiceUserId(u?.id ?? null);
      setUser(u);
      window.dispatchEvent(new CustomEvent("it-service-update"));
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user === null) {
      navigate({
        to: "/it-service/login",
        search: { redirect: location.pathname },
        replace: true,
      });
    }
  }, [user, navigate, location.pathname]);

  if (user === undefined) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-[13px] text-ink-3">
        Checking session…
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
