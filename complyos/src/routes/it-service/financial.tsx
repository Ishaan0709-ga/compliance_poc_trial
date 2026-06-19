import { createFileRoute } from "@tanstack/react-router";
import { DomainPage } from "@/components/it-service/DomainPage";
import { RequireOnboarding } from "@/components/it-service/RequireOnboarding";

export const Route = createFileRoute("/it-service/financial")({
  component: () => (
    <RequireOnboarding>
      <DomainPage domainId="FIN" />
    </RequireOnboarding>
  ),
});
