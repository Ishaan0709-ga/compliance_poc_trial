import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useITService } from "@/lib/it-service/context";
import { ITServiceShell } from "@/components/it-service/ITServiceShell";
import { RequireOnboarding } from "@/components/it-service/RequireOnboarding";
import { PageHeader, Card, Btn } from "@/components/ui-kit";
import { clearState } from "@/lib/it-service/storage";
import { signOutITService } from "@/lib/it-service/auth";

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
  const { state, refresh } = useITService();
  const navigate = useNavigate();
  const p = state.profile;

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

  return (
    <ITServiceShell>
      <PageHeader title="Settings" subtitle="Company profile and module preferences." />

      <Card title="Company profile" className="mb-4">
        {p && (
          <dl className="grid gap-2 text-[13px] md:grid-cols-2">
            {[
              ["Company", p.companyName],
              ["Entity", p.entityType.replace(/_/g, " ")],
              ["Industry", p.industry],
              ["Employees", String(p.employeeCount)],
              ["Women employees", String(p.womenEmployees)],
              ["GST registered", p.gstRegistered ? "Yes" : "No"],
              ["Personal data", p.handlesPersonalData ? "Yes" : "No"],
              ["Countries", p.countriesServed.join(", ")],
              ["Contact", p.primaryContact],
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
