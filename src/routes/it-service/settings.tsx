import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { useITService } from "@/lib/it-service/context";
import { ITServiceShell } from "@/components/it-service/ITServiceShell";
import { RequireOnboarding } from "@/components/it-service/RequireOnboarding";
import { PageHeader, Card, Btn, Pill } from "@/components/ui-kit";
import {
  applySchedulerResult,
  clearNotificationRunDate,
  clearState,
  loadState,
  updateCalendarDueDate,
} from "@/lib/it-service/storage";
import { demoDueDateTenDaysFromToday, pickDemoCalendarItem } from "@/lib/it-service/demo-reminder";
import { runWhatsAppDemo } from "@/lib/it-service/notification-scheduler";
import { formatPhoneDisplay, getUserMobileNumber, signOutITService } from "@/lib/it-service/auth";
import { getEntityTypeLabel, getIndustryLabel, DEFAULT_COUNTRY } from "@/lib/it-service/profile-options";
import { getCompliance } from "@/lib/it-service/master-data";
import { ymd } from "@/lib/it-service/date-utils";

export const Route = createFileRoute("/it-service/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <RequireOnboarding>
      <SettingsContent />
    </RequireOnboarding>
  );
}

function SettingsContent() {
  const { state, refresh, user, userMobile } = useITService();
  const navigate = useNavigate();
  const p = state.profile;
  const [waBusy, setWaBusy] = useState(false);
  const [waStatus, setWaStatus] = useState<string | null>(null);

  const handleSignOut = async () => {
    await signOutITService();
    navigate({ to: "/it-service/login", replace: true });
  };

  const handleReset = () => {
    if (confirm("Reset all IT Service data and restart onboarding?")) {
      clearState();
      refresh();
      navigate({ to: "/it-service/onboarding" });
    }
  };

  const handleWhatsAppDemo = async () => {
    if (!user?.id || !userMobile) {
      setWaStatus("Sign in with your mobile number first.");
      return;
    }
    setWaBusy(true);
    setWaStatus(null);
    try {
      clearNotificationRunDate();
      const demoDue = demoDueDateTenDaysFromToday();
      const target = pickDemoCalendarItem(state);
      if (target) {
        updateCalendarDueDate(target.id, demoDue);
      }
      const fresh = loadState() ?? state;
      const compName = target
        ? getCompliance(target.complianceId)?.name ?? "Compliance item"
        : "Compliance item";

      const result = await runWhatsAppDemo(state, user.id, userMobile, fresh);
      applySchedulerResult(
        loadState() ?? fresh,
        result.sentNotificationIds,
        result.history,
        ymd(new Date())
      );
      refresh();

      if (result.dispatched > 0) {
        setWaStatus(
          `Reminder sent to ${formatPhoneDisplay(userMobile)} · ${compName} due ${demoDue} (10-day window). Check WhatsApp.`
        );
      } else {
        setWaStatus(
          "Could not send — verify Twilio sandbox join & .env vars, then try again."
        );
      }
    } catch (e) {
      setWaStatus(e instanceof Error ? e.message : "WhatsApp send failed");
    } finally {
      setWaBusy(false);
    }
  };

  const lastDelivery = state.notificationHistory?.[state.notificationHistory.length - 1];

  return (
    <ITServiceShell>
      <PageHeader title="Settings" subtitle="Company profile and module preferences." />

      <Card title="WhatsApp reminders" className="mb-4">
        <p className="text-[13px] text-ink-3">
          Reminders go to your logged-in mobile only. Messages never appear in the app UI.
        </p>
        <dl className="mt-3 grid gap-2 text-[13px] md:grid-cols-2">
          <div>
            <dt className="text-[11px] font-bold uppercase text-ink-4">Your number</dt>
            <dd className="font-medium text-ink-2">
              {userMobile ? formatPhoneDisplay(userMobile) : "Not available — sign in with phone"}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold uppercase text-ink-4">WhatsApp enabled</dt>
            <dd className="font-medium text-ink-2">{p?.whatsappEnabled !== false ? "Yes" : "No"}</dd>
          </div>
          {lastDelivery && (
            <div className="md:col-span-2">
              <dt className="text-[11px] font-bold uppercase text-ink-4">Last delivery</dt>
              <dd className="mt-1 flex flex-wrap items-center gap-2">
                <Pill tone={lastDelivery.deliveryStatus === "delivered" ? "done" : lastDelivery.deliveryStatus === "failed" ? "miss" : "pend"}>
                  {lastDelivery.deliveryStatus === "delivered"
                    ? "✓ Delivered"
                    : lastDelivery.deliveryStatus === "failed"
                      ? "✗ Failed"
                      : "⌛ Queued"}
                </Pill>
                <span className="text-[12px] text-ink-3">
                  {new Date(lastDelivery.sentAt).toLocaleString("en-IN")}
                </span>
              </dd>
            </div>
          )}
        </dl>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Btn variant="o" onClick={handleWhatsAppDemo} disabled={waBusy || !userMobile}>
            {waBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MessageCircle className="h-3.5 w-3.5" />}
            Send test reminder (10-day demo)
          </Btn>
        </div>
        {waStatus && (
          <p className="mt-3 rounded-lg border border-border bg-surface-2/60 px-3 py-2 text-[12px] text-ink-2">
            {waStatus}
          </p>
        )}
        <p className="mt-2 text-[11px] text-ink-4">
          Twilio sandbox: send <code className="rounded bg-surface-2 px-1">join &lt;keyword&gt;</code> to +1 415 523 8886 from your phone first.
        </p>
      </Card>

      <Card title="Company profile" className="mb-4">
        {p && (
          <dl className="grid gap-2 text-[13px] md:grid-cols-2">
            {[
              ["Company", p.companyName],
              ["Entity", getEntityTypeLabel(p.entityType)],
              ["Industry", getIndustryLabel(p.industry)],
              ["Employees", String(p.employeeCount)],
              ["Women employees", String(p.womenEmployees)],
              ["GST registered", p.gstRegistered ? "Yes" : "No"],
              ["Personal data", p.handlesPersonalData ? "Yes" : "No"],
              ["Country", DEFAULT_COUNTRY],
              ["Mobile", userMobile ? formatPhoneDisplay(userMobile) : "—"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[11px] font-bold uppercase text-ink-4">{k}</dt>
                <dd className="font-medium text-ink-2">{v}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="mt-4 flex gap-2">
          <Btn variant="o" onClick={() => navigate({ to: "/it-service/profile" })}>
            Edit profile
          </Btn>
        </div>
      </Card>

      <Card title="Role-based access">
        <p className="text-[13px] text-ink-3">
          Roles (CEO, CFO, HR, Compliance Head) filter visible domains by owner function.
          Full RBAC integration available when connected to Supabase auth.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-[12px]">
          {["CEO", "CFO", "HR", "Compliance Head"].map((role) => (
            <span key={role} className="rounded-lg border border-border bg-surface-2 px-3 py-1 font-medium">
              {role}
            </span>
          ))}
        </div>
      </Card>

      <Card title="Account" className="mb-4">
        <p className="text-[13px] text-ink-3">
          Sign out to switch mobile number or use another account. Your compliance data is saved per login.
        </p>
        <div className="mt-4">
          <Btn variant="o" onClick={handleSignOut}>
            Sign out
          </Btn>
        </div>
      </Card>

      <Card title="Danger zone" className="mt-4">
        <Btn variant="d" onClick={handleReset}>
          Reset IT Service module
        </Btn>
      </Card>
    </ITServiceShell>
  );
}
