import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ShieldCheck, Server } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Btn } from "@/components/ui-kit";
import { useITService } from "@/lib/it-service/context";
import type { EntityType } from "@/lib/it-service/types";

export const Route = createFileRoute("/it-service/onboarding")({
  head: () => ({
    meta: [{ title: "IT Service Onboarding — ComplyOS" }],
  }),
  component: OnboardingPage,
});

const ENTITY_OPTIONS: { value: EntityType; label: string }[] = [
  { value: "llp", label: "LLP" },
  { value: "opc", label: "OPC" },
  { value: "proprietorship", label: "Proprietorship" },
  { value: "partnership", label: "Partnership" },
];

function OnboardingPage() {
  const navigate = useNavigate();
  const { isOnboarded } = useITService();
  const [step, setStep] = useState<"pvt" | "entity">("pvt");

  useEffect(() => {
    if (isOnboarded) {
      navigate({ to: "/it-service/dashboard", replace: true });
    }
  }, [isOnboarded, navigate]);

  const handlePvtAnswer = (yes: boolean) => {
    if (yes) {
      sessionStorage.setItem("its-entity-type", "private_limited");
      navigate({ to: "/it-service/profile" });
    } else {
      setStep("entity");
    }
  };

  const handleEntitySelect = (entity: EntityType) => {
    sessionStorage.setItem("its-entity-type", entity);
    navigate({ to: "/it-service/profile" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-onboard text-white">
      <header className="flex items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-primary text-primary-foreground">
            <ShieldCheck className="h-4 w-4" strokeWidth={2.4} />
          </div>
          <span className="text-[16px] font-extrabold tracking-[-0.03em]">
            Comply<span className="text-[oklch(0.78_0.12_265)]">OS</span>
          </span>
        </Link>
        <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold">
          <Server className="h-3.5 w-3.5" />
          IT Service
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-6 pb-20">
        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
          {step === "pvt" ? (
            <>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">
                Step 1 of 2
              </div>
              <h1 className="text-[28px] font-extrabold tracking-[-0.03em]">
                Is your company Private Limited?
              </h1>
              <p className="mt-2 text-[14px] text-white/60">
                This determines which corporate governance and MCA compliances apply to your organization.
              </p>
              <div className="mt-8 flex gap-3">
                <Btn
                  className="flex-1 justify-center !bg-primary !text-primary-foreground"
                  onClick={() => handlePvtAnswer(true)}
                >
                  Yes
                </Btn>
                <Btn
                  variant="o"
                  className="flex-1 justify-center !border-white/20 !bg-white/10 !text-white hover:!bg-white/20"
                  onClick={() => handlePvtAnswer(false)}
                >
                  No
                </Btn>
              </div>
            </>
          ) : (
            <>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">
                Step 2 of 2
              </div>
              <h1 className="text-[28px] font-extrabold tracking-[-0.03em]">
                Select entity type
              </h1>
              <p className="mt-2 text-[14px] text-white/60">
                Choose your legal entity structure to configure applicable compliance rules.
              </p>
              <div className="mt-8 grid gap-2">
                {ENTITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleEntitySelect(opt.value)}
                    className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-left text-[14px] font-semibold transition-colors hover:bg-white/15"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep("pvt")}
                className="mt-4 text-[13px] text-white/50 hover:text-white/80"
              >
                ← Back
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
