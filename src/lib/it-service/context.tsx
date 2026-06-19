import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import {
  addEvidence,
  applySchedulerResult,
  appendNotificationHistory,
  getDefaultState,
  loadState,
  markEvidenceComplete as markComplete,
  saveProfile,
  updateCalendarDueDate,
  clearCalendarDueDateOverride,
} from "./storage";
import { resolveUserMobile, setITServiceUserId } from "./auth";
import { runDailyNotificationScheduler } from "./notification-scheduler";
import { useWhatsAppActions } from "./use-whatsapp-actions";
import { ymd } from "./date-utils";
import { supabase } from "@/integrations/supabase/client";
import type { CompanyProfile, EvidenceRecord, ITServiceState } from "./types";

type ITServiceContextValue = {
  state: ITServiceState;
  user: User | null;
  userMobile: string | null;
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
  updateDueDate: (itemId: string, dueDate: string) => void;
  resetDueDate: (itemId: string) => void;
  hasProfile: boolean;
  isOnboarded: boolean;
};

const ITServiceContext = createContext<ITServiceContextValue | null>(null);

export function ITServiceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ITServiceState>(getDefaultState);
  const [user, setUser] = useState<User | null>(null);
  const schedulerRan = useRef(false);
  const { sendBatch } = useWhatsAppActions();

  const refresh = useCallback(() => {
    setState(loadState() || getDefaultState());
  }, []);

  const userMobile = resolveUserMobile(user, state.profile?.mobileNumber);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUser(data.user ?? null);
      setITServiceUserId(data.user?.id ?? null);
      refresh();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setITServiceUserId(session?.user?.id ?? null);
      schedulerRan.current = false;
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

  // Silent daily WhatsApp scheduler — backend only, no UI
  useEffect(() => {
    if (schedulerRan.current) return;
    if (!user?.id || !userMobile || !state.profile?.onboardingComplete) return;
    if (state.profile.whatsappEnabled === false) return;

    schedulerRan.current = true;
    const today = ymd(new Date());

    runDailyNotificationScheduler(sendBatch, state, user.id, userMobile).then((result) => {
      if (result === null) return;
      const next = applySchedulerResult(
        loadState() ?? state,
        result.sentNotificationIds,
        result.history,
        today
      );
      setState(next);
    });
  }, [user?.id, userMobile, state.profile?.onboardingComplete, state.profile?.whatsappEnabled, sendBatch, state]);

  const setProfile = useCallback((profile: CompanyProfile) => {
    const next = saveProfile(profile);
    setState(next);
    schedulerRan.current = false;
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

  const updateDueDate = useCallback((itemId: string, dueDate: string) => {
    const next = updateCalendarDueDate(itemId, dueDate);
    if (next) setState(next);
  }, []);

  const resetDueDate = useCallback((itemId: string) => {
    const next = clearCalendarDueDateOverride(itemId);
    if (next) setState(next);
  }, []);

  return (
    <ITServiceContext.Provider
      value={{
        state,
        user,
        userMobile,
        refresh,
        setProfile,
        uploadEvidence,
        markEvidenceComplete,
        updateDueDate,
        resetDueDate,
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
