import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  addEvidence,
  getDefaultState,
  loadState,
  markEvidenceComplete as markComplete,
  saveProfile,
} from "./storage";
import { setITServiceUserId } from "./auth";
import { supabase } from "@/integrations/supabase/client";
import type { CompanyProfile, EvidenceRecord, ITServiceState } from "./types";

type ITServiceContextValue = {
  state: ITServiceState;
  refresh: () => void;
  setProfile: (profile: CompanyProfile) => ITServiceState;
  uploadEvidence: (
    record: Omit<EvidenceRecord, "id" | "uploadedAt" | "validationStatus">
  ) => void;
  markEvidenceComplete: (record: {
    companyId: string;
    complianceId: string;
    calendarItemId?: string;
  }) => void;
  hasProfile: boolean;
  isOnboarded: boolean;
};

const ITServiceContext = createContext<ITServiceContextValue | null>(null);

export function ITServiceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ITServiceState>(getDefaultState);

  const refresh = useCallback(() => {
    setState(loadState() || getDefaultState());
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setITServiceUserId(data.user?.id ?? null);
      refresh();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setITServiceUserId(session?.user?.id ?? null);
      refresh();
    });

    const handler = () => refresh();
    window.addEventListener("it-service-update", handler);
    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener("it-service-update", handler);
    };
  }, [refresh]);

  const setProfile = useCallback((profile: CompanyProfile) => {
    const next = saveProfile(profile);
    setState(next);
    return next;
  }, []);

  const uploadEvidence = useCallback(
    (record: Omit<EvidenceRecord, "id" | "uploadedAt" | "validationStatus">) => {
      const next = addEvidence(record);
      if (next) setState(next);
    },
    []
  );

  const markEvidenceComplete = useCallback(
    (record: { companyId: string; complianceId: string; calendarItemId?: string }) => {
      const next = markComplete(record);
      if (next) setState(next);
    },
    []
  );

  return (
    <ITServiceContext.Provider
      value={{
        state,
        refresh,
        setProfile,
        uploadEvidence,
        markEvidenceComplete,
        hasProfile: !!state.profile,
        isOnboarded: !!state.profile?.onboardingComplete,
      }}
    >
      {children}
    </ITServiceContext.Provider>
  );
}

export function useITService() {
  const ctx = useContext(ITServiceContext);
  if (!ctx) throw new Error("useITService must be used within ITServiceProvider");
  return ctx;
}
