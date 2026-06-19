import { createFileRoute } from "@tanstack/react-router";
import { DomainPage } from "@/components/it-service/DomainPage";
import { RequireOnboarding } from "@/components/it-service/RequireOnboarding";

export const Route = createFileRoute("/it-service/privacy")({
  component: () => (
    <RequireOnboarding>
      <DomainPage domainId="DPP" />
    </RequireOnboarding>
  ),
});
