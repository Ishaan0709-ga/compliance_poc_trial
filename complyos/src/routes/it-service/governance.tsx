import { createFileRoute } from "@tanstack/react-router";
import { DomainPage } from "@/components/it-service/DomainPage";
import { RequireOnboarding } from "@/components/it-service/RequireOnboarding";

export const Route = createFileRoute("/it-service/governance")({
  component: GovernancePage,
});

function GovernancePage() {
  return (
    <RequireOnboarding>
      <DomainPage domainId="GOV" />
    </RequireOnboarding>
  );
}
